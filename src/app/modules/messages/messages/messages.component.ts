import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { ChatsListComponent } from '../chats-list/chats-list.component';
import { MessagesListComponent } from '../messages-list/messages-list.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    ChatsListComponent,
    MessagesListComponent,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent {}
