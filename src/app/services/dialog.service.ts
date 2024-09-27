import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TuiDialogService } from '@taiga-ui/core';
import { ErrorModalComponent } from 'components/shared/error-modal/error-modal.component';

export interface DialogMessageModel {
  title: string;
  message: string;
  buttonText?: string;
}

@Injectable({providedIn: 'root'})
export class DialogService {
  private readonly dialogs = inject(TuiDialogService);
  private readonly materialDialog = inject(MatDialog)
  
  showMessage(message: string, title: string, buttonText = 'Ok'): void {
    this.dialogs.open(message, {
      label: title,
      size: 's',
      data: {button: buttonText}
    }).subscribe();
  }

  showErrorMessage(message: DialogMessageModel) {
    const buttonText = message.buttonText ?? 'Ok';
    return this.materialDialog.open(ErrorModalComponent);
  }
}