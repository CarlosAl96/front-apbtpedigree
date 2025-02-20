import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token: string | null = localStorage.getItem('USER_TOKEN');
  const router: Router = new Router();

  if (token) {
    if (!req.url.toString().includes('refresh')) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token,
        },
      });
    }
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.clear();
        if (router.url != '/') {
          router.navigate(['']);
        }
      }
      return throwError(() => err.message);
    })
  );
};
