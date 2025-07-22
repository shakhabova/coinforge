import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { TransactionDto } from 'services/transactions.service';
import { TransactionStatusChipComponent } from '../../../shared/transaction-status-chip/transaction-status-chip.component';
import { TransactionTypeIconComponent } from '../../../shared/transaction-type-icon/transaction-type-icon.component';
import { TYPES_MAP } from 'components/transactions-page/transactions-page.component';

@Component({
	selector: 'app-transaction-item',
	imports: [DatePipe, TransactionStatusChipComponent, TransactionTypeIconComponent],
	templateUrl: './transaction-item.component.html',
	styleUrl: './transaction-item.component.css',
})
export class TransactionItemComponent {
	transaction = input.required<TransactionDto>();
  typeLabel = computed(() => TYPES_MAP[this.transaction().type] || this.transaction().type);
	isPositiveOpr = computed(() => ['IN', 'CST_F2C', 'CST_C2C', 'CSTD_IN'].includes(this.transaction().type));

	private amountSum = computed(() =>
		this.isPositiveOpr() ? this.transaction().amount : this.transaction().amountInSenderCurrency,
	);
	private amountCurr = computed(() =>
		this.isPositiveOpr() ? this.transaction().currencyTo : this.transaction().currencyFrom,
	);
	amount = computed(() => `${this.isPositiveOpr() ? '+' : '-'} ${this.amountSum()} ${this.amountCurr()}`);
}

