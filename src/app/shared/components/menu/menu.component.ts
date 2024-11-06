import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [TranslocoModule, CardModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  constructor(public router: Router) {}
}