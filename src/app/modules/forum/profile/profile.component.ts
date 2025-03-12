import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ForumService } from '../../../core/services/forum.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../../environments/environment.development';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    RouterLink,
    ProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  public username: string = '';
  public userToView!: User;
  public modelCategory: number = 0;
  public forumCategories: ForumCategory[] = [];
  public urlImg: string = `${environment.uploads_url}users/`;
  public isLoading: boolean = false;
  public error404: boolean = false;
  private subscription: Subscription | null = null;
  private currentLang: string = '';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forumService: ForumService,
    private readonly authService: AuthService,
    private readonly translocoService: TranslocoService
  ) {
    this.getCategories();
    this.route.paramMap.subscribe((params) => {
      this.username = params.get('username') as string;
      this.isLoading = true;

      this.getByUsername();
    });
  }
  ngOnInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  private getByUsername(): void {
    this.authService.getUserByUsername(this.username).subscribe({
      next: (res) => {
        this.error404 = false;
        this.isLoading = false;
        this.userToView = res.response;
      },
      error: (error) => {
        this.error404 = true;
        this.isLoading = false;
      },
    });
  }

  private getCategories(): void {
    this.forumService.getCategories({ size: 100000, page: 0 }).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
        this.modelCategory = this.forumCategories[0].id;
      },
      error: (error) => {},
    });
  }

  public goToChat(username: string): void {
    this.router.navigateByUrl(`messages/?user=${username}`);
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      this.router.navigateByUrl(`forum/topics/${this.modelCategory}`);
    }
  }

  public getUserLevel(posts: number): string {
    if (posts >= 300) return 'senior';
    if (posts >= 200) return 'advanced';
    if (posts >= 100) return 'mid';
    if (posts >= 50) return 'junior';
    return 'newbie';
  }

  public getLocation(city: string, state: string, country: string): string {
    return [city, state, country].filter((value) => value).join(' - ');
  }

  public getDateInLocale(date: string, hours: boolean): string {
    const dateAux = new Date(date.replace('Z', ''));

    let options: Intl.DateTimeFormatOptions = {};

    if (hours) {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: true,
      };
    } else {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    const formatter = new Intl.DateTimeFormat(this.currentLang, options);
    return formatter.format(dateAux);
  }
}
