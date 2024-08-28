import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-verification-code',
  standalone: true,
  imports: [],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.css',
})
export class VerificationCodeComponent {
  private dialogRef = inject(MatDialogRef);
  onClose() {
    this.dialogRef.close();
  }
}
