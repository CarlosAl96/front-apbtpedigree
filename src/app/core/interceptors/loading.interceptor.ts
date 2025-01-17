import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  const isGetById = req.url.includes('/pedigrees/');

  if (isGetById) {
    loadingService.setIsLoadingGetById(true);
  } else {
    loadingService.setIsLoading(true);
  }

  return next(req).pipe(
    finalize(() => {
      setTimeout(() => {
        if (isGetById) {
          loadingService.setIsLoadingGetById(false);
        } else {
          loadingService.setIsLoading(false);
        }
      });
    })
  );
};
