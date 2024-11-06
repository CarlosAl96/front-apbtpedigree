import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { OnlineInfoComponent } from '../../components/online-info/online-info.component';

@Component({
  selector: 'app-layout-menu',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastModule,
    NavbarComponent,
    MenuComponent,
    OnlineInfoComponent
  ],
  providers: [MessageService],
  templateUrl: './layout-menu.component.html',
  styleUrl: './layout-menu.component.scss',
})
export class LayoutMenuComponent {
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
