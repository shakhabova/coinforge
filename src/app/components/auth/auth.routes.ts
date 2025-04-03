import type { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AskForMfaComponent } from './login/ask-for-mfa/ask-for-mfa.component';
import { ForcePasswordChangeComponent } from './login/force-password-change/force-password-change.component';
import { MfaConnectComponent } from './login/mfa-connect/mfa-connect.component';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';

export const routes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'two-factor-auth', component: AskForMfaComponent },
  { path: 'mfa-connect', component: MfaConnectComponent },
  { path: 'force-change-password', component: ForcePasswordChangeComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
