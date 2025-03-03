import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
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
  ],
  providers: [DialogService],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnDestroy, AfterViewInit {
  @Input('ativeStream') activeStream!: Stream | null;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public user!: User | undefined;
  public messages: StreamMessage[] = [];

  constructor(
    private readonly socketService: SocketService,
    private readonly sessionService: SessionService,
    private readonly streamService: StreamService,
    private readonly dialogService: DialogService,
    private readonly translocoService: TranslocoService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.socketService.onStreamMessage().subscribe({
      next: (res) => {
        if (res.user_id != this.user?.id) {
          this.messages.push(res);
          this.scrollToBottom();
        }
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

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  public getMessages(): void {
    this.streamService.getMessages(this.activeStream?.id ?? 0).subscribe({
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
      stream_id: this.activeStream?.id ?? 0,
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
