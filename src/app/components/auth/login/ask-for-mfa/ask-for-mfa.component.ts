import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-ask-for-mfa',
  standalone: true,
  imports: [
    MatDialogModule,
    TuiIcon
  ],
  templateUrl: './ask-for-mfa.component.html',
  styleUrl: './ask-for-mfa.component.css'
})
export class AskForMfaComponent {
  private dialogRef: MatDialogRef<void, boolean> = inject(MatDialogRef);

  enable() {
    this.dialogRef.close(true);
  }

  discard() {
    this.dialogRef.close(false);
  }

  closeModal() {
    this.dialogRef.close(false);
  }
}
