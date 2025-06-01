import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Customers } from './customers/customers';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'customers', component: Customers }
];
