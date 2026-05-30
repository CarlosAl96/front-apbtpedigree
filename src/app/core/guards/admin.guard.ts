import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const session = sessionService.readSession('USER_TOKEN');

  if (session == null) {
    sessionService.deleteSession();
    router.navigate(['/auth/login']);
    return false;
  }

  if (session.user.is_superuser == true) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
