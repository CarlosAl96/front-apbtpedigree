import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { Pedigree } from '../../../../core/models/pedigree';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-public-link',
  standalone: true,
  imports: [TranslocoModule, CardModule, ButtonModule],
  templateUrl: './public-link.component.html',
  styleUrl: './public-link.component.scss',
})
export class PublicLinkComponent implements OnInit {
  @Input('pedigree') pedigree!: Pedigree;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;
  public url: string = '';
  public html: string = '';
  constructor(private readonly router: Router) {}
  ngOnInit(): void {
    this.url = `${window.location.origin}/public/pedigree/${this.pedigree.id}`;
    this.html = `<a href="${this.url}">${this.pedigree.fullname}</a>`;
  }

  public copy(text: string): void {
    navigator.clipboard.writeText(text);
  }

  public goBack(): void {
    location.reload();
  }
}
