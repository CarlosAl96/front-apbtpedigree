import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { TimeFormatPipe } from '../../../core/pipes/time-format.pipe';
import { ChatService } from '../../../core/services/chat.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import { Message } from '../../../core/models/message';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { Chat } from '../../../core/models/chat';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { environment } from '../../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { QueryPagination } from '../../../core/models/queryPagination';
import { TagModule } from 'primeng/tag';
import { SocketService } from '../../../core/services/socket.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [
    TranslocoModule,
    ButtonModule,
    TimeFormatPipe,
    InputTextModule,
    InputGroupModule,
    PickerComponent,
    FormsModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
})
export class MessagesListComponent implements OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  public user!: User | undefined;
  public chatSelected!: Chat;
  public urlImg: string = `${environment.uploads_url}users/`;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public messages: Message[] = [];
  public totalRows: number = 0;
  public totalPages: number = 0;
  public imageBase64: string = '';
  public maxSizeExceeded: boolean = false;
  public queryPagination: QueryPagination = {
    page: 0,
    size: 50,
  };

  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
    private readonly socketService: SocketService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.chatService.getChatSelected().subscribe({
      next: (res) => {
        this.chatSelected = res;
        if (this.chatSelected.im_first) {
          this.chatSelected.viewed_one = true;
        } else {
          this.chatSelected.viewed_two = true;
        }
        if (this.chatSelected.id > 0) {
          this.queryPagination.page = 0;
          this.getMessages(this.queryPagination);
        } else {
          this.queryPagination.page = 0;
          this.messages = [];
        }
      },
    });

    this.socketService.onMessage().subscribe({
      next: (res) => {
        if (
          (this.chatSelected.id == 0 && res.id_sender == this.user?.id) ||
          (res.id_sender != this.user?.id &&
            res.id_chat == this.chatSelected.id)
        ) {
          this.chatSelected.id = res.id_chat;

          this.getMessages({ size: 50, page: 0 });
        }
      },
    });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  public getMessages(query: QueryPagination, is_socket: boolean = false): void {
    if (this.chatSelected.id > 0) {
      this.chatService.markAsViewedChat(this.chatSelected.id).subscribe({
        next: (res) => {},
        error: (error) => {},
      });
    }

    this.chatService.getMessages(query, this.chatSelected.id).subscribe({
      next: (res) => {
        if (query.page == 0 && !is_socket) {
          this.messages = res.response.data.reverse();
        } else {
          this.messages = Array.from(
            new Map(
              [...res.response.data.reverse(), ...this.messages].map(
                (message) => [message.id, message]
              )
            ).values()
          );
        }

        this.totalRows = res.response.totalRows;
        this.totalPages = Math.ceil(this.totalRows / this.queryPagination.size);

        if (this.queryPagination.page == 0) {
          this.scrollToBottom();
        }
      },
      error: (error) => {},
    });
  }

  public sendMessage(): void {
    this.showEmojiPicker = false;
    const message: Message = {
      id: 0,
      id_chat: this.chatSelected.id,
      id_sender: this.user?.id ?? 0,
      id_receiver: this.chatSelected.im_first
        ? this.chatSelected.id_user_two
        : this.chatSelected.id_user_one,
      message: this.messageModel,
      img: this.imageBase64,
      created_at: new Date(),
    };
    this.chatSelected.last_message = message;
    this.messageModel = '';
    this.imageBase64 = '';
    this.maxSizeExceeded = false;

    this.chatService
      .sendMessage(message, this.chatSelected.im_first ?? false)
      .subscribe({
        next: (res) => {
          this.chatSelected.id = res.response;

          this.chatService.setChatSelected(this.chatSelected);
          this.scrollToBottom();
        },
      });
  }

  public deleteMessage(id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate(
        'messages.deleteMessageQuestion'
      ),
      header: this.translocoService.translate('messages.deleteMessage'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.chatService.deleteMessage(id).subscribe({
          next: (res) => {
            this.messages = this.messages.filter((message) => message.id != id);
          },
          error: (error) => {},
        });
      },
      reject: () => {},
    });
  }

  public onPageChange(): void {
    this.queryPagination.page++;
    this.getMessages(this.queryPagination);
  }

  public onFileSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const maxSize: number = 250 * 1024;

    if (file.size > maxSize) {
      this.maxSizeExceeded = true;
      this.imageBase64 = '';
      return;
    }
    this.maxSizeExceeded = false;
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  public fileUpload(): void {
    this.fileInput.nativeElement.click();
  }
  public addEmoji(event: any): void {
    this.messageModel += event.emoji.native + ' ';
  }

  public toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTo({
          top: this.messageContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    } catch (err) {}
  }
}
