import { Component, input, output } from '@angular/core';
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
  block = output();
  unblock = output();
  deactivate = output();

  protected open = false;
  
  deactivateWallet() {
    this.deactivate.emit();
  }

  unblockWallet() {
    this.unblock.emit();
  }

  blockWallet() {
    this.block.emit();
  }
}
