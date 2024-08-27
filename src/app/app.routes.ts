import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { LoginComponent } from './components/sign-in/login/login.component';
import { SignUpComponent } from './components/sign-in/login/sign-up/sign-up.component';
import { TwoFactorAuthComponent } from './components/sign-in/two-factor-auth/two-factor-auth.component';

export const routes: Routes = [
  { 
    path: 'sign-in', 
    component: SignInComponent, 
    title: 'Sign in', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'sign-up', component: SignUpComponent},
      { path: 'two-factor-auth', component:TwoFactorAuthComponent}
    ]
  },
  {
    path: '**',
    redirectTo: '/sign-in/login'
  }
];
