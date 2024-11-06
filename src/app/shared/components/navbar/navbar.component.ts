import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslocoModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private subscription: Subscription | null = null;
  public currentDate: string = '';

  constructor(
    private readonly translocoService: TranslocoService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentDate = this.getCurrentDateInLocale(lang);
    });
  }

  private getCurrentDateInLocale(locale: string): string {
    const currentDate = new Date();

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(currentDate);
  }
}
