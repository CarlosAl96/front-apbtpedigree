import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ToastService } from './core/services/toast.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private readonly toastService: ToastService,
    private readonly messageService: MessageService
  ) {
    this.toastService.getMessage().subscribe((message) => {
      if (message.severity != '') {
        this.messageService.add(message);
      }
    });
  }
}
