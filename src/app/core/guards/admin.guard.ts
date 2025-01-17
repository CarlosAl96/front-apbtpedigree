import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.readSession('USER_TOKEN')?.user.is_superuser == true) {
    return true;
  }
  router.navigate(['/home']);
  return false;
};
