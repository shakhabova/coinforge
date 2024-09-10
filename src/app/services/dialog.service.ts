import { inject, Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';

@Injectable({providedIn: 'root'})
export class DialogService {
  private readonly dialogs = inject(TuiDialogService);
  
  showMessage(message: string, title: string, buttonText = 'Ok'): void {
    this.dialogs.open(message, {
      label: title,
      size: 's',
      data: {button: buttonText}
    });
  }
}