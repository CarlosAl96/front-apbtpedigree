import { Component, Input, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MenuPedigreesComponent } from '../../../shared/components/menu-pedigrees/menu-pedigrees.component';
import { PedigreeViewComponent } from '../components/pedigree-view/pedigree-view.component';
import { NewPedigreeComponent } from '../components/new-pedigree/new-pedigree.component';
import { UploadPictureComponent } from '../components/upload-picture/upload-picture.component';
import { ChangePermissionsComponent } from '../components/change-permissions/change-permissions.component';
import { DeletePedigreeComponent } from '../components/delete-pedigree/delete-pedigree.component';
import { TransferOwnershipComponent } from '../components/transfer-ownership/transfer-ownership.component';
import { PublicLinkComponent } from '../components/public-link/public-link.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { LoadingService } from '../../../core/services/loading.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PedigreeService } from '../../../core/services/pedigree.service';
import { PedigreeComplete } from '../../../core/models/pedigreeComplete';
import { fullnameTransform } from '../../../shared/utils/fullname-transform';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-my-pedigrees',
  standalone: true,
  imports: [
    MenuPedigreesComponent,
    TranslocoModule,
    PedigreeViewComponent,
    NewPedigreeComponent,
    UploadPictureComponent,
    ChangePermissionsComponent,
    DeletePedigreeComponent,
    TransferOwnershipComponent,
    PublicLinkComponent,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './my-pedigrees.component.html',
  styleUrl: './my-pedigrees.component.scss',
})
export class MyPedigreesComponent implements OnInit {
  @Input() idPedigree!: number;
  @Input() isFromPedigreeSearch: boolean = false;
  @Input() isNewPedigree: boolean = false;
  public pedigree!: PedigreeComplete;
  public user!: User | undefined;
  public tabActive: string = 'details';
  public isLoading: boolean = false;
  public isPrivate: boolean = false;
  public isEditable: boolean = false;
  public isResults: boolean = true;

  constructor(
    private readonly pedigreeService: PedigreeService,
    private readonly sessionService: SessionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    if (!this.isFromPedigreeSearch) {
      this.route.paramMap.subscribe((params) => {
        this.idPedigree = Number(params.get('id'));
      });
    }

    if (this.idPedigree != 0) {
      this.getPedigreeById(this.idPedigree);
    }

    if (this.isNewPedigree) {
      this.tabActive = 'newDog';
    }
  }

  private getPedigreeById(id: number): void {
    this.isLoading = true;
    this.pedigreeService.getPedigreeById(id).subscribe({
      next: (res) => {
        this.pedigree = fullnameTransform(res.response);
        if (!this.user) {
          if (this.pedigree.pedigree.private) {
            this.isPrivate = true;
          }
        } else {
          if (
            this.pedigree.pedigree.user_id !== this.user?.id &&
            this.pedigree.pedigree.private
          ) {
            this.isPrivate = true;
          } else {
            this.isPrivate = false;
          }

          if (
            this.pedigree.pedigree.user_id === this.user?.id ||
            this.user.is_superuser
          ) {
            this.isEditable = true;
          } else {
            this.isEditable = false;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  public changeTab(tab: string) {
    this.tabActive = tab;
  }

  public back(): void {
    location.reload();
  }

  public onIdPedigreeChange(event: number): void {
    this.idPedigree = event;

    if (this.idPedigree != 0) {
      this.getPedigreeById(this.idPedigree);
    }
  }

  public onIsResults(event: boolean): void {
    this.isResults = event;
  }
}
