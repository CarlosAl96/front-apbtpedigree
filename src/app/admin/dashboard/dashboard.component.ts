import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { ChartDat } from '../../core/models/chartDat';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TranslocoModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  public loggeds: number = 0;
  public users: number = 0;
  public pedigrees: number = 0;
  public payments: number = 0;
  public usersData: ChartDat[] = [];
  public paymentsData: ChartDat[] = [];
  public chartDataUsers: any;
  public chartDataUsersOptions: any;
  public chartDataPayments: any;
  public chartDataPaymentsOptions: any;

  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
    private readonly translocoService: TranslocoService
  ) {
    this.getUsersLoggedInfo();
    this.getDashboardData();
    this.socketService.onLoginInfo().subscribe({
      next: (res) => {
        this.loggeds = res.count;
      },
    });
  }

  public getDashboardData(): void {
    this.authService.getDashboardData().subscribe({
      next: (res) => {
        this.users = res.response.users;
        this.pedigrees = res.response.pedigrees;
        this.payments = res.response.payments;
        this.usersData = this.fillMissingMonths(res.response.usersData);
        this.paymentsData = this.fillMissingMonths(res.response.paymentsData);

        this.loadChartDataUsers();
        this.loadChartDataPayments();
      },
      error: (error) => {},
    });
  }

  public getUsersLoggedInfo(): void {
    this.authService.getUsersLoggedAndSubs().subscribe({
      next: (res) => {
        this.loggeds = res.response.logged;
      },
      error: (error) => {},
    });
  }

  public loadChartDataUsers(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartDataUsers = {
      labels: this.usersData.map((data) => data.month),
      datasets: [
        {
          label: this.translocoService.translate('navbar.items.users'),
          data: this.usersData.map((data) => data.count),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4,
        },
      ],
    };

    this.chartDataUsersOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  public loadChartDataPayments(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartDataPayments = {
      labels: this.paymentsData.map((data) => data.month),
      datasets: [
        {
          label: this.translocoService.translate('payments.title'),
          data: this.paymentsData.map((data) => data.count),
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
        },
      ],
    };

    this.chartDataPaymentsOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  public fillMissingMonths(array: ChartDat[]): ChartDat[] {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return last12Months.map((month) => ({
      month,
      count: array.find((p) => p.month === month)?.count || 0,
    }));
  }
}
