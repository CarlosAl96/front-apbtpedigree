import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-no-stream-or-ended',
  standalone: true,
  imports: [TranslocoModule, ButtonModule],
  templateUrl: './no-stream-or-ended.component.html',
  styleUrl: './no-stream-or-ended.component.scss',
})
export class NoStreamOrEndedComponent {
  public ended: boolean = false;

  constructor(
    private readonly refDialog: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly router: Router
  ) {
    this.ended = this.config.data.ended;
  }

  public accept(): void {
    if (this.ended) {
      window.location.href = '/home';
    }
    this.refDialog.close();
  }
}
