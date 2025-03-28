import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translocoService: TranslocoService) {}

  setLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('apbt-lang', lang);
  }

  getSavedLanguage(): string {
    return localStorage.getItem('apbt-lang') || 'en';
  }
}
