import { Component, DestroyRef, inject, model, signal } from '@angular/core';
import { TopUpWithdrawButtonsComponent } from '../shared/top-up-withdraw-buttons/top-up-withdraw-buttons.component';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TransactionStatusChipComponent } from '../shared/transaction-status-chip/transaction-status-chip.component';
import { TransactionTypeIconComponent } from '../shared/transaction-type-icon/transaction-type-icon.component';
import {
  TransactionDto,
  TransactionPageableParams,
  TransactionsService,
} from 'services/transactions.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CopyIconComponent } from '../shared/copy-icon/copy-icon.component';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { tuiPure } from '@taiga-ui/cdk';
import {
  debounce,
  debounceTime,
  filter,
  finalize,
  from,
  Observable,
} from 'rxjs';
import { CurrenciesService } from 'services/currencies.service';
import { PageableParams } from 'models/pageable.model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

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
    ReactiveFormsModule,
  ],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css',
})
export class TransactionsPageComponent {
  private cryptocurrenciesService = inject(CurrenciesService);
  private transactionService = inject(TransactionsService);
  private destroyRef = inject(DestroyRef);

  protected isLoading = signal(false);
  protected page = signal(0);

  protected columns = [
    'createdAt',
    'transactionHash',
    'address',
    'amount',
    'status',
    'type',
  ];
  protected transactions = signal<TransactionDto[]>([]);
  protected search = new FormControl<string | null>(null, [
    Validators.minLength(64),
    Validators.pattern(/^[a-fA-F0-9x]+$/),
  ]);
  protected totalElements = signal(0);

  constructor() {
    this.search.valueChanges
      .pipe(
        filter(val => this.search.valid),
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadTransactions());
  }

  ngOnInit() {
    this.loadTransactions();
  }

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
      return this.cryptocurrenciesService.getCurrencyLinkUrl(
        transaction.currencyTo
      );
    }

    return this.cryptocurrenciesService.getCurrencyLinkUrl(
      transaction.currencyFrom
    );
  }

  onPageChange(state: PaginatorState): void {
    if (state.page) {
      this.page.set(state.page);
      this.loadTransactions();
    }
  }

  private isTransactionIn(type: TransactionDto['type']): boolean {
    return ['IN', 'F2C', 'C2C', 'CSTD_IN'].includes(type);
  }

  private loadTransactions() {
    console.log('hehe');
    this.isLoading.set(true);
    const params: TransactionPageableParams = {
      size: 10,
      sort: 'id,desc',
      page: this.page(),
      transactionHash: this.search.value || undefined,
    };

    this.transactionService
      .getTransactions(params)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.transactions.set(res.data);
          this.totalElements.set(res.totalElements);
        },
        error: (err) => {
          // TODO handle error
          console.error(err);
        },
      });
  }
}
