import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { PedigreeComplete } from '../../../../core/models/pedigreeComplete';
import { FightColorPipe } from '../../../../core/pipes/fight-color.pipe';
import { DateFormatPipe } from '../../../../core/pipes/date-format.pipe';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { DropOption } from '../../../../core/models/dropOption';
import { Pedigree } from '../../../../core/models/pedigree';
import { ActivatedRoute, Router } from '@angular/router';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { fullnameTransform } from '../../../../shared/utils/fullname-transform';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../../../environments/environment.development';
import { User } from '../../../../core/models/user';
import { SessionService } from '../../../../core/services/session.service';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-public-pedigree-view',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    TableModule,
    FightColorPipe,
    DateFormatPipe,
    DropdownModule,
    ProgressSpinnerModule,
    FooterComponent,
  ],
  templateUrl: './public-pedigree-view.component.html',
  styleUrl: './public-pedigree-view.component.scss',
})
export class PublicPedigreeViewComponent implements OnInit {
  public pedigree!: PedigreeComplete;
  public filterOptions: DropOption[] = [];
  public fullBrothersCount: number = 0;
  public foot: string = '';
  public siblings: Pedigree[] = [];
  public pedigreeStatistics: Pedigree[] = [];
  public isLoading: boolean = false;
  public idPedigree: number = 0;
  public urlImg: string = `${environment.uploads_url}pedigrees/`;
  public user!: User | undefined;
  public isPrivate: boolean = false;
  public colors: string[] = [
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
    'color-6',
    'color-7',
    'color-8',
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
    'color-6',
    'color-7',
    'color-8',
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
    'color-6',
    'color-7',
    'color-8',
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
    'color-6',
    'color-7',
    'color-8',
  ];

  constructor(
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly pedigreeService: PedigreeService,
    private readonly sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.route.paramMap.subscribe((params) => {
      this.idPedigree = Number(params.get('id'));
      this.isLoading = true;
      this.getPedigreeById(this.idPedigree);
    });

    setTimeout(() => {
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

      this.foot = this.translocoService.translate('footer.foot');
    }, 1000);
  }

  private getPedigreeById(id: number): void {
    this.pedigreeService.getPedigreeById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.pedigree = fullnameTransform(res.response);
        this.siblings = this.pedigree.siblings;
        this.fullBrothersCount = this.getBrothers('full').length;

        this.setPercentStatictics();

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
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  public onChangeIdPedigree(event: number): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['public/pedigree', event])
    );
    window.location.href = url;
  }

  public tabActive: string = 'pedigree';

  public changeTab(tab: string) {
    this.tabActive = tab;
  }

  public onChangeFilter(event: DropdownChangeEvent) {
    this.siblings = this.getBrothers(event.value);
  }

  public setPercentStatictics(): void {
    const generations: Pedigree[] = [
      ...this.pedigree.generation1,
      ...this.pedigree.generation2,
      ...this.pedigree.generation3,
      ...this.pedigree.generation4,
    ];

    for (const pedigree of generations) {
      if (
        pedigree &&
        !this.pedigreeStatistics.filter((ped) => {
          return ped.id === pedigree.id;
        }).length
      ) {
        const countGenerations1: number = this.pedigree.generation1.filter(
          (ped) => {
            if (ped) {
              return ped.id === pedigree.id;
            } else {
              return false;
            }
          }
        ).length;

        const countGenerations2: number = this.pedigree.generation2.filter(
          (ped) => {
            if (ped) {
              return ped.id === pedigree.id;
            } else {
              return false;
            }
          }
        ).length;
        const countGenerations3: number = this.pedigree.generation3.filter(
          (ped) => {
            if (ped) {
              return ped.id === pedigree.id;
            } else {
              return false;
            }
          }
        ).length;
        const countGenerations4: number = this.pedigree.generation4.filter(
          (ped) => {
            if (ped) {
              return ped.id === pedigree.id;
            } else {
              return false;
            }
          }
        ).length;

        pedigree.percentStatistic =
          countGenerations1 * 50 +
          countGenerations2 * 25 +
          countGenerations3 * 12.5 +
          countGenerations4 * 6.25;

        if (pedigree.percentStatistic > 100) {
          pedigree.percentStatistic = 100;
        }

        this.pedigreeStatistics.push(pedigree);
      }
    }

    this.pedigreeStatistics.sort((a, b) => {
      return (b.percentStatistic || 0) - (a.percentStatistic || 0);
    });
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

  public get offspringsWithTitlesBeforeName(): number {
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

  public get offspringsWithTitlesAfterName(): number {
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
