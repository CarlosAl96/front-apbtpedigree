import { Routes } from '@angular/router';
import { StreamChatComponent } from './stream-chat-page/stream-chat.component';

export const CHAT_STREAM_ROUTES: Routes = [
  { path: '', component: StreamChatComponent },
  { path: '**', redirectTo: '' },
];
