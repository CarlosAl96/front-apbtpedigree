import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { PedigreeComplete } from '../../../../core/models/pedigreeComplete';
import { FightColorPipe } from '../../../../core/pipes/fight-color.pipe';
import { DateFormatPipe } from '../../../../core/pipes/date-format.pipe';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DropOption } from '../../../../core/models/dropOption';
import { Pedigree } from '../../../../core/models/pedigree';
import { environment } from '../../../../../environments/environment.development';
import { SessionService } from '../../../../core/services/session.service';
import { User } from '../../../../core/models/user';
import { DogLog } from '../../../../core/models/dogLog';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { DateHourFormatPipe } from '../../../../core/pipes/date-hour-format.pipe';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pedigree-view',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    TableModule,
    FightColorPipe,
    DateFormatPipe,
    DropdownModule,
    DateHourFormatPipe,
  ],
  templateUrl: './pedigree-view.component.html',
  styleUrl: './pedigree-view.component.scss',
})
export class PedigreeViewComponent implements OnInit {
  @Input('pedigree') pedigree!: PedigreeComplete;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.isFromPedigreeSearch) {
      this.goBack();
      this.location.forward();
    }
  }
  @Output() idPedigree: EventEmitter<number> = new EventEmitter<number>();
  public filterOptions: DropOption[] = [];
  public fullBrothersCount: number = 0;
  public siblings: Pedigree[] = [];
  public urlImg: string = `${environment.uploads_url}pedigrees/`;
  public user!: User | undefined;
  public dogLogs: DogLog[] = [];

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private readonly pedigreeService: PedigreeService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.translocoService.langChanges$.subscribe((res) => {
      this.filterOptions = [
        {
          name: this.translocoService.translate('yourPedigrees.all'),
          code: 'all',
        },
        {
          name: this.translocoService.translate(
            'yourPedigrees.pedigreeStats.halfBrothersSire'
          ),
          code: 'half-sire',
        },
        {
          name: this.translocoService.translate(
            'yourPedigrees.pedigreeStats.halfBrothersDam'
          ),
          code: 'half-dam',
        },
        {
          name: this.translocoService.translate('yourPedigrees.fullBrothers'),
          code: 'full',
        },
      ];
    });
  }
  ngOnInit(): void {
    if (this.pedigree) {
      this.siblings = this.pedigree.siblings;
      this.fullBrothersCount = this.getBrothers('full').length;
      this.getLogs();
    }
  }

  public tabActive: string = 'pedigree';

  public changeTab(tab: string) {
    this.tabActive = tab;
  }

  public goBack(): void {
    window.history.back();
  }

  public onChangeIdPedigree(event: number): void {
    this.idPedigree.emit(event);
  }

  public onChangeFilter(event: DropdownChangeEvent) {
    this.siblings = this.getBrothers(event.value);
  }

  public goToPublicView(): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['public/pedigree', this.pedigree.pedigree.id])
    );
    window.open(url, '_blank');
  }

  public getBrothers(option: string): Pedigree[] {
    if (this.pedigree) {
      const idFather: number = this.pedigree.pedigree.father_id;
      const idMother: number = this.pedigree.pedigree.mother_id;

      const siblings: Pedigree[] = this.pedigree.siblings.filter((sibling) => {
        switch (option) {
          case 'full':
            return (
              sibling.father_id === idFather && sibling.mother_id === idMother
            );

          case 'half-sire':
            return (
              sibling.father_id === idFather && sibling.mother_id !== idMother
            );

          case 'half-dam':
            return (
              sibling.mother_id === idMother && sibling.father_id !== idFather
            );

          case 'all':
            return (
              sibling.father_id === idFather || sibling.mother_id === idMother
            );

          default:
            return false;
        }
      });

      return siblings;
    }

    return [];
  }

  public getLogs(): void {
    this.pedigreeService.getLogs(this.pedigree.pedigree.id).subscribe({
      next: (res) => {
        this.dogLogs = res.response;
      },
    });
  }

  public get offspingsWithTitlesBeforeName(): number {
    return this.pedigree.offsprings.filter((offspring) => {
      if (
        offspring.beforeNameTitles !== null &&
        offspring.beforeNameTitles.trim() !== '' &&
        offspring.beforeNameTitles !== 'null'
      ) {
        return true;
      }

      let flag: boolean = false;
      let afterNames: string = '(ch) (gr';
      const split: string = offspring.name
        .trim()
        .split(' ')[0]
        .trim()
        .toLowerCase();
      if (afterNames.includes(split)) {
        flag = true;
      }
      return flag;
    }).length;
  }

  public get offspingsWithTitlesAfterName(): number {
    return this.pedigree.offsprings.filter((offspring) => {
      if (
        offspring.afterNameTitles !== null &&
        offspring.afterNameTitles.trim() !== '' &&
        offspring.afterNameTitles !== 'null'
      ) {
        return true;
      }

      let flag: boolean = false;
      let afterNames: string = 'rom por (rom) (por)';
      const split: string = offspring.name
        .trim()
        .split(' ')
        [offspring.name.trim().split(' ').length - 1].trim()
        .toLowerCase();
      if (afterNames.includes(split)) {
        flag = true;
      }
      return flag;
    }).length;
  }
}
