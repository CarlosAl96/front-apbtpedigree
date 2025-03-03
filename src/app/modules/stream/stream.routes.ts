import { Routes } from '@angular/router';
import { StreamComponent } from './stream/stream.component';

export const STREAM_ROUTES: Routes = [
  { path: '', component: StreamComponent },
  { path: '**', redirectTo: '' },
];
