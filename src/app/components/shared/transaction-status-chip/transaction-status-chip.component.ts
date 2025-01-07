import { Component, computed, input } from '@angular/core';
import { TransactionDto } from 'services/transactions.service';

const STATUSES_MAP: Record<TransactionDto['oprStatus'], string> = {
  CONFIRMED: 'Confirmed',
  REFUNDED: 'Refunded',
  REJECTED: 'Rejected',
};

@Component({
  selector: 'app-transaction-status-chip',
  standalone: true,
  imports: [],
  templateUrl: './transaction-status-chip.component.html',
  styleUrl: './transaction-status-chip.component.css'
})
export class TransactionStatusChipComponent {
  status = input.required<TransactionDto['oprStatus']>();

  statusLabel = computed(() => STATUSES_MAP[this.status()]);
}