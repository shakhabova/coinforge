import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

}
