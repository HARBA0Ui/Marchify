import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ChartData, ChartOptions } from "chart.js";
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { CommandeService } from '../../../../core/services/commande-service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  LineController,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  LineController,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DatalabelsPlugin
);

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, FormsModule],
  templateUrl: './commandes.html',
  styleUrls: ['./commandes.css'],
})
export class Commandes implements OnInit {
  private commandesService = inject(CommandeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('barChart') barChart?: BaseChartDirective;
  @ViewChild('statusChart') statusChart?: BaseChartDirective;
  @ViewChild('trendChart') trendChart?: BaseChartDirective;

  loading = true;
  error: string | null = null;

  rawData: { month: string; count: number }[] = [];
  selectedMonthForStatus: string | null = null;
  vendeurId: string | null = null;

  // Monthly Bar Chart
  monthlyData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Commandes',
        data: [],
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#386641';
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, 'rgba(56, 102, 65, 0.4)');
          gradient.addColorStop(1, 'rgba(56, 102, 65, 1)');
          return gradient;
        },
        borderColor: '#386641',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: '#27472D',
        hoverBorderWidth: 3,
      },
    ],
  };

  monthlyOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FED16A',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Commandes: ${context.parsed.y}`,
        },
      },
      datalabels: {
        display: true,
        color: '#1F3B27',
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 12 },
        formatter: (value: number) => value,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, weight: 'bold' }, color: '#386641' },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(56, 102, 65, 0.1)' },
        ticks: { precision: 0, font: { size: 12 }, color: '#386641' },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        this.onBarClick(index);
      }
    },
  };

  // Status Doughnut Chart
  statusData: ChartData<'doughnut'> = {
    labels: [
      'En attente',
      'En traitement',
      'Prête',
      'Expédiée',
      'Livrée',
      'Annulée',
      'Retournée',
    ],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FCD34D',
          '#60A5FA',
          '#34D399',
          '#A78BFA',
          '#10B981',
          '#EF4444',
          '#F97316',
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 15,
        hoverBorderWidth: 4,
      },
    ],
  };

  // Status Doughnut Chart - Fixed tooltip callback
  statusOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            // ✅ Fix: Properly type the reduce operation
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a: number, b: number) => a + b, 0);
            const percent =
              total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: { weight: 'bold', size: 14 },
        formatter: (value: number, context) => {
          // ✅ Fix: Properly type the reduce operation
          const dataset = context.dataset.data as number[];
          const total = dataset.reduce((a: number, b: number) => a + b, 0);
          const percent = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
          return value > 0 ? `${percent}%` : '';
        },
      },
    },
    cutout: '60%',
  };

  // Trend Line Chart
  trendData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Tendance',
        data: [],
        borderColor: '#F97A00',
        backgroundColor: 'rgba(249, 122, 0, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#F97A00',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#FED16A',
        bodyColor: '#fff',
        cornerRadius: 8,
      },
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(249, 122, 0, 0.1)' },
        ticks: { color: '#386641', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(56, 102, 65, 0.1)' },
        ticks: { precision: 0, color: '#386641' },
      },
    },
  };

  selectedMonth: string = '';
  monthsOptions: { value: string; label: string }[] = [];

  // Stats summary
  stats = {
    total: 0,
    average: 0,
    monthCount: 0,
    trend: 0,
    topMonth: '',
    topMonthCount: 0,
  };

  ngOnInit() {
    // ✅ Get vendeur ID from auth
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'VENDEUR') {
      this.error = 'Vous devez être connecté en tant que vendeur';
      this.router.navigate(['/login']);
      return;
    }

    this.vendeurId = this.authService.getVendeurId();

    if (!this.vendeurId) {
      this.error = 'ID vendeur non trouvé. Veuillez vous reconnecter.';
      return;
    }

    console.log('✅ Vendeur ID:', this.vendeurId);

    this.generateMonthOptions();
    this.loadData();
  }

  generateMonthOptions() {
    const now = new Date();
    const options = [{ value: '', label: 'Toute la période' }];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleString('fr-FR', { month: 'long' });
      options.push({
        value: `${year}-${month}`,
        label: `${
          monthName.charAt(0).toUpperCase() + monthName.slice(1)
        } ${year}`,
      });
    }
    this.monthsOptions = options;
  }

  loadData() {
    if (!this.vendeurId) {
      this.error = 'ID vendeur non disponible';
      return;
    }

    this.loading = true;
    this.error = null;

    this.commandesService.getStatsByMonth(this.vendeurId).subscribe({
      next: (res: any) => {
        this.rawData = res.stats || [];
        this.updateAllCharts();
        this.calculateStats();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur API', err);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      },
    });
  }

  updateAllCharts() {
    if (!this.rawData.length) return;

    const sorted = [...this.rawData].sort((a, b) => {
      const dateA = new Date(a.month + '-01');
      const dateB = new Date(b.month + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    const labels = sorted.map((s) => {
      const [y, m] = s.month.split('-');
      const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString(
        'fr-FR',
        { month: 'short' }
      );
      return `${monthName} ${y}`;
    });

    const counts = sorted.map((s) => s.count ?? 0);

    // Update monthly bar chart
    this.monthlyData = {
      labels,
      datasets: [{ ...this.monthlyData.datasets[0], data: counts }],
    };

    // Update trend line chart
    this.trendData = {
      labels,
      datasets: [{ ...this.trendData.datasets[0], data: counts }],
    };
  }

  calculateStats() {
    const counts = this.rawData.map((d) => d.count);
    this.stats.total = counts.reduce((a, b) => a + b, 0);
    this.stats.monthCount = this.rawData.length;
    this.stats.average =
      this.stats.monthCount > 0
        ? +(this.stats.total / this.stats.monthCount).toFixed(1)
        : 0;

    // Find top month
    const maxCount = Math.max(...counts);
    const topMonthData = this.rawData.find((d) => d.count === maxCount);
    if (topMonthData) {
      const [y, m] = topMonthData.month.split('-');
      const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString(
        'fr-FR',
        { month: 'long' }
      );
      this.stats.topMonth = `${monthName} ${y}`;
      this.stats.topMonthCount = maxCount;
    }

    // Calculate trend (last 2 months)
    if (counts.length >= 2) {
      const last = counts[counts.length - 1];
      const previous = counts[counts.length - 2];
      this.stats.trend =
        previous > 0 ? +(((last - previous) / previous) * 100).toFixed(1) : 0;
    }
  }

  onBarClick(index: number) {
    const monthLabel = this.monthlyData.labels?.[index];
    if (!monthLabel) return;

    const [monthName, yearStr] = (monthLabel as string).split(' ');
    const monthNum = new Date(`${monthName} 1, ${yearStr}`).getMonth() + 1;
    const monthKey = `${yearStr}-${String(monthNum).padStart(2, '0')}`;

    this.selectedMonthForStatus = monthKey;
    this.loadStatusStats(monthKey);
  }

  private loadStatusStats(monthKey: string) {
    if (!this.vendeurId) return;

    this.loading = true;
    this.error = null;

    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.commandesService
      .getStatsByStatusForMonth(this.vendeurId, year, month)
      .subscribe({
        next: (res: any) => {
          this.updateStatusChartData(res.stats || []);
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Erreur API', err);
          this.error = 'Impossible de charger les statistiques par statut';
          this.loading = false;
        },
      });
  }

  private updateStatusChartData(
    statusStats: { status: string; count: number }[]
  ) {
    const statusLabels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      READY: 'Prête',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
      RETURNED: 'Retournée',
    };

    const labels = statusStats.map((s) => statusLabels[s.status] || s.status);
    const data = statusStats.map((s) => s.count);

    this.statusData = {
      labels,
      datasets: [{ ...this.statusData.datasets[0], data }],
    };
  }

  filterByMonth() {
    if (!this.vendeurId) return;

    if (!this.selectedMonth) {
      this.loadData();
      return;
    }

    this.loading = true;
    this.error = null;

    const [yearStr, monthStr] = this.selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.commandesService
      .getStatsByMonthAndYear(this.vendeurId, year, month)
      .subscribe({
        next: (res: any) => {
          this.rawData = res.stats || [];
          this.updateAllCharts();
          this.calculateStats();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Erreur API', err);
          this.error = 'Impossible de charger les statistiques pour ce mois';
          this.loading = false;
        },
      });
  }

  backToMonthlyView() {
    this.selectedMonthForStatus = null;
    this.refresh();
  }

  downloadChart() {
    const chart = this.selectedMonthForStatus
      ? this.statusChart?.chart
      : this.barChart?.chart;
    if (!chart) {
      console.warn('Chart not ready');
      return;
    }
    const link = document.createElement('a');
    const period = this.selectedMonthForStatus || this.selectedMonth || 'all';
    link.download = `commandes-stats-${period}-${new Date()
      .toISOString()
      .slice(0, 10)}.png`;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
  }

  refresh() {
    this.selectedMonth = '';
    this.selectedMonthForStatus = null;
    this.loadData();
  }
}
