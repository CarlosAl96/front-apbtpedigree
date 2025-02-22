import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ForumPost } from '../../../../core/models/forumPost';
import { SocketService } from '../../../../core/services/socket.service';

@Component({
  selector: 'app-new-post',
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
  templateUrl: './new-post.component.html',
  styleUrl: './new-post.component.scss',
})
export class NewPostComponent {
  @ViewChild('editor') editor: Editor | undefined;
  public imgDialog: boolean = false;
  public urlImageModel: string = '';
  public idTopic: number = 0;
  public idPost: number = 0;
  public idPostReply: number = 0;
  public modelCategory: number = 0;
  public modelMessage: string = '';
  public forumCategories: ForumCategory[] = [];
  public topic!: ForumTopic;
  public post!: ForumPost;
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
      this.idTopic = Number(params.get('idTopic'));
      this.getTopicById(this.idTopic);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['opt'] && params['id']) {
        this.option = 'edit';
        this.idPost = Number(params['id']);
        this.getPostById(this.idPost);
      }

      if (params['id_post_reply']) {
        this.idPostReply = Number(params['id_post_reply']);
        this.getPostById(this.idPostReply);
      }
    });

    this.formGroup = this.formBuilder.group({
      subject: [''],
      message: ['', Validators.required],
      urlImg: [''],
    });
  }

  private getCategories(): void {
    this.forumService.getCategories({ size: 100000, page: 0 }).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getTopicById(id: number): void {
    this.forumService.getTopicById(id, false).subscribe({
      next: (res) => {
        this.topic = res.response;
        this.modelCategory = this.topic.id_categories;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getPostById(id: number): void {
    this.forumService.getPostById(id).subscribe({
      next: (res) => {
        this.post = res.response;

        if (this.idPostReply) {
          setTimeout(() => {
            this.addQuoteToQuill();
          }, 1000);
        } else {
          this.formGroup.patchValue({
            subject: this.post.subject,
            message: this.post.message,
          });
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public createOrEdit() {
    if (this.option == 'edit') {
      this.editPost();
    } else {
      this.savePost();
    }
  }

  public savePost(): void {
    this.markFormControlsAsDirty(this.formGroup);
    console.log(this.formGroup.value);

    if (this.formGroup.valid) {
      this.loading = true;
      const obj: any = {
        subject: this.formGroup.value.subject,
        id_categories: this.topic.id_categories,
        id_author: this.user?.id ?? 0,
        author: this.user?.username ?? '',
        message: this.formGroup.value.message,
        id_post_reply: this.idPostReply,
        id_topic: this.topic.id,
      };

      this.forumService.createPost(obj).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.createdPost'),
          });
          this.router.navigateByUrl('/forum/posts/' + this.topic.id);
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.createdPostError'),
          });
          this.loading = false;
        },
      });
    }
  }

  public editPost() {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;

      const obj: any = {
        subject: this.formGroup.value.subject,
        message: this.formGroup.value.message,
      };

      this.forumService.updatePost(obj, this.idPost).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.updatePost'),
          });
          this.router.navigateByUrl('/forum/posts/' + this.topic.id);
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.updatePostError'),
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

  public async addQuoteToQuill(): Promise<void> {
    const quotedContent: string = `<blockquote class="blockquote">${this.post.message}</blockquote>`;

    const range = this.editor?.quill.getSelection();
    const position = range ? range.index : this.editor?.quill.getLength();
    this.editor?.quill.clipboard.dangerouslyPasteHTML(position, quotedContent);
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
    });

    this.editor?.quill.root.dispatchEvent(event);
    this.editor?.quill.root.dispatchEvent(event);
  }

  public showDialog(): void {
    this.imgDialog = true;
  }

  public cancel(): void {
    this.router.navigateByUrl('/forum/posts/' + this.topic.id);
  }
}
