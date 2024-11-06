import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-online-info',
  standalone: true,
  imports: [TranslocoModule, CardModule],
  templateUrl: './online-info.component.html',
  styleUrl: './online-info.component.scss',
})
export class OnlineInfoComponent {}
