import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TimeFormatPipe } from '../../../core/pipes/time-format.pipe';
import { StreamMessage } from '../../../core/models/streamMessage';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { SocketService } from '../../../core/services/socket.service';
import { StreamService } from '../../../core/services/stream.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stream-chat',
  standalone: true,
  imports: [
    CardModule,
    TranslocoModule,
    ButtonModule,
    TimeFormatPipe,
    InputTextModule,
    InputGroupModule,
    PickerComponent,
    FormsModule,
  ],
  templateUrl: './stream-chat.component.html',
  styleUrl: './stream-chat.component.scss',
})
export class StreamChatComponent implements AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public user!: User | undefined;
  public messages: StreamMessage[] = [];
  activeStream: any;

  constructor(
    private readonly socketService: SocketService,
    private readonly sessionService: SessionService,
    private readonly streamService: StreamService,
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
