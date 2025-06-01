import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
// Import pour ng2-charts version 8.0.0
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
// Import nécessaire pour Chart.js
import 'chart.js/auto';
// Import des services et modèles nécessaires
import { AccountService, BankAccount, AccountOperation, AccountHistory } from '../services/account.service';
import { CustomerService, Customer } from '../services/customer.service';
import { finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interface pour les statistiques
interface Statistics {
  totalAccounts: number;
  totalCustomers: number;
  totalBalance: number;
  totalCurrentAccounts: number;
  totalSavingAccounts: number;
  averageBalance: number;
}

// Interface pour les données des opérations
interface OperationData {
  labels: string[];
  creditData: number[];
  debitData: number[];
  totalsByMonth: { [key: string]: { credit: number; debit: number } };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, BaseChartDirective],
  providers: [
    provideCharts(withDefaultRegisterables())
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Données pour les statistiques
  statistics: Statistics = {
    totalAccounts: 0,
    totalCustomers: 0,
    totalBalance: 0,
    totalCurrentAccounts: 0,
    totalSavingAccounts: 0,
    averageBalance: 0
  };

  // Variables pour les graphiques
  accountTypeData: ChartData<'pie'> = {
    labels: ['Comptes Courants', 'Comptes Épargne'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4F46E5', '#10B981'],
        hoverBackgroundColor: ['#6366F1', '#059669']
      }
    ]
  };

  operationsData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Crédits',
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10B981',
        hoverBackgroundColor: '#059669',
        borderWidth: 1
      },
      {
        data: [],
        label: 'Débits',
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#EF4444',
        hoverBackgroundColor: '#DC2626',
        borderWidth: 1
      }
    ]
  };

  balanceHistoryData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Solde total',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3B82F6',
        fill: 'origin',
        tension: 0.4
      }
    ]
  };

  // Options pour les graphiques
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };

  // Types de graphiques
  pieChartType: ChartType = 'pie';
  barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';

  // Indicateur de chargement
  loading = true;
  error: string | null = null;
  recentOperations: AccountOperation[] = [];

  // Cartes des statistiques
  cards = [
    { icon: 'users', title: 'Clients', value: 0, color: 'bg-blue-500' },
    { icon: 'credit-card', title: 'Comptes', value: 0, color: 'bg-green-500' },
    { icon: 'money-bill', title: 'Balance Totale', value: 0, color: 'bg-purple-500', isCurrency: true },
    { icon: 'chart-line', title: 'Balance Moyenne', value: 0, color: 'bg-orange-500', isCurrency: true }
  ];

  constructor(
    private accountService: AccountService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Chargement parallèle des données
    forkJoin([
      this.customerService.getCustomers().pipe(catchError(err => {
        console.error('Erreur lors du chargement des clients:', err);
        return of([]);
      })),
      this.accountService.getAccounts().pipe(catchError(err => {
        console.error('Erreur lors du chargement des comptes:', err);
        return of([]);
      }))
    ])
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: ([customers, accounts]) => {
        // Mise à jour des statistiques
        this.updateStatistics(customers, accounts);

        // Mise à jour du graphique des types de comptes
        this.updateAccountTypeChart(accounts);

        // Chargement des opérations pour les graphiques d'opérations et d'historique
        this.loadOperationsData(accounts);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du tableau de bord:', err);
        this.error = "Une erreur est survenue lors du chargement des données.";
      }
    });
  }

  updateStatistics(customers: Customer[], accounts: BankAccount[]): void {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalCurrentAccounts = accounts.filter(account => account.type === 'CurrentAccount').length;
    const totalSavingAccounts = accounts.filter(account => account.type === 'SavingAccount').length;

    this.statistics = {
      totalAccounts: accounts.length,
      totalCustomers: customers.length,
      totalBalance: totalBalance,
      totalCurrentAccounts: totalCurrentAccounts,
      totalSavingAccounts: totalSavingAccounts,
      averageBalance: accounts.length ? totalBalance / accounts.length : 0
    };

    // Mise à jour des cartes
    this.cards[0].value = customers.length;
    this.cards[1].value = accounts.length;
    this.cards[2].value = totalBalance;
    this.cards[3].value = this.statistics.averageBalance;
  }

  updateAccountTypeChart(accounts: BankAccount[]): void {
    const currentAccounts = accounts.filter(account => account.type === 'CurrentAccount').length;
    const savingAccounts = accounts.filter(account => account.type === 'SavingAccount').length;

    this.accountTypeData.datasets[0].data = [currentAccounts, savingAccounts];
  }

  loadOperationsData(accounts: BankAccount[]): void {
    if (accounts.length === 0) return;

    // Sélectionner quelques comptes pour l'analyse (limiter les appels API)
    const accountsToAnalyze = accounts.slice(0, Math.min(5, accounts.length));

    const operationsRequests = accountsToAnalyze.map(account =>
      this.accountService.getAccountHistory(account.id, 0, 20).pipe(
        catchError(err => {
          console.error(`Erreur lors du chargement des opérations pour le compte ${account.id}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(operationsRequests)
      .subscribe({
        next: (results) => {
          const validResults = results.filter(result => result !== null) as AccountHistory[];

          // Collecter toutes les opérations
          let allOperations: AccountOperation[] = [];
          validResults.forEach(history => {
            if (history && history.accountOperationDTOS) {
              allOperations = [...allOperations, ...history.accountOperationDTOS];
            }
          });

          // Trier les opérations par date (plus récente d'abord)
          allOperations.sort((a, b) =>
            new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
          );

          // Stocker les opérations récentes pour affichage
          this.recentOperations = allOperations.slice(0, 10);

          // Préparer les données pour les graphiques
          const operationData = this.prepareOperationsData(allOperations);
          this.updateOperationsCharts(operationData);

          // Simuler des données historiques de solde pour la démo
          this.generateBalanceHistoryData(accounts);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des opérations:', err);
        }
      });
  }

  prepareOperationsData(operations: AccountOperation[]): OperationData {
    // Regrouper les opérations par mois
    const totalsByMonth: { [key: string]: { credit: number; debit: number } } = {};

    operations.forEach(op => {
      const date = new Date(op.operationDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!totalsByMonth[monthYear]) {
        totalsByMonth[monthYear] = { credit: 0, debit: 0 };
      }

      if (op.type === 'CREDIT') {
        totalsByMonth[monthYear].credit += op.amount;
      } else {
        totalsByMonth[monthYear].debit += op.amount;
      }
    });

    // Convertir les données pour le graphique (6 derniers mois)
    const sortedMonths = Object.keys(totalsByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      return (yearA - yearB) || (monthA - monthB);
    }).slice(-6);

    const creditData: number[] = [];
    const debitData: number[] = [];

    sortedMonths.forEach(month => {
      creditData.push(totalsByMonth[month].credit);
      debitData.push(totalsByMonth[month].debit);
    });

    return {
      labels: sortedMonths,
      creditData,
      debitData,
      totalsByMonth
    };
  }

  updateOperationsCharts(operationData: OperationData): void {
    this.operationsData = {
      labels: operationData.labels,
      datasets: [
        {
          data: operationData.creditData,
          label: 'Crédits',
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: '#10B981',
          hoverBackgroundColor: '#059669',
          borderWidth: 1
        },
        {
          data: operationData.debitData,
          label: 'Débits',
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: '#EF4444',
          hoverBackgroundColor: '#DC2626',
          borderWidth: 1
        }
      ]
    };
  }

  // Génère des données simulées pour l'historique des soldes (pour la démo)
  generateBalanceHistoryData(accounts: BankAccount[]): void {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const labels = [];
    const balanceData = [];

    // Générer des données pour les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);

      // Simuler une tendance à la hausse avec quelques fluctuations
      const currentBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
      const factor = 0.8 + (i * 0.02); // Facteur de croissance
      const randomFactor = 0.9 + Math.random() * 0.2; // Fluctuation aléatoire

      balanceData.push(currentBalance * factor * randomFactor);
    }

    this.balanceHistoryData = {
      labels: labels,
      datasets: [
        {
          data: balanceData,
          label: 'Solde total',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3B82F6',
          fill: 'origin',
          tension: 0.4
        }
      ]
    };
  }

  // Pour aider au formatage de la monnaie
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  // Pour formater les dates
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Pour obtenir la classe CSS en fonction du type d'opération
  getOperationTypeClass(type: string): string {
    return type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
  }
}
