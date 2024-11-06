import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-pedigrees',
  standalone: true,
  imports: [CardModule, ButtonModule, TranslocoModule],
  templateUrl: './pedigrees.component.html',
  styleUrl: './pedigrees.component.scss',
})
export class PedigreesComponent {}
