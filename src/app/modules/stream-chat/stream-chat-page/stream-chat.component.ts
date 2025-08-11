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
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../../core/services/auth.service';

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
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './stream-chat.component.html',
  styleUrl: './stream-chat.component.scss',
})
export class StreamChatComponent implements AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  public messageModel: string = '';
  public showEmojiPicker: boolean = false;
  public chatBan: boolean = false;
  public user!: User | undefined;
  public messages: StreamMessage[] = [];
  activeStream: any;

  constructor(
    private readonly socketService: SocketService,
    private readonly sessionService: SessionService,
    private readonly streamService: StreamService,
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService
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
        console.log('Mensaje recibido:', res, 'Usuario actual:', this.user?.id);
        // Si el mensaje es del usuario actual, lo agregamos solo si no existe ya en el array
        if (res.user_id === this.user?.id) {
          // Buscar si ya existe un mensaje igual (por id, texto y fecha)
          const exists = this.messages.some(m =>
            m.user_id === res.user_id &&
            m.message === res.message &&
            Math.abs(new Date(m.created_at).getTime() - new Date(res.created_at).getTime()) < 2000 // 2 segundos de margen
          );
          if (!exists) {
            this.messages.push(res);
            this.scrollToBottom();
          }
        } else {
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
    if (!this.chatBan) {
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

      // Solo agregamos el mensaje localmente si no esperamos que el socket lo devuelva
      // Si el socket lo devuelve, se evitará el duplicado en el handler
      this.messages.push(message);
      this.scrollToBottom();

      this.streamService.sendMessage(message).subscribe({
        next: (res) => {
          // El mensaje ya fue agregado localmente
        },
        error: (error) => {},
      });
    }
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
