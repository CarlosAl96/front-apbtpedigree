import {
  Component,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { QueryPaginationPedigree } from '../../../../core/models/queryPaginationPedigree';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { Pedigree } from '../../../../core/models/pedigree';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { MenuItem, Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { FightColorPipe } from '../../../../core/pipes/fight-color.pipe';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { fullnameTransformPedigreeList } from '../../../../shared/utils/fullname-transform';
import { DropOption } from '../../../../core/models/dropOption';
import { CalendarModule } from 'primeng/calendar';
import { PedigreeComplete } from '../../../../core/models/pedigreeComplete';
import { User } from '../../../../core/models/user';
import { SessionService } from '../../../../core/services/session.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment.development';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-pedigree',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    StepsModule,
    ProgressSpinnerModule,
    InputGroupModule,
    FightColorPipe,
    TableModule,
    InputNumberModule,
    InputTextareaModule,
    FileUploadModule,
    CalendarModule,
    MessagesModule,
  ],
  templateUrl: './new-pedigree.component.html',
  styleUrl: './new-pedigree.component.scss',
})
export class NewPedigreeComponent implements OnInit {
  @Input('pedigree') pedigree!: PedigreeComplete;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.isFromPedigreeSearch) {
      this.goBack();
      this.location.forward();
    }
  }

  public formGroup!: FormGroup;
  public files: any[] = [];
  public loading: boolean = false;
  public colorsOptions: DropOption[] = [];
  public sexOptions: DropOption[] = [];
  public user!: User | undefined;
  public error!: Message[];
  public urlImg: string = `${environment.uploads_url}pedigrees/`;

  public pedigreesMother: Pedigree[] = [];
  public selectedMother: Pedigree = this.getPedigreeUnknown();
  public totalRowsMother: number = 1;
  public totalPagesMother: number = 1;
  public isLoadingMother: boolean = false;
  public pageMother: number = 1;
  public modelSearchMother: string = '';
  public modelSearchOptionMother: string = 'registeredName';
  public queryPaginationMother: QueryPaginationPedigree = {
    orderBy: 'id ASC',
    size: 20,
    page: 0,
  };

  public pedigreesFather: Pedigree[] = [];
  public selectedFather: Pedigree = this.getPedigreeUnknown();
  public totalRowsFather: number = 1;
  public totalPagesFather: number = 1;
  public isLoadingFather: boolean = false;
  public pageFather: number = 1;
  public modelSearchFather: string = '';
  public modelSearchOptionFather: string = 'registeredName';
  public queryPaginationFather: QueryPaginationPedigree = {
    orderBy: 'id ASC',
    size: 20,
    page: 0,
  };

  public active: number = 0;

  public searchOptions: string[] = [
    'registeredName',
    'dogId',
    'registrationNumber',
    'callname',
    'breeder',
    'owner',
  ];

  public items: MenuItem[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly pedigreeService: PedigreeService,
    private readonly route: ActivatedRoute,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private readonly toastService: ToastService,
    private readonly location: Location
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.required]],
      beforeNameTitles: ['', []],
      afterNameTitles: ['', []],
      description: ['', []],
      owner: ['', []],
      breeder: ['', []],
      callname: ['', []],
      sex: ['unknown'],
      fightcolor: ['black'],
      registration: ['', []],
      color: ['', []],
      birthdate: [new Date()],
      conditioned_weight: [''],
      chain_weight: [''],
    });

    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.translocoService.langChanges$.subscribe((res) => {
      this.sexOptions = [
        {
          name: this.translocoService.translate('sexs.unknown'),
          code: 'unknown',
        },
        {
          name: this.translocoService.translate('sexs.female'),
          code: 'female',
        },
        { name: this.translocoService.translate('sexs.male'), code: 'male' },
      ];

      this.colorsOptions = [
        {
          name: this.translocoService.translate('colors.black'),
          code: 'black',
        },
        {
          name: this.translocoService.translate('colors.blue'),
          code: 'blue',
        },
        {
          name: this.translocoService.translate('colors.red'),
          code: 'red',
        },
        {
          name: this.translocoService.translate('colors.green'),
          code: 'green',
        },
      ];

      this.items = [
        {
          label: this.translocoService.translate(
            'yourPedigrees.newPedigree.step1'
          ),
        },
        {
          label: this.translocoService.translate(
            'yourPedigrees.newPedigree.step2'
          ),
        },
      ];
    });
  }
  ngOnInit(): void {
    if (this.pedigree) {
      this.setFormToEdit();
    }
  }

  public goBack(): void {
    window.history.back();
  }

  private getPedigrees(query: QueryPaginationPedigree, option: string): void {
    if (option == 'mother') {
      this.pedigreesMother = [];
      this.isLoadingMother = true;
    } else {
      this.pedigreesFather = [];
      this.isLoadingFather = true;
    }

    this.pedigreeService.getPedigrees(query).subscribe((res) => {
      if (res) {
        if (option == 'mother') {
          this.pedigreesMother = [];
          this.pedigreesMother = fullnameTransformPedigreeList(
            res.response.data
          );
          this.totalRowsMother = res.response.totalRows;
          this.totalPagesMother = Math.ceil(
            this.totalRowsMother / this.queryPaginationMother.size
          );
          this.isLoadingMother = false;
        } else {
          this.pedigreesFather = [];
          this.pedigreesFather = fullnameTransformPedigreeList(
            res.response.data
          );
          this.totalRowsFather = res.response.totalRows;
          this.totalPagesFather = Math.ceil(
            this.totalRowsFather / this.queryPaginationFather.size
          );
          this.isLoadingFather = false;
        }
      }
    });
  }

  public search(option: string): void {
    let queryPagination: QueryPaginationPedigree = {
      orderBy: 'id ASC',
      size: 20,
      page: 0,
    };
    let modelSearchOption: string = '';
    let modelSearch: string = '';

    if (option == 'mother') {
      modelSearchOption = this.modelSearchOptionMother;
      modelSearch = this.modelSearchMother;
    } else {
      modelSearchOption = this.modelSearchOptionFather;
      modelSearch = this.modelSearchFather;
    }

    if (modelSearchOption === 'registeredName') {
      queryPagination.registeredName = modelSearch as string;
    } else if (modelSearchOption === 'dogId') {
      queryPagination.dogId = Number(modelSearch);
    } else if (modelSearchOption === 'registrationNumber') {
      queryPagination.registrationNumber = modelSearch as string;
    } else if (modelSearchOption === 'callname') {
      queryPagination.callname = modelSearch as string;
    } else if (modelSearchOption === 'breeder') {
      queryPagination.breeder = modelSearch as string;
    } else if (modelSearchOption === 'owner') {
      queryPagination.owner = modelSearch as string;
    } else if (modelSearchOption === 'userId') {
      queryPagination.userId = Number(modelSearch);
    }

    if (option == 'mother') {
      this.queryPaginationMother = queryPagination;
      this.getPedigrees(this.queryPaginationMother, option);
    } else {
      this.queryPaginationFather = queryPagination;
      this.getPedigrees(this.queryPaginationFather, option);
    }
  }

  public onPageChange(page: number, option: string): void {
    if (option == 'mother') {
      this.queryPaginationMother.page = page - 1;
      this.pageMother = page;
      this.getPedigrees(this.queryPaginationMother, option);
    } else {
      this.queryPaginationFather.page = page - 1;
      this.pageFather = page;
      this.getPedigrees(this.queryPaginationFather, option);
    }
  }

  public customSort(event: TableLazyLoadEvent, option: string): void {
    if (event.sortField) {
      if (option == 'mother') {
        this.queryPaginationMother.orderBy = `${event.sortField} ${
          event.sortOrder == 1 ? 'ASC' : 'DESC'
        }`;
        this.queryPaginationMother.page = 0;
        this.getPedigrees(this.queryPaginationMother, option);
      } else {
        this.queryPaginationFather.orderBy = `${event.sortField} ${
          event.sortOrder == 1 ? 'ASC' : 'DESC'
        }`;
        this.queryPaginationFather.page = 0;
        this.getPedigrees(this.queryPaginationFather, option);
      }
    }
  }

  public createPedigree(addBrother: boolean): void {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;

      const formData: FormData = new FormData();

      Object.keys(this.formGroup.controls).forEach((key) => {
        formData.append(key, this.formGroup.get(key)?.value);
      });

      formData.append('father_id', this.selectedFather.id.toString());
      formData.append('mother_id', this.selectedMother.id.toString());
      formData.append('user_id', (this.user?.id ?? 0).toString());

      if (this.files.length) {
        formData.append('img', this.files[0]);
      } else {
        formData.append('img', '');
      }

      this.pedigreeService.createPedigree(formData).subscribe({
        next: (res) => {
          console.log(res);

          this.loading = false;
          this.error = [];
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.pedigreeCreated'),
          });
          if (addBrother) {
            this.active = 1;
            this.formGroup.reset();
            this.formGroup.patchValue({
              sex: 'unknown',
              birthdate: new Date(),
            });
            this.fileUpload.clear();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.files = [];
          } else {
            setTimeout(() => {
              window.location.href = `/pedigree/my-pedigrees/${
                res.response.insertId
              }?orderBy=id ASC&page=0&size=50&userId=${
                this.user?.id ?? 0
              }&tab=details`;
            }, 1000);
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = [
            {
              severity: 'error',
              detail: this.translocoService.translate(
                'errorMessages.errorNewPedigree'
              ),
            },
          ];
        },
      });
    }
  }

  public editPedigree(): void {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;

      const formData: FormData = new FormData();

      Object.keys(this.formGroup.controls).forEach((key) => {
        formData.append(key, this.formGroup.get(key)?.value);
      });

      formData.append('father_id', this.selectedFather.id.toString());
      formData.append('mother_id', this.selectedMother.id.toString());
      formData.append('user_id', (this.user?.id ?? 0).toString());

      if (this.files.length) {
        formData.append('img', this.files[0]);
        if (this.pedigree.pedigree.img) {
          formData.append('old_img', this.pedigree.pedigree.img);
        }
      } else {
        formData.append('img', this.pedigree.pedigree.img);
      }

      this.pedigreeService
        .updatePedigree(formData, this.pedigree.pedigree.id)
        .subscribe({
          next: () => {
            this.loading = false;
            this.error = [];
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.pedigreeEdited'),
            });

            setTimeout(() => {
              const currentParams = this.route.snapshot.queryParams;
              const updatedParams = { ...currentParams, tab: 'details' };
              const queryString = new URLSearchParams(updatedParams).toString();

              window.location.href = `${window.location.pathname}?${queryString}`;
            }, 1000);
          },
          error: (error) => {
            this.loading = false;
            this.error = [
              {
                severity: 'error',
                detail: this.translocoService.translate(
                  'errorMessages.errorEditPedigree'
                ),
              },
            ];
          },
        });
    }
  }

  public setUnknown(option: string) {
    if (option == 'mother') {
      this.selectedMother = this.getPedigreeUnknown();
    } else {
      this.selectedFather = this.getPedigreeUnknown();
    }
  }

  private setFormToEdit(): void {
    if (this.pedigree.generation1[0]) {
      this.selectedFather = this.pedigree.generation1[0];
    } else {
      this.selectedFather = this.getPedigreeUnknown();
    }

    if (this.pedigree.generation1[1]) {
      this.selectedMother = this.pedigree.generation1[1];
    } else {
      this.selectedMother = this.getPedigreeUnknown();
    }

    this.formGroup.patchValue({
      name: this.pedigree.pedigree.name,
      beforeNameTitles: this.pedigree.pedigree.beforeNameTitles,
      afterNameTitles: this.pedigree.pedigree.afterNameTitles,
      description: this.pedigree.pedigree.description,
      owner: this.pedigree.pedigree.owner,
      breeder: this.pedigree.pedigree.breeder,
      callname: this.pedigree.pedigree.callname,
      sex: this.pedigree.pedigree.sex.toLowerCase(),
      registration: this.pedigree.pedigree.registration,
      color: this.pedigree.pedigree.color,
      fightcolor: this.pedigree.pedigree.fightcolor,
      birthdate: this.pedigree.pedigree.birthdate
        ? new Date(this.pedigree.pedigree.birthdate)
        : null,
      conditioned_weight: this.pedigree.pedigree.conditioned_weight,
      chain_weight: this.pedigree.pedigree.chain_weight,
    });
  }

  public onSelectFile(event: FileSelectEvent): void {
    this.files = event.currentFiles;
  }

  public getPedigreeUnknown(): Pedigree {
    return {
      id: 0,
      name: 'DESCONOCIDO',
      fullname: 'DESCONOCIDO',
      description: '',
      img: '',
      birthdate: '',
      owner: '',
      breeder: '',
      conditioned_weight: '',
      chain_weight: '',
      sex: '',
      status: '',
      color: '',
      fightcolor: '',
      title: 0,
      seen: 0,
      registration: '',
      father_id: 0,
      mother_id: 0,
      entered_by: 0,
      entered_by_name: '',
      user_id: 0,
      private: false,
      changePermissions: '',
      descriptionOwner: '',
      beforeNameTitles: '',
      afterNameTitles: '',
      callname: '',
      registrationNumber: '',
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}
