import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BankAccount {
  id: string;
  balance: number;
  createdAt: Date;
  status: string;
  customerDTO: any;
  type: string;
}

export interface CurrentBankAccount extends BankAccount {
  overDraft: number;
}

export interface SavingBankAccount extends BankAccount {
  interestRate: number;
}

export interface AccountOperation {
  id: number;
  operationDate: Date;
  amount: number;
  type: string;
  description: string;
}

export interface AccountHistory {
  accountId: string;
  balance: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  accountOperationDTOS: AccountOperation[];
}

export interface TransferRequest {
  accountSource: string;
  accountDestination: string;
  amount: number;
  description: string;
}

export interface DebitRequest {
  accountId: string;
  amount: number;
  description: string;
}

export interface CreditRequest {
  accountId: string;
  amount: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8085/accounts';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getAccount(accountId: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${this.apiUrl}/${accountId}`, { headers: this.getHeaders() });
  }

  getAccountOperations(accountId: string): Observable<AccountOperation[]> {
    return this.http.get<AccountOperation[]>(`${this.apiUrl}/${accountId}/operations`, { headers: this.getHeaders() });
  }

  getAccountHistory(accountId: string, page: number = 0, size: number = 5): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(
      `${this.apiUrl}/${accountId}/pageOperations?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
  }

  debit(debitRequest: DebitRequest): Observable<DebitRequest> {
    return this.http.post<DebitRequest>(`${this.apiUrl}/debit`, debitRequest, { headers: this.getHeaders() });
  }

  credit(creditRequest: CreditRequest): Observable<CreditRequest> {
    return this.http.post<CreditRequest>(`${this.apiUrl}/credit`, creditRequest, { headers: this.getHeaders() });
  }

  transfer(transferRequest: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/transfer`, transferRequest, { headers: this.getHeaders() });
  }
}
