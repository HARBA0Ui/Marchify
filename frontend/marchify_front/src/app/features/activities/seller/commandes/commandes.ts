// commandes.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {  NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { CommandeService } from '../../../../core/services/commande-service';
import { DoughnutController, ArcElement } from 'chart.js';

// Chart.js registration
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js';

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors,
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
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective<'bar' | 'doughnut'>;

  loading = true;
  error: string | null = null;

  // Raw monthly data: { month: "2025-11", count: 42 }
  rawData: { month: string; count: number }[] = [];

  // Monthly chart data
// Monthly chart data with gradient bars
// Monthly chart data
statsData: ChartData<'bar', number[], string> = {
  labels: [],
  datasets: [
    {
      type: 'bar',
      label: 'Nombre de commandes',
      data: [],
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return '#386641';

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(56, 102, 65, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 102, 65, 0.9)');
        return gradient;
      },
      borderColor: '#386641',
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'top',
        color: '#1F3B27',
        formatter: (value: number) => value.toLocaleString()
      },
      hoverBackgroundColor: '#27472D',
      hoverBorderWidth: 2
    }
  ]
};

// Bar chart options
chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: 'nearest',
      intersect: false,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      titleFont: { weight: 'bold', size: 14 },
      bodyFont: { size: 13 },
      cornerRadius: 8,
      padding: 10
    },
    datalabels: {
      display: true,
      color: '#1F3B27',
      anchor: 'end',
      align: 'top'
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 13, weight: 'bold' }, color: '#27472D', maxRotation: 45, minRotation: 0, autoSkip: false },
      title: { display: true, text: 'Mois', font: { size: 14, weight: 'bold' }, color: '#386641' }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(56, 102, 65, 0.1)' },
      ticks: { precision: 0, stepSize: 5, font: { size: 13, weight: 'bold' }, color: '#27472D' },
      title: { display: true, text: 'Nombre de commandes', font: { size: 14, weight: 'bold' }, color: '#386641' }
    }
  },
  interaction: { mode: 'index', intersect: false },
  animation: { duration: 1000, easing: 'easeOutQuart' }
};


  // Status pie chart data
  selectedMonthForStatus: string | null = null;
 statusData: ChartData<'doughnut'> = {
  labels: ['En attente', 'En traitement', 'Prête', 'Expédiée', 'Livré', 'Annulée', 'Retournée'],
  datasets: [{
    data: [],
    backgroundColor: [
      '#DCE8DD', // PENDING
      '#A6C9A1', // PROCESSING
      '#82B366', // READY
      '#386641', // SHIPPED
      '#4D7C59', // DELIVERED
      '#7BA17F', // CANCELLED
      '#C9E0CA'  // RETURNED
    ],
    borderColor: '#ffffff',
    borderWidth: 2,
    hoverOffset: 8
  }]
};

statusOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12, color: '#27472D' } },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw as number;
          const total = context.dataset.data.reduce((a, b) => a + (b as number), 0);
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${label}: ${value} (${percent}%)`;
        }
      },
      backgroundColor: 'rgba(56, 102, 65, 0.9)',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      cornerRadius: 8,
      padding: 10
    }
  },
  animation: { animateRotate: true, animateScale: true }
};


  // Month filter
  selectedMonth: string = '';
  monthsOptions: { value: string; label: string }[] = [];
  private readonly VENDEUR_ID = '691259fc5e08abebfcab33ff';

  constructor(private commandesService: CommandeService) {}

  ngOnInit() {
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
      const monthName = date.toLocaleString('fr-FR', { month: 'short' });
      options.push({
        value: `${year}-${month}`,
        label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
      });
    }
    this.monthsOptions = options;
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.commandesService.getStatsByMonth(this.VENDEUR_ID).subscribe({
      next: (res: any) => {
        this.rawData = res.stats || [];
        this.updateChartData();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur API', err);
        this.error = 'Impossible de charger les statistiques. Réessayez plus tard.';
        this.loading = false;
      }
    });
  }

  updateChartData() {
    if (!this.rawData.length) {
      this.statsData = { labels: [], datasets: [this.statsData.datasets[0]] };
      return;
    }

    const sorted = [...this.rawData].sort((a, b) => {
      const dateA = new Date(a.month + '-01');
      const dateB = new Date(b.month + '-01');
      return dateA.getTime() - dateB.getTime();
    });

    const labels = sorted.map(s => {
      const [y, m] = s.month.split('-');
      const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('fr-FR', { month: 'short' });
      return `${monthName} ${y}`;
    });

    const counts = sorted.map(s => s.count ?? 0);

    this.statsData = {
      labels,
      datasets: [{ ...this.statsData.datasets[0], data: counts }]
    };
  }

  filterByMonth() {
    if (!this.selectedMonth) {
      this.loadData();
      return;
    }

    this.loading = true;
    this.error = null;

    const [yearStr, monthStr] = this.selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.commandesService.getStatsByMonthAndYear(this.VENDEUR_ID, year, month).subscribe({
      next: (res: any) => {
        this.rawData = res.stats || [];
        this.updateChartData();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur API', err);
        this.error = 'Impossible de charger les statistiques pour ce mois.';
        this.loading = false;
      }
    });
  }

  // 👇 NEW: Handle chart bar click
  onChartClick(event: any) {
    if (!event?.active?.length) return;

    const index = event.active[0].index;
    const monthLabel = this.statsData.labels?.[index];
    if (!monthLabel) return;

    // Parse "Nov 2025" → "2025-11"
    const [monthName, yearStr] = monthLabel.split(' ');
    const monthNum = new Date(`${monthName} 1, ${yearStr}`).getMonth() + 1;
    const monthKey = `${yearStr}-${String(monthNum).padStart(2, '0')}`;

    this.selectedMonthForStatus = monthKey;
    this.loadStatusStats(monthKey);
  }

  private loadStatusStats(monthKey: string) {
    this.loading = true;
    this.error = null;

    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    this.commandesService.getStatsByStatusForMonth(this.VENDEUR_ID, year, month).subscribe({
      next: (res: any) => {
        this.updateStatusChartData(res.stats || []);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Erreur API', err);
        this.error = 'Impossible de charger les statistiques par statut.';
        this.loading = false;
      }
    });
  }

  private updateStatusChartData(statusStats: { status: string; count: number }[]) {
    const statusLabels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      READY: 'Prête',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livré',
      CANCELLED: 'Annulée',
      RETURNED: 'Retournée'
    };

    const labels = statusStats.map(s => statusLabels[s.status] || s.status);
    const data = statusStats.map(s => s.count);

    this.statusData = {
      labels,
      datasets: [{ ...this.statusData.datasets[0], data }]
    };
  }

  backToMonthlyView() {
    this.selectedMonthForStatus = null;
    this.refresh();
  }

  downloadChart() {
    const chart = this.chart?.chart;
    if (!chart) {
      console.warn('Chart not ready');
      return;
    }
    const link = document.createElement('a');
    const period = this.selectedMonthForStatus || this.selectedMonth || 'all';
    link.download = `commandes-stats-${period}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
  }

  refresh() {
    this.selectedMonth = '';
    this.loadData();
  }

  get totalOrders(): number {
    return this.rawData.reduce((sum, d) => sum + d.count, 0);
  }

  get avgOrders(): number {
    return this.rawData.length ? +(this.totalOrders / this.rawData.length).toFixed(1) : 0;
  }

  get monthCount(): number {
    return this.rawData.length;
  }
}