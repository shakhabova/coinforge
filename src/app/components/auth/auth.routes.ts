import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { TwoFactorAuthComponent } from "./two-factor-auth/two-factor-auth.component";

export const routes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent},
  { path: 'two-factor-auth', component:TwoFactorAuthComponent},
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];