import { Component, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { ChatComponent } from '../chat/chat.component';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StreamService } from '../../../core/services/stream.service';
import { Stream } from '../../../core/models/stream';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [TranslocoModule, CardModule, ChatComponent, ProgressSpinnerModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.scss',
})
export class StreamComponent implements OnInit {
  public streamUrl!: SafeUrl;
  public streamActive!: Stream | null;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly streamService: StreamService
  ) {}
  ngOnInit(): void {
    this.getActiveStream();
  }

  private getActiveStream(): void {
    this.streamService.getActiveStream().subscribe({
      next: (res) => {
        this.streamActive = res.response;
        this.streamUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.streamActive.url
        );
      },
      error: (error) => {},
    });
  }
}
