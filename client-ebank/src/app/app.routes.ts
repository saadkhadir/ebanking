import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Customers } from './customers/customers';
import { Accounts } from './accounts/accounts';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'customers', component: Customers },
  { path: 'accounts', component: Accounts },
  { path: '**', redirectTo: 'dashboard' } // Redirection vers le dashboard pour toutes les routes inconnues
];
