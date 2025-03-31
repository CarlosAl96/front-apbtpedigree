import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.readSession('USER_TOKEN') == null) {
    sessionService.deleteSession();
    router.navigate(['auth']);
    return false;
  }
  return true;
};
