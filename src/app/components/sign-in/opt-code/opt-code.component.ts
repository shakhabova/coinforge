import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-opt-code',
  standalone: true,
  imports: [],
  templateUrl: './opt-code.component.html',
  styleUrl: './opt-code.component.css'
})
export class OptCodeComponent {
  private dialogRef = inject(MatDialogRef);

  onClose() {
    this.dialogRef.close();
  }
}
