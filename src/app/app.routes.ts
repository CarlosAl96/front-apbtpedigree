import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { LayoutComponent } from './shared/layouts/layout-no-menu/layout.component';
import { LayoutMenuComponent } from './shared/layouts/layout-menu/layout-menu.component';
import { adminGuard } from './core/guards/admin.guard';
import { PublicPedigreeViewComponent } from './modules/pedigree/components/public-pedigree-view/public-pedigree-view.component';
import { LayoutAdminComponent } from './shared/layouts/layout-admin/layout-admin.component';
import { forumBanGuard } from './core/guards/forum-ban.guard';
import { isPayedGuard } from './core/guards/is-payed.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: LayoutMenuComponent,
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'home',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'pedigree',
    component: LayoutComponent,
    loadChildren: () =>
      import('./modules/pedigree/pedigree.routes').then(
        (m) => m.PEDIGREE_ROUTES
      ),
    canActivate: [noAuthGuard],
  },
  {
    path: 'account',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
    canActivate: [noAuthGuard],
  },
  {
    path: 'messages',
    component: LayoutComponent,
    loadChildren: () =>
      import('./modules/messages/messages.routes').then(
        (m) => m.MESSAGES_ROUTES
      ),
    canActivate: [noAuthGuard],
  },
  {
    path: 'forum',
    component: LayoutComponent,
    loadChildren: () =>
      import('./modules/forum/forum.routes').then((m) => m.FORUM_ROUTES),
    canActivate: [noAuthGuard, forumBanGuard],
  },
  {
    path: 'stream',
    component: LayoutComponent,
    loadChildren: () =>
      import('./modules/stream/stream.routes').then((m) => m.STREAM_ROUTES),
    canActivate: [noAuthGuard, forumBanGuard, isPayedGuard],
  },
  {
    path: 'admin',
    component: LayoutAdminComponent,
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [adminGuard],
  },
  {
    path: 'public/pedigree/:id',
    component: PublicPedigreeViewComponent,
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
