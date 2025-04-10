import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TimeFormatPipe } from '../../../core/pipes/time-format.pipe';
import { SocketService } from '../../../core/services/socket.service';
import { StreamMessage } from '../../../core/models/streamMessage';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { Stream } from '../../../core/models/stream';
import { StreamService } from '../../../core/services/stream.service';
import { DialogService } from 'primeng/dynamicdialog';
import { NoStreamOrEndedComponent } from '../../../shared/components/no-stream-or-ended/no-stream-or-ended.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    TranslocoModule,
    ButtonModule,
    TimeFormatPipe,
    InputTextModule,
    InputGroupModule,
    PickerComponent,
    FormsModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements AfterViewInit {
  @Input('ativeStream') activeStream!: Stream | null;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public user!: User | undefined;
  public messages: StreamMessage[] = [];
  public chatBan: boolean = false;

  constructor(
    private readonly socketService: SocketService,
    private readonly confirmationService: ConfirmationService,
    private readonly sessionService: SessionService,
    private readonly streamService: StreamService,
    private readonly dialogService: DialogService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    if (this.user) {
      this.authService.getChatBanStatus(this.user.id).subscribe({
        next: (res) => {
          this.chatBan = res.response;
        },
      });
    }

    this.socketService.onStreamMessage().subscribe({
      next: (res) => {
        if (res.user_id != this.user?.id) {
          this.messages.push(res);
          this.scrollToBottom();
        }
      },
    });

    this.socketService.onStreamChatBan().subscribe({
      next: (res) => {
        console.log(res);

        if (this.user?.id == res.id) {
          this.chatBan = res.value;
        }
      },
    });

    this.socketService.onStreamMessageDeleted().subscribe({
      next: (res) => {
        this.messages = this.messages.filter((message) => message.id != res.id);
      },
    });

    this.socketService.onUnlive().subscribe({
      next: (res) => {
        this.dialogService.open(NoStreamOrEndedComponent, {
          data: { ended: true },
          header: this.translocoService.translate('stream.streamEnded'),
          width: '50rem',
        });
      },
    });
  }
  ngAfterViewInit(): void {
    this.getMessages();
  }

  public getMessages(): void {
    this.streamService.getMessages().subscribe({
      next: (res) => {
        this.messages = res.response.reverse();
        this.scrollToBottom();
      },
      error: (error) => {},
    });
  }
  public sendMessage(): void {
    this.showEmojiPicker = false;
    const message: StreamMessage = {
      id: 0,
      user_id: this.user?.id ?? 0,
      username: this.user?.username ?? '',
      message: this.messageModel,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.messageModel = '';

    this.streamService.sendMessage(message).subscribe({
      next: (res) => {
        this.messages.push(message);
        this.scrollToBottom();
      },
      error: (error) => {},
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
        this.streamService.deleteMessage(id).subscribe({
          next: (res) => {},
          error: (error) => {},
        });
      },
      reject: () => {},
    });
  }

  public banUserChat(username: string, id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('messages.chatBanQuestion', {
        user: username,
      }),
      header: this.translocoService.translate('messages.chatBan'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.authService.streamChatBan({ value: true }, id).subscribe({
          next: (res) => {
            console.log(res);
          },
          error: (error) => {},
        });
      },
      reject: () => {},
    });
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
