import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { Chat } from '../../../core/models/chat';
import { TimeFormatPipe } from '../../../core/pipes/time-format.pipe';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { ChatService } from '../../../core/services/chat.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { SocketService } from '../../../core/services/socket.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chats-list',
  standalone: true,
  imports: [
    TranslocoModule,
    ButtonModule,
    TimeFormatPipe,
    AutoCompleteModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './chats-list.component.html',
  styleUrl: './chats-list.component.scss',
})
export class ChatsListComponent {
  public user!: User | undefined;
  public userReceiver!: User;
  public usernameFromForum: string = '';
  public idChatSelected: number = 0;
  public chats: Chat[] = [];
  public filteredUsers: User[] = [];
  public selectedUser!: User;
  public urlImg: string = `${environment.uploads_url}users/`;

  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService,
    private readonly route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['user']) {
        this.usernameFromForum = params['user'] as string;
      }
    });

    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
    this.socketService.onChat().subscribe({
      next: (res) => {
        if (res.id_one == this.user?.id || res.id_two == this.user?.id) {
          this.getChats();
        }
      },
    });

    this.chatService.getChatSelected().subscribe({
      next: (res) => {
        this.idChatSelected = res.id;
      },
    });
    this.getChats();
  }

  private getChats(): void {
    this.chatService.getChats().subscribe({
      next: (res) => {
        this.chats = res.response;
        this.chats = this.chats.map((chat) => {
          chat.im_first = this.getImFirst(chat.id_user_one, chat.id_user_two);
          return chat;
        });

        this.chats = this.chats.filter(
          (chat) =>
            !(
              (chat.im_first && chat.is_deleted_one) ||
              (!chat.im_first && chat.is_deleted_two)
            )
        );
        if (this.usernameFromForum != '') {
          this.searchUsers(this.usernameFromForum, true);
        }
      },
      error: (error) => {},
    });
  }

  public setChatActive(chat: Chat) {
    this.chatService.setChatSelected(chat);
    this.idChatSelected = chat.id;

    if (chat.id > 0) {
      this.chats = this.chats.filter((chat) => chat.id > 0);
    }
  }

  public searchUsers(query: string, fromForum: boolean = false): void {
    this.authService.searchUsers(query).subscribe({
      next: (res) => {
        if (fromForum) {
          this.userReceiver = res.response.filter(
            (user) => user.username == query
          )[0];

          if (this.userReceiver) {
            this.createChat(this.userReceiver);
          }
        } else {
          this.filteredUsers = res.response;
        }
      },
      error: (error) => {},
    });
  }

  public createChat(userReceiver: User): void {
    const newChat: Chat = {
      id: 0,
      id_user_one: this.user?.id ?? 0,
      id_user_two: userReceiver.id,
      username_one: this.user?.username ?? '',
      username_two: userReceiver.username,
      img_one: this.user?.picture ?? '',
      img_two: userReceiver.picture ?? '',
      viewed_one: true,
      viewed_two: false,
      is_deleted_one: false,
      is_deleted_two: false,
      last_message: {
        id: 0,
        id_chat: 0,
        id_sender: 0,
        id_receiver: 0,
        username_sender: '',
        img_sender: '',
        message: '',
        img: null,
        created_at: new Date(),
      },
      im_first: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const existChat: Chat[] = this.chats.filter(
      (chat) =>
        chat.username_one == userReceiver.username ||
        chat.username_two == userReceiver.username
    );

    this.chats = this.chats.filter((chat) => chat.id != 0);

    if (existChat.length) {
      this.idChatSelected = existChat[0].id;
      this.chatService.setChatSelected(existChat[0]);
      return;
    }

    this.idChatSelected = newChat.id;

    this.chats.unshift(newChat);

    this.chatService.setChatSelected(newChat);
  }

  public deleteChat(id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('messages.deleteChatQuestion'),
      header: this.translocoService.translate('messages.deleteChat'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.chatService.deleteChat(id).subscribe({
          next: (res) => {
            this.chats = this.chats.filter((chat) => chat.id != id);
            this.chatService.resetChatSelected();
          },
          error: (error) => {},
        });
      },
      reject: () => {},
    });
  }

  private getImFirst(idUserOne: number, idUserTwo: number): boolean {
    if (idUserOne === this.user?.id) {
      return true;
    }
    return false;
  }
}
