import { Component, input } from '@angular/core';
import { WalletStatus } from 'services/wallets.service';

@Component({
  selector: 'app-wallet-status-chip',
  standalone: true,
  imports: [],
  templateUrl: './wallet-status-chip.component.html',
  styleUrl: './wallet-status-chip.component.css'
})
export class WalletStatusChipComponent {
  status = input.required<WalletStatus>();

  statusLabels: Record<WalletStatus, string> = {
    ACTIVE: 'Active',
    CUSTOMER_BLOCKED: 'Blocked',
    DEACTIVATED: 'Deactivated',
  };
}
