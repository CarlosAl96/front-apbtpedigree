import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';

export const MESSAGES_ROUTES: Routes = [
  { path: '', component: MessagesComponent },
  { path: '**', redirectTo: '' },
];
