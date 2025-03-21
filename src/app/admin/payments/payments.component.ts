import { Component, OnInit } from '@angular/core';
import { Payment } from '../../core/models/payment';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { QueryPagination } from '../../core/models/queryPagination';
import { DateHourFormatPipe } from '../../core/pipes/date-hour-format.pipe';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    ButtonModule,
    TranslocoModule,
    TableModule,
    PaginatorModule,
    FormsModule,
    InputTextModule,
    DateHourFormatPipe,
    CardModule,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
})
export class PaymentsComponent implements OnInit {
  public totalRows: number = 0;
  public first: number = 0;
  public payments!: Payment[];
  public isLoading: boolean = false;
  public modelSearch: string = '';
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  constructor(
    private readonly paymentService: PaymentService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);

        this.first = this.queryPagination.page * this.queryPagination.size;
        if (params['search']) {
          this.queryPagination.search = params['search'] as string;
          this.modelSearch = this.queryPagination.search;
        }

        this.getPayments(this.queryPagination);
      }
    });
  }
  ngOnInit(): void {
    this.getPayments(this.queryPagination);
  }

  private getPayments(query: QueryPagination): void {
    this.isLoading = true;
    this.paymentService.getPayments(query).subscribe({
      next: (res) => {
        this.payments = res.response.data;
        this.totalRows = res.response.totalRows;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  public search(): void {
    this.queryPagination = { size: 50, page: 0 };
    this.queryPagination.search = this.modelSearch as string;

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/admin/payments?${queryString}`;
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/admin/payments?${queryString}`;
  }
}
