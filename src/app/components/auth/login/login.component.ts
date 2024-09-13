import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { OptCodeComponent } from '../opt-code/opt-code.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private dialog = inject(MatDialog);

  signIn() {
    this.dialog.open(OptCodeComponent);
  }
}
