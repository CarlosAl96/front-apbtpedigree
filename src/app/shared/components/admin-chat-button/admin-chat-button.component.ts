import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { Chat } from '../../../core/models/chat';
import { Message } from '../../../core/models/message';
import { QueryPagination } from '../../../core/models/queryPagination';
import { User } from '../../../core/models/user';
import { LinkifyPipe } from '../../../core/pipes/linkify.pipe';
import { TimeFormatPipe } from '../../../core/pipes/time-format.pipe';
import { ChatService } from '../../../core/services/chat.service';
import { SessionService } from '../../../core/services/session.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-admin-chat-button',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    InputGroupModule,
    InputTextModule,
    LinkifyPipe,
    TimeFormatPipe,
    TranslocoModule,
    TooltipModule,
  ],
  templateUrl: './admin-chat-button.component.html',
  styleUrl: './admin-chat-button.component.scss',
})
export class AdminChatButtonComponent implements OnDestroy {
  @ViewChild('supportMessages') private supportMessages!: ElementRef;

  public readonly adminId = 1;
  public readonly adminUsername = 'Admin';
  private readonly hiddenRoutes = ['/messages', '/stream-chat', '/stream'];
  public user: User | undefined;
  public isOpen: boolean = false;
  public isHiddenRoute: boolean = false;
  public chats: Chat[] = [];
  public selectedChat: Chat | null = null;
  public messages: Message[] = [];
  public messageModel: string = '';
  public totalRows: number = 0;
  private readonly routeSubscription: Subscription;
  public queryPagination: QueryPagination = {
    page: 0,
    size: 50,
  };

  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
    private readonly socketService: SocketService,
    private readonly router: Router
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
    this.isHiddenRoute = this.shouldHideOnRoute(this.router.url);

    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHiddenRoute = this.shouldHideOnRoute(event.urlAfterRedirects);

