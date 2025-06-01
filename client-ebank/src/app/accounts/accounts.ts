import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AccountService, BankAccount, AccountOperation, AccountHistory, TransferRequest, CurrentBankAccount, SavingBankAccount } from '../services/account.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css'
})
export class Accounts implements OnInit {
  accounts: BankAccount[] = [];
  selectedAccount: BankAccount | null = null;
  accountOperations: AccountOperation[] = [];
  accountHistory: AccountHistory | null = null;
  loading = false;
  operationsLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Formulaires
  transferForm: FormGroup;
  debitForm: FormGroup;
  creditForm: FormGroup;

  // États d'affichage
  showTransferForm = false;
  showDebitForm = false;
  showCreditForm = false;
  currentPage = 0;
  pageSize = 5;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.transferForm = this.fb.group({
      accountDestination: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.debitForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.creditForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  // Méthodes d'accès sécurisées pour les propriétés spécifiques du compte
  getOverDraft(): number {
    if (this.selectedAccount && this.selectedAccount.type === 'CurrentAccount') {
      return (this.selectedAccount as CurrentBankAccount).overDraft || 0;
    }
    return 0;
  }

  getInterestRate(): number {
    if (this.selectedAccount && this.selectedAccount.type === 'SavingAccount') {
      return (this.selectedAccount as SavingBankAccount).interestRate || 0;
    }
    return 0;
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.accounts = data;
          console.log('Comptes chargés:', this.accounts);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des comptes:', err);
          this.error = "Erreur lors du chargement des comptes bancaires";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  selectAccount(account: BankAccount): void {
    this.selectedAccount = account;
    this.loadAccountHistory(account.id);
  }

  loadAccountHistory(accountId: string, page: number = 0): void {
    this.operationsLoading = true;
    this.currentPage = page;

    this.accountService.getAccountHistory(accountId, page, this.pageSize)
      .pipe(finalize(() => this.operationsLoading = false))
      .subscribe({
        next: (history) => {
          this.accountHistory = history;
          console.log('Historique du compte:', this.accountHistory);
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'historique:', err);
          this.error = "Erreur lors du chargement de l'historique du compte";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  nextPage(): void {
    if (this.selectedAccount && this.accountHistory && this.currentPage < this.accountHistory.totalPages - 1) {
      this.loadAccountHistory(this.selectedAccount.id, this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.selectedAccount && this.currentPage > 0) {
      this.loadAccountHistory(this.selectedAccount.id, this.currentPage - 1);
    }
  }

  toggleTransferForm(): void {
    this.showTransferForm = !this.showTransferForm;
    if (this.showTransferForm) {
      this.showDebitForm = false;
      this.showCreditForm = false;
      this.transferForm.reset();
    }
  }

  toggleDebitForm(): void {
    this.showDebitForm = !this.showDebitForm;
    if (this.showDebitForm) {
      this.showTransferForm = false;
      this.showCreditForm = false;
      this.debitForm.reset();
    }
  }

  toggleCreditForm(): void {
    this.showCreditForm = !this.showCreditForm;
    if (this.showCreditForm) {
      this.showTransferForm = false;
      this.showDebitForm = false;
      this.creditForm.reset();
    }
  }

  executeTransfer(): void {
    if (this.transferForm.invalid || !this.selectedAccount) {
      return;
    }

    const formValue = this.transferForm.value;
    const transferRequest: TransferRequest = {
      accountSource: this.selectedAccount.id,
      accountDestination: formValue.accountDestination,
      amount: formValue.amount,
      description: formValue.description
    };

    this.loading = true;
    this.accountService.transfer(transferRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = "Virement effectué avec succès";
          setTimeout(() => this.successMessage = null, 3000);
          this.showTransferForm = false;
          this.transferForm.reset();
          this.refreshAccountData();
        },
        error: (err) => {
          console.error('Erreur lors du virement:', err);
          this.error = err.error?.message || "Erreur lors du virement";
          setTimeout(() => this.error = null, 5000);
        }
      });
  }

  executeDebit(): void {
    if (this.debitForm.invalid || !this.selectedAccount) {
      return;
    }

    const formValue = this.debitForm.value;
    const debitRequest = {
      accountId: this.selectedAccount.id,
      amount: formValue.amount,
      description: formValue.description
    };

    this.loading = true;
    this.accountService.debit(debitRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = "Débit effectué avec succès";
          setTimeout(() => this.successMessage = null, 3000);
          this.showDebitForm = false;
          this.debitForm.reset();
          this.refreshAccountData();
        },
        error: (err) => {
          console.error('Erreur lors du débit:', err);
          this.error = err.error?.message || "Erreur lors du débit";
          setTimeout(() => this.error = null, 5000);
        }
      });
  }

  executeCredit(): void {
    if (this.creditForm.invalid || !this.selectedAccount) {
      return;
    }

    const formValue = this.creditForm.value;
    const creditRequest = {
      accountId: this.selectedAccount.id,
      amount: formValue.amount,
      description: formValue.description
    };

    this.loading = true;
    this.accountService.credit(creditRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.successMessage = "Crédit effectué avec succès";
          setTimeout(() => this.successMessage = null, 3000);
          this.showCreditForm = false;
          this.creditForm.reset();
          this.refreshAccountData();
        },
        error: (err) => {
          console.error('Erreur lors du crédit:', err);
          this.error = err.error?.message || "Erreur lors du crédit";
          setTimeout(() => this.error = null, 5000);
        }
      });
  }

  refreshAccountData(): void {
    if (this.selectedAccount) {
      // Recharger les détails du compte
      this.accountService.getAccount(this.selectedAccount.id).subscribe({
        next: (account) => {
          this.selectedAccount = account;
          // Mettre à jour le compte dans la liste
          const index = this.accounts.findIndex(acc => acc.id === account.id);
          if (index !== -1) {
            this.accounts[index] = account;
          }
          // Recharger l'historique
          this.loadAccountHistory(account.id, this.currentPage);
        },
        error: (err) => {
          console.error('Erreur lors du rafraîchissement du compte:', err);
        }
      });
    }
  }

  getAccountTypeLabel(type: string): string {
    switch (type) {
      case 'CurrentAccount':
        return 'Compte Courant';
      case 'SavingAccount':
        return 'Compte Épargne';
      default:
        return type;
    }
  }

  getOperationTypeClass(type: string): string {
    return type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
  }

  getOperationIcon(type: string): string {
    return type === 'CREDIT'
      ? 'M12 4v1.5m6 4.5c0 2.21-3.582 4.5-6 4.5s-6-2.29-6-4.5 3.582-4.5 6-4.5 6 2.29 6 4.5zm0 7.5h-12'
      : 'M15 12H9m12 0h-3m-2-4v-4m-8 4v-4m8 12h-8';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  closeError(): void {
    this.error = null;
  }

  closeSuccess(): void {
    this.successMessage = null;
  }
}
