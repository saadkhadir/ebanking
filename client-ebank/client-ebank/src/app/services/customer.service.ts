import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:8085/customers';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Customer[]>(this.apiUrl, { headers }).pipe(
      tap(data => console.log('Raw API response:', data))
    );
  }
}
