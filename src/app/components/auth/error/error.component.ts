import { Component } from '@angular/core';
import {
	MatDialog,
	MatDialogModule,
	MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-error',
	standalone: true,
	imports: [MatDialogModule, MatIconModule],
	templateUrl: './error.component.html',
	styleUrl: './error.component.css',
})
export class ErrorComponent {
	constructor(public dialogRef: MatDialogRef<ErrorComponent>) {}

	onClose(): void {
		this.dialogRef.close();
	}
}
