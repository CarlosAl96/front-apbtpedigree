import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const forumBanGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.readSession('USER_TOKEN')?.user.forum_ban == false) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};
