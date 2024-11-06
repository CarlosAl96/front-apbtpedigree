import { Component, inject, OnInit } from '@angular/core';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import {
  LangDefinition,
  TranslocoModule,
  TranslocoService,
} from '@jsverse/transloco';
import { Subscription, take } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TranslocoModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public user!: User | undefined;
  public availableLangs: any[] = [];
  private subscription: Subscription | null = null;
  public activeLang: string = 'es';
  public modelSearch: string = '';
  public modelSearchOption: string = 'registeredName';
  public searchOptions: string[] = [
    'registeredName',
    'dogId',
    'registrationNumber',
    'callname',
    'breeder',
    'owner',
    'performanceTitle',
    'producingTitle',
  ];

  constructor(
    private readonly sessionService: SessionService,
    private readonly translocoService: TranslocoService
  ) {
    this.availableLangs =
      this.translocoService.getAvailableLangs() as LangDefinition[];
  }

  ngOnInit(): void {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
  }

  public changeLang(event: any): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService
      .load(event.value)
      .pipe(take(1))
      .subscribe(() => {
        this.translocoService.setActiveLang(event.value);
      });
  }

  public search(): void {}
}