        if (this.isHiddenRoute) {
          this.isOpen = false;
        }
      }
    });

    this.socketService.onSupportChat().subscribe({
      next: (res) => {
        if (!this.user || !this.isSupportParticipant(res)) {
          return;
        }

        this.loadSupportChats();
      },
    });

    this.socketService.onMessage().subscribe({
      next: (res) => {
        if (res.chat_type !== 'support' || !this.selectedChat) {
          return;
        }

        if (
          this.selectedChat.id === res.id_chat ||
          (this.selectedChat.id === 0 && res.id_sender === this.user?.id)
        ) {
          this.selectedChat.id = res.id_chat;
          this.getMessages({ page: 0, size: 50 });
        }
      },
    });
  }

  public get showButton(): boolean {
    return !!this.user && !this.isHiddenRoute;
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  public get isSupportAdmin(): boolean {
    return this.user?.id === this.adminId;
  }

  public toggleSupport(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.ensureUserDraftChat();
      this.loadSupportChats();
    }
  }

  public loadSupportChats(): void {
    this.chatService.getSupportChats().subscribe({
      next: (res) => {
        this.chats = res.response.map((chat) => this.normalizeChat(chat));

        if (this.isSupportAdmin) {
          const selected = this.chats.find(
            (chat) => chat.id === this.selectedChat?.id
          );
          this.selectedChat = selected || this.chats[0] || null;
        } else {
          this.selectedChat = this.chats[0] || this.createDraftSupportChat();
        }

        if (this.selectedChat?.id) {
          this.getMessages({ page: 0, size: 50 });
        } else {
          this.messages = [];
        }
      },
      error: () => {
        this.ensureUserDraftChat();
      },
    });
  }

  public selectChat(chat: Chat): void {
    this.selectedChat = this.normalizeChat(chat);
    this.getMessages({ page: 0, size: 50 });
  }

  public getMessages(query: QueryPagination): void {
    if (!this.selectedChat || this.selectedChat.id <= 0) {
      this.messages = [];
      return;
    }

    this.chatService.markAsViewedChat(this.selectedChat.id).subscribe({
      next: () => {},
      error: () => {},
    });

    this.chatService.getMessages(query, this.selectedChat.id).subscribe({
      next: (res) => {
        this.queryPagination = query;
        this.messages = res.response.data.reverse();
        this.totalRows = res.response.totalRows;
        this.scrollToBottom();
      },
      error: () => {},
    });
  }

  public sendMessage(): void {
    if (!this.user || !this.selectedChat || !this.messageModel.trim()) {
      return;
    }

    const message: Message = {
      id: 0,
      id_chat: this.selectedChat.id,
      id_sender: this.user.id,
      id_receiver: this.selectedChat.im_first
        ? this.selectedChat.id_user_two
        : this.selectedChat.id_user_one,
      message: this.messageModel.trim(),
      img: null,
      audio: null,
      created_at: new Date(),
    };

    this.messages.push(message);
    this.messageModel = '';
    this.scrollToBottom();

    this.chatService
      .sendSupportMessage(message, this.selectedChat.im_first ?? false)
      .subscribe({
        next: (res) => {
          this.selectedChat!.id = res.response;
          this.loadSupportChats();
        },
        error: () => {},
      });
  }

  public clearSelectedChat(): void {
    if (!this.selectedChat?.id) {
      this.messages = [];
      return;
    }

    const deletedChatId = this.selectedChat.id;

    this.chatService.deleteChat(deletedChatId).subscribe({
      next: () => {
        this.messages = [];

        if (this.isSupportAdmin) {
          this.chats = this.chats.filter((chat) => chat.id !== deletedChatId);
          this.selectedChat = this.chats[0] || null;

          if (this.selectedChat) {
            this.getMessages({ page: 0, size: 50 });
          }
          return;
        }

        this.selectedChat = this.createDraftSupportChat();
      },
      error: () => {},
    });
  }

  public deleteSupportChat(chat: Chat, event: Event): void {
    event.stopPropagation();

    this.chatService.deleteChat(chat.id).subscribe({
      next: () => {
        this.chats = this.chats.filter((supportChat) => supportChat.id !== chat.id);

        if (this.selectedChat?.id === chat.id) {
          this.selectedChat = this.chats[0] || null;
          this.messages = [];

          if (this.selectedChat) {
            this.getMessages({ page: 0, size: 50 });
          }
        }
      },
      error: () => {},
    });
  }

  public deleteSupportMessage(message: Message): void {
    if (!message.id || !this.canDeleteMessage(message)) {
      return;
    }

    this.chatService.deleteMessage(message.id).subscribe({
      next: () => {
        this.messages = this.messages.filter(
          (supportMessage) => supportMessage.id !== message.id
        );
        this.loadSupportChats();
      },
      error: () => {},
    });
  }

  public getOtherUsername(chat: Chat): string {
    if (chat.id_user_one === this.user?.id) {
      return chat.username_two;
    }

    return chat.username_one;
  }

  public canDeleteMessage(message: Message): boolean {
    return this.isSupportAdmin || message.id_sender === this.user?.id;
  }

  private normalizeChat(chat: Chat): Chat {
    return {
      ...chat,
      chat_type: 'support',
      im_first: chat.id_user_one === this.user?.id,
    };
  }

  private createDraftSupportChat(): Chat {
    return {
      id: 0,
      id_user_one: this.user?.id ?? 0,
      id_user_two: this.adminId,
      username_one: this.user?.username ?? '',
      username_two: this.adminUsername,
      img_one: this.user?.picture ?? '',
      img_two: null,
      viewed_one: true,
      viewed_two: false,
      is_deleted_one: false,
      is_deleted_two: false,
      chat_type: 'support',
      last_message: null,
      im_first: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private ensureUserDraftChat(): void {
    if (!this.isSupportAdmin && !this.selectedChat) {
      this.selectedChat = this.createDraftSupportChat();
      this.messages = [];
    }
  }

  private isSupportParticipant(res: any): boolean {
    return (
      this.isSupportAdmin ||
      res.id_one === this.user?.id ||
      res.id_two === this.user?.id
    );
  }

  private shouldHideOnRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];

    return this.hiddenRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.supportMessages?.nativeElement;

      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }
}
