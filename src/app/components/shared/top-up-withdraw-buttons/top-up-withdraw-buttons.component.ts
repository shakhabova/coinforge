import { Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-top-up-withdraw-buttons',
  standalone: true,
  imports: [
    TuiIcon
  ],
  templateUrl: './top-up-withdraw-buttons.component.html',
  styleUrl: './top-up-withdraw-buttons.component.css',
  host: {
    '[class.full-width]': 'fullWidth()'
  }
})
export class TopUpWithdrawButtonsComponent {
  fullWidth = input<boolean>(false);

  topUp() {
    // TODO implement top up
  }

  withdraw() {
    // TODO implement withdraw
  }
}
