import { Routes } from '@angular/router';
import { ProfilePageComponent } from './profile-page/profile-page.component';

export const PROFILE_ROUTES: Routes = [
  { path: ':username', component: ProfilePageComponent },
  { path: '**', redirectTo: '/404' },
];
