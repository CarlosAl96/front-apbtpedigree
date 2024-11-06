import { Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', component: AccountComponent },
  { path: '**', redirectTo: '' },
];
