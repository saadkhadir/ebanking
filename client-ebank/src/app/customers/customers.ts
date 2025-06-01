import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CustomerService, Customer } from '../services/customer.service';
import { finalize } from 'rxjs/operators';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css']
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  loading = true;
  error: string | null = null;
  editingCustomer: Customer | null = null;
  searchKeyword: string = '';
  editForm: FormGroup;
  createForm: FormGroup;
  showCreateForm: boolean = false;
  updateSuccess = false;
  createSuccess = false;
  deleteSuccess = false;
  viewingCustomer: Customer | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.createForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getCustomers()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          console.log('Données reçues:', data);
          this.customers = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.error = "Erreur de chargement des clients";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  searchCustomers() {
    if (!this.searchKeyword.trim()) {
      this.loadCustomers();
      return;
    }

    this.loading = true;
    this.customerService.searchCustomers(this.searchKeyword)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.customers = data;
        },
        error: (err) => {
          console.error('Erreur de recherche:', err);
          this.error = "Erreur lors de la recherche de clients";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  startEdit(customer: Customer) {
    this.editingCustomer = customer;
    this.editForm.patchValue({
      name: customer.name,
      email: customer.email
    });
  }

  cancelEdit() {
    this.editingCustomer = null;
    this.editForm.reset();
  }

  updateCustomer() {
    if (this.editForm.invalid || !this.editingCustomer) {
      return;
    }

    const updatedData = this.editForm.value;

    this.customerService.updateCustomer(this.editingCustomer.id, updatedData)
      .subscribe({
        next: (updatedCustomer) => {
          // Mettre à jour le client dans la liste
          const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
          if (index !== -1) {
            this.customers[index] = updatedCustomer;
          }

          this.editingCustomer = null;
          this.editForm.reset();
          this.updateSuccess = true;

          // Cacher le message de succès après 3 secondes
          setTimeout(() => {
            this.updateSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.error = "Erreur lors de la mise à jour du client";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createForm.reset();
    }
  }

  createCustomer() {
    if (this.createForm.invalid) {
      return;
    }

    const newCustomerData = this.createForm.value;

    this.customerService.saveCustomer(newCustomerData)
      .subscribe({
        next: (newCustomer) => {
          this.customers.push(newCustomer);
          this.createForm.reset();
          this.showCreateForm = false;
          this.createSuccess = true;

          // Cacher le message de succès après 3 secondes
          setTimeout(() => {
            this.createSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.error = "Erreur lors de la création du client";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  confirmDelete(customer: Customer) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${customer.name} ?`)) {
      this.deleteCustomer(customer);
    }
  }

  deleteCustomer(customer: Customer) {
    this.customerService.deleteCustomer(customer.id)
      .subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== customer.id);
          this.deleteSuccess = true;

          // Cacher le message de succès après 3 secondes
          setTimeout(() => {
            this.deleteSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.error = "Erreur lors de la suppression du client";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  viewCustomerDetails(customerId: number) {
    this.customerService.getCustomer(customerId)
      .subscribe({
        next: (customer) => {
          this.viewingCustomer = customer;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des détails:', err);
          this.error = "Erreur lors de la récupération des détails du client";
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  closeDetails() {
    this.viewingCustomer = null;
  }

  clearSearch() {
    this.searchKeyword = '';
    this.loadCustomers();
  }
}
