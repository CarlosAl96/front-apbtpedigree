import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { LinkifyPipe } from '../../../core/pipes/linkify.pipe';

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
    LinkifyPipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss',
})
export class MessagesListComponent {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef<HTMLInputElement>;
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
  public queryPagination: QueryPagination = {
    page: 0,
    size: 50,
  };

  public get formattedRecordingTime(): string {
    const minutes = Math.floor(this.recordingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (this.recordingSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

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
    if (this.audioRecording) {
      return;
    }

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
      audio: this.audioBase64,
      created_at: new Date(),
    };
    this.chatSelected.last_message = message;
    this.messageModel = '';
    this.imageBase64 = '';
    this.audioBase64 = '';
    this.maxSizeExceeded = false;
    this.recorderError = '';
    this.resetFileInputs();
    this.messages.push(message);

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

  public addEmoji(event: any): void {
    const emoji = event?.emoji?.native || event?.native || '';

    if (emoji) {
      this.messageModel += `${emoji} `;
    }
  }

  public toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;

    if (this.showEmojiPicker) {
      this.messageInput?.nativeElement.blur();
    }
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
