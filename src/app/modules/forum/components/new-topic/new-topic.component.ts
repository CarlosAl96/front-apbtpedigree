import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { ForumService } from '../../../../core/services/forum.service';
import { ForumCategory } from '../../../../core/models/forumCategory';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { Editor, EditorModule } from 'primeng/editor';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DateHourFormatPipe } from '../../../../core/pipes/date-hour-format.pipe';
import { User } from '../../../../core/models/user';
import { SessionService } from '../../../../core/services/session.service';
import { ForumTopic } from '../../../../core/models/forumTopic';
import { SocketService } from '../../../../core/services/socket.service';

@Component({
  selector: 'app-new-topic',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    EditorModule,
    RouterLink,
    DialogModule,
    DateHourFormatPipe,
  ],
  providers: [],
  templateUrl: './new-topic.component.html',
  styleUrl: './new-topic.component.scss',
})
export class NewTopicComponent {
  @ViewChild('editor') editor: Editor | undefined;
  public idCategory: number = 0;
  public imgDialog: boolean = false;
  public urlImageModel: string = '';
  public idTopic: number = 0;
  public modelCategory: number = 0;
  public modelMessage: string = '';
  public forumCategory!: ForumCategory;
  public forumCategories: ForumCategory[] = [];
  public topic!: ForumTopic;
  public formGroup!: FormGroup;
  public user!: User | undefined;
  public loading: boolean = false;
  public preview: boolean = false;
  public option: string = '';
  public now: Date = new Date();
  public editorToolbar = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['link', 'image'],
      ],
      handlers: {
        image: () => this.customImageHandler(),
      },
    },
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forumService: ForumService,
    private readonly translocoService: TranslocoService,
    private readonly formBuilder: FormBuilder,
    private readonly messageService: ToastService,
    private readonly sessionService: SessionService
  ) {
    this.getCategories();

    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.route.paramMap.subscribe((params) => {
      this.idCategory = Number(params.get('idCategory'));
      this.modelCategory = this.idCategory;
      this.getCategory(this.idCategory);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['opt'] && params['id']) {
        this.option = 'edit';
        this.idTopic = Number(params['id']);

        this.getTopicById(this.idTopic);
      }
    });

    this.formGroup = this.formBuilder.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
      urlImg: [''],
    });
  }

  private getCategory(id: number) {
    this.forumService.getCategoryById(id).subscribe({
      next: (res) => {
        this.forumCategory = res.response;
      },
      error: (error) => {},
    });
  }

  private getCategories(): void {
    this.forumService.getCategories({ size: 100000, page: 0 }).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
      },
      error: (error) => {},
    });
  }

  private getTopicById(id: number): void {
    this.forumService.getTopicById(id, false).subscribe({
      next: (res) => {
        this.topic = res.response;

        this.formGroup.patchValue({
          subject: this.topic.name,
          message: this.topic.message,
        });
      },
      error: (error) => {},
    });
  }

  public createOrEdit() {
    if (this.option == 'edit') {
      this.editTopic();
    } else {
      this.saveTopic();
    }
  }

  public saveTopic(): void {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;
      const obj: any = {
        name: this.formGroup.value.subject,
        id_categories: this.idCategory,
        id_author: this.user?.id ?? 0,
        author: this.user?.username ?? '',
        message: this.formGroup.value.message,
      };

      this.forumService.createTopic(obj).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.createdTopic'),
          });
          this.router.navigateByUrl('/forum/topics/' + this.forumCategory.id);
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.createdTopicError'),
          });
          this.loading = false;
        },
      });
    }
  }

  public editTopic() {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;

      const obj: any = {
        name: this.formGroup.value.subject,
        message: this.formGroup.value.message,
      };

      this.forumService.updateTopic(obj, this.topic.id).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.updateTopic'),
          });
          this.router.navigateByUrl('/forum/topics/' + this.forumCategory.id);
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.updateTopicError'),
          });
          this.loading = false;
        },
      });
    }
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      this.router.navigateByUrl(`forum/topics/${this.modelCategory}`);
    }
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }

  public customImageHandler(): void {
    document.getElementById('urlDialogShow')?.click();
  }

  public async addImgToQuill(): Promise<void> {
    this.imgDialog = false;
    this.editor?.quill.focus();
    const range = this.editor?.quill.getSelection();
    if (this.urlImageModel !== '') {
      await this.editor?.quill.insertEmbed(
        range.index,
        'image',
        this.urlImageModel
      );

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      });

      this.editor?.quill.root.dispatchEvent(event);
    }
    this.urlImageModel = '';
  }

  public showDialog(): void {
    this.imgDialog = true;
  }

  public cancel(): void {
    this.router.navigateByUrl('/forum/topics/' + this.forumCategory.id);
  }
}
