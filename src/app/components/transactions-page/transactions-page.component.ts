import { Component, inject, model, signal } from '@angular/core';
import { TopUpWithdrawButtonsComponent } from "../shared/top-up-withdraw-buttons/top-up-withdraw-buttons.component";
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { TransactionStatusChipComponent } from "../shared/transaction-status-chip/transaction-status-chip.component";
import { TransactionTypeIconComponent } from "../shared/transaction-type-icon/transaction-type-icon.component";
import { TransactionDto } from 'services/transactions.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CopyIconComponent } from "../shared/copy-icon/copy-icon.component";
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { tuiPure } from '@taiga-ui/cdk';
import { Observable } from 'rxjs';
import { CurrenciesService } from 'services/currencies.service';

// const TYPE_IN_LABEL = 'IN';
// const TYPE_OUT_LABEL = 'OUT';
// const TYPE_WITHDRAW_LABEL = 'Withdraw';

// const TYPE_LABEL_MAP: Record<TransactionDto['type'], string> = {
//   IN: '@tui.chevron-down',
//   F2C: '@tui.chevron-down',
//   C2C: '@tui.chevron-down',
//   CSTD_IN: '@tui.chevron-down',

//   OUT: '@tui.chevron-up',
//   C2F: '@tui.chevron-up',
//   CSTD_OUT: '@tui.chevron-up',
// };

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    TopUpWithdrawButtonsComponent,
    TuiTextfield,
    FormsModule,
    TuiButton,
    TuiIcon,
    TransactionStatusChipComponent,
    TransactionTypeIconComponent,
    PaginatorModule,
    CopyIconComponent,
    TuiTable,
    DatePipe,
    DecimalPipe,
    AsyncPipe,
],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent {
  private cryptocurrenciesService = inject(CurrenciesService);

  protected columns = ['createdAt', 'transactionHash', 'address', 'amount', 'status', 'type'];
  protected transactions = signal<TransactionDto[]>([]);
  protected search = model<string | null>(null);
  protected totalElements = signal(0);

  @tuiPure
  getAddress(transaction: TransactionDto) {
    if (this.isTransactionIn(transaction.type)) {
      return transaction.toTrxAddress;
    } else {
      return transaction.fromTrxAddress;
    }
  }

  @tuiPure
  getAmountPrefix(transaction: TransactionDto): '+' | '-' {
    if (this.isTransactionIn(transaction.type)) {
      return '+';
    }

    return '-';
  }

  @tuiPure
  getAmount(transaction: TransactionDto): string {
    if (this.isTransactionIn(transaction.type)) {
      return transaction.amount;
    }

    return transaction.amountInSenderCurrency;
  }

  @tuiPure
  getCryptoIcon(transaction: TransactionDto): Observable<string> {
    if (this.isTransactionIn(transaction.type)) {
      return this.cryptocurrenciesService.getCurrencyLinkUrl(transaction.currencyTo);
    }

    return this.cryptocurrenciesService.getCurrencyLinkUrl(transaction.currencyFrom);
  }

  onPageChange(state: PaginatorState): void {
    // TODO make transactions pagination
  }

  private isTransactionIn(type: TransactionDto['type']): boolean {
    return ['IN', 'F2C', 'C2C', 'CSTD_IN'].includes(type);
  }

  // private isTransactionOut(type: TransactionDto['type']): boolean {
  // }
}
