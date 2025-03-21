import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-session-closed',
  standalone: true,
  imports: [TranslocoModule, ButtonModule],
  templateUrl: './session-closed.component.html',
  styleUrl: './session-closed.component.scss',
})
export class SessionClosedComponent {
  constructor(private readonly refDialog: DynamicDialogRef) {}
  public accept(): void {
    this.refDialog.close();
  }
}
