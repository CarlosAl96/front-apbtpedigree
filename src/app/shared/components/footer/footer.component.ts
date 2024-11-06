import { Component, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  public currentYear: string = '2024';
  ngOnInit(): void {
    this.currentYear = new Date().getFullYear() + '';
  }
}
