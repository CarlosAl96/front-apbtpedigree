import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoading = new BehaviorSubject<boolean>(true);
  private isLoadingGetById = new BehaviorSubject<boolean>(true);

  setIsLoading(value: boolean) {
    this.isLoading.next(value);
  }

  getIsLoading() {
    return this.isLoading.asObservable();
  }

  setIsLoadingGetById(value: boolean) {
    this.isLoadingGetById.next(value);
  }

  getIsLoadingGetById() {
    return this.isLoadingGetById.asObservable();
  }
}
