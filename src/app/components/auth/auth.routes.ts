import { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { AskForMfaComponent } from "./login/ask-for-mfa/ask-for-mfa.component";

export const routes: Route[] = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent},
  { path: 'two-factor-auth', component: AskForMfaComponent},
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];