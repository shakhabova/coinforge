import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { LoginComponent } from './components/sign-in/login/login.component';

export const routes: Routes = [
  { 
    path: 'sign-in', 
    component: SignInComponent, 
    title: 'Sign in', 
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },
  {
    path: '**',
    redirectTo: '/sign-in/login'
  }
];
