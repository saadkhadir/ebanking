import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Liste des Clients</h2>

      <div *ngIf="loading" class="text-center py-4">
        Chargement...
      </div>

      <div *ngIf="error" class="text-red-600 mb-4">
        {{error}}
      </div>

      <div *ngIf="!loading && !error">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="text-left p-4">ID</th>
              <th class="text-left p-4">Nom</th>
              <th class="text-left p-4">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers" class="border-t">
              <td class="p-4">{{customer.id}}</td>
              <td class="p-4">{{customer.name}}</td>
              <td class="p-4">{{customer.email}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.customerService.getCustomers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('Données reçues:', data);
          this.customers = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error = "Erreur de chargement";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }
}
