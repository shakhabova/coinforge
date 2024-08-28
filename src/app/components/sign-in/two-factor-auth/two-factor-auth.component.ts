import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { VerificationCodeComponent } from '../verification-code/verification-code.component';

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.css'
})
export class TwoFactorAuthComponent {
  private dialog = inject(MatDialog);

  start_2FA() {
    this.dialog.open(VerificationCodeComponent);
  }

}
