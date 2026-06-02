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
  @ViewChild('fileInput') fileInput!: ElementRef;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public user!: User | undefined;
  public messages: StreamMessage[] = [];
  public chatBan: boolean = false;
  public imageBase64: string = '';
  public audioBase64: string = '';
  public audioRecording: boolean = false;
  public recordingSeconds: number = 0;
  public maxSizeExceeded: boolean = false;
  public recorderError: string = '';
  private readonly maxImageSize: number = 250 * 5096;
  private readonly maxAudioSize: number = 10 * 1024 * 1024;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private recordingTimerId: number | null = null;

  public get formattedRecordingTime(): string {
    const minutes = Math.floor(this.recordingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (this.recordingSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

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
    if (this.audioRecording) {
      return;
    }

    this.showEmojiPicker = false;
    const message: StreamMessage = {
      id: 0,
      user_id: this.user?.id ?? 0,
      username: this.user?.username ?? '',
      message: this.messageModel,
      img: this.imageBase64,
      audio: this.audioBase64,
      updated_at: new Date(),
      created_at: new Date(),
    };

    this.messageModel = '';
    this.imageBase64 = '';
    this.audioBase64 = '';
    this.maxSizeExceeded = false;
    this.recorderError = '';
    this.resetFileInputs();

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

  public onFileSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > this.maxImageSize) {
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

  public async toggleAudioRecording(): Promise<void> {
    if (this.audioRecording) {
      this.stopAudioRecording();
      return;
    }

    await this.startAudioRecording();
  }

  public stopAudioRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return;
    }

    this.mediaRecorder.stop();
  }

  public cancelAudioRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }

    this.audioChunks = [];
    this.audioBase64 = '';
    this.audioRecording = false;
    this.recordingSeconds = 0;
    this.recorderError = '';
    this.clearRecordingTimer();
    this.releaseAudioStream();
  }

  private resetFileInputs(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private async startAudioRecording(): Promise<void> {
    this.showEmojiPicker = false;
    this.recorderError = '';
    this.maxSizeExceeded = false;
    this.audioBase64 = '';

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      this.recorderError = 'Tu navegador no permite grabar audio.';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = this.getAudioRecorderOptions();

      this.audioStream = stream;
      this.audioChunks = [];
      this.mediaRecorder = options
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const mimeType =
          this.mediaRecorder?.mimeType || this.audioChunks[0]?.type || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        this.audioRecording = false;
        this.recordingSeconds = 0;
        this.clearRecordingTimer();
        this.releaseAudioStream();

        if (!audioBlob.size) {
          return;
        }

        if (audioBlob.size > this.maxAudioSize) {
          this.maxSizeExceeded = true;
          this.audioBase64 = '';
          return;
        }

        this.blobToDataUrl(audioBlob)
          .then((audio) => {
            this.audioBase64 = audio;
          })
          .catch(() => {
            this.recorderError = 'No se pudo preparar el audio.';
          });
      };

      this.audioRecording = true;
      this.recordingSeconds = 0;
      this.recordingTimerId = window.setInterval(() => {
        this.recordingSeconds++;
      }, 1000);
      this.mediaRecorder.start();
    } catch (error) {
      this.audioRecording = false;
      this.recorderError = 'No se pudo acceder al micrófono.';
      this.clearRecordingTimer();
      this.releaseAudioStream();
    }
  }

  private getAudioRecorderOptions(): MediaRecorderOptions | undefined {
    const supportedMimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
    ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

    return supportedMimeType ? { mimeType: supportedMimeType } : undefined;
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private clearRecordingTimer(): void {
    if (this.recordingTimerId !== null) {
      window.clearInterval(this.recordingTimerId);
      this.recordingTimerId = null;
    }
  }

  private releaseAudioStream(): void {
    this.audioStream?.getTracks().forEach((track) => track.stop());
    this.audioStream = null;
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
