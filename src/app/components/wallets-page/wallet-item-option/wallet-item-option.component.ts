import { Component, input } from '@angular/core';
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon } from '@taiga-ui/core';
import { WalletDto, WalletStatus } from 'services/wallets.service';

@Component({
  selector: 'app-wallet-item-option',
  standalone: true,
  imports: [
    TuiDropdown,
    TuiDataList,
    TuiIcon,
    TuiButton,

  ],
  templateUrl: './wallet-item-option.component.html',
  styleUrl: './wallet-item-option.component.css'
})
export class WalletItemOptionComponent {
  wallet = input.required<WalletDto>();

  protected open = false;
  
  deactivateWallet() {
    throw new Error('Method not implemented.');
  }

  unblockWallet() {
    throw new Error('Method not implemented.');
  }

  blockWallet() {
    throw new Error('Method not implemented.');
  }
}
