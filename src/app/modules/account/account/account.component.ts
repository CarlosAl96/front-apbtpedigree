import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [TranslocoModule, CardModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {}
