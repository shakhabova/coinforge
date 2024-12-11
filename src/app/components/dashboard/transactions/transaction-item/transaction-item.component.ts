import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TransactionDto } from 'services/transactions.service';

const ICON_TYPE_MAP: Record<TransactionDto['type'], string> = {
  IN: '@tui.chevron-down',
  F2C: '@tui.chevron-down',
  C2C: '@tui.chevron-down',

  OUT: '@tui.chevron-up',
  C2F: '@tui.chevron-up',
};

const STATUSES_MAP: Record<TransactionDto['oprStatus'], string> = {
  CONFIRMED: 'Confirmed',
  REFUNDED: 'Refunded',
  REJECTED: 'Rejected',
};

@Component({
  selector: 'app-transaction-item',
  standalone: true,
  imports: [
    TuiIcon,
    DatePipe,
  ],
  templateUrl: './transaction-item.component.html',
  styleUrl: './transaction-item.component.css'
})
export class TransactionItemComponent {
  transaction = input.required<TransactionDto>();

  typeIcon = computed(() => ICON_TYPE_MAP[this.transaction().type]);
  oprStatus = computed(() => STATUSES_MAP[this.transaction().oprStatus]);

  isPositiveOpr = computed(() => ['IN', 'F2C', 'C2C'].includes(this.transaction().type));

  private amountSum = computed(() => this.isPositiveOpr() ? this.transaction().amount : this.transaction().amountInSenderCurrency);
  private amountCurr = computed(() => this.isPositiveOpr() ? this.transaction().currencyTo : this.transaction().currencyFrom);
  amount = computed(() => `${this.isPositiveOpr() ? '+' : '-'} ${this.amountSum()} ${this.amountCurr()}`);
}
