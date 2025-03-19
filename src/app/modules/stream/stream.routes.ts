import { Routes } from '@angular/router';
import { StreamComponent } from './stream/stream.component';
import { ChatComponent } from './chat/chat.component';
import { StreamChatComponent } from '../stream-chat/stream-chat-page/stream-chat.component';

export const STREAM_ROUTES: Routes = [
  { path: '', component: StreamComponent },
  { path: '**', redirectTo: '' },
];
