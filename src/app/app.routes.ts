import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'wallets',
        loadChildren: () => import('./components/wallets-page/wallets-page.routes').then(m => m.routes),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transactions-page/transactions-page.component').then(m => m.TransactionsPageComponent),
      },
      {
        path: 'home-page',
        loadComponent: () => import('./components/home-page/home-page.component').then(m => m.HomePageComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/dashboard'
      }
    ]
  },
  { 
    path: 'auth', 
    component: AuthComponent, 
    title: 'Sign in', 
    loadChildren: () => import('./components/auth/auth.routes').then(m => m.routes)
  }
];
