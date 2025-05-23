import { Component, HostListener, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService, Message } from 'primeng/api';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { Pedigree } from '../../../../core/models/pedigree';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { User } from '../../../../core/models/user';
import { SessionService } from '../../../../core/services/session.service';
import { Location } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-transfer-ownership',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    MessagesModule,
    InputTextareaModule,
    AutoCompleteModule,
    FormsModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './transfer-ownership.component.html',
  styleUrl: './transfer-ownership.component.scss',
})
export class TransferOwnershipComponent {
  @Input('pedigree') pedigree!: Pedigree;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.isFromPedigreeSearch) {
      this.goBack();
      this.location.forward();
    }
  }

  public formGroup!: FormGroup;
  public user!: User | undefined;
  public error!: Message[];
  public urlImg: string = `${environment.uploads_url}users/`;

  public filteredUsers: User[] = [];
  public selectedUser!: User;

  constructor(
    private readonly location: Location,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService,
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    private readonly pedigreeService: PedigreeService,
    private readonly sessionService: SessionService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.formGroup = this.formBuilder.group({
      description: [''],
    });
  }

  public changeOwner(): void {
    if (this.selectedUser.id) {
      this.confirmationService.confirm({
        header: this.translocoService.translate(
          'yourPedigrees.menu.transferOwnership'
        ),
        message: this.translocoService.translate(
          'yourPedigrees.changeOwner.confirm',
          { newOwner: this.selectedUser.username }
        ),
        acceptIcon: 'pi pi-arrow-right-arrow-left mr-2',
        rejectIcon: 'pi pi-times mr-2',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        acceptLabel: this.translocoService.translate('buttons.yes'),
        rejectLabel: this.translocoService.translate('buttons.no'),
        accept: () => {
          const obj: any = {
            description: this.formGroup.value.description ?? '',
            newOwner: this.selectedUser.id,
          };
          this.pedigreeService
            .changePedigreeOwner(obj, this.pedigree.id)
            .subscribe({
              next: () => {
                this.error = [];

                this.toastService.setMessage({
                  severity: 'success',
                  summary: this.translocoService.translate('toast.success'),
                  detail: this.translocoService.translate(
                    'toast.pedigreeEdited'
                  ),
                });

                setTimeout(() => {
                  window.location.href = '/pedigree/my-pedigrees/0';
                }, 1000);
              },
              error: (error) => {
                this.error = [
                  {
                    severity: 'error',
                    detail: this.translocoService.translate(
                      'errorMessages.errorChangeOwner',
                      { user: this.formGroup.value.username }
                    ),
                  },
                ];
              },
            });
        },
        reject: () => {},
      });
    } else {
      this.formGroup.controls['username'].markAsDirty();
    }
  }

  public searchUsers(query: string): void {
    this.authService.searchUsers(query).subscribe({
      next: (res) => {
        this.filteredUsers = res.response;
      },
      error: (error) => {},
    });
  }

  public goBack(): void {
    window.history.back();
  }
}
