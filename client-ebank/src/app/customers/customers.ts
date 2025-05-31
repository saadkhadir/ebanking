import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import {Customer} from '../model/customer.model';
import {CustomerService} from '../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  loading: boolean = true;
  error: string | null = null;
  showDeleteModal = false;
  customerToDelete: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    public router: Router){}

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    })
  }

}
