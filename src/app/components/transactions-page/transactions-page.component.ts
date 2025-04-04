import { Component, DestroyRef, inject, Injector, input, model, signal, viewChild } from '@angular/core';
import { TopUpWithdrawButtonsComponent } from '../shared/top-up-withdraw-buttons/top-up-withdraw-buttons.component';
import { TuiButton, TuiDialog, TuiDialogOptions, TuiDialogService, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionStatusChipComponent } from '../shared/transaction-status-chip/transaction-status-chip.component';
import { TransactionTypeIconComponent } from '../shared/transaction-type-icon/transaction-type-icon.component';
import {
	type TransactionDto,
	type TransactionPageableParams,
	TransactionsService,
} from 'services/transactions.service';
import { PaginatorModule, type PaginatorState } from 'primeng/paginator';
import { CopyIconComponent } from '../shared/copy-icon/copy-icon.component';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TuiDay, tuiPure } from '@taiga-ui/cdk';
import {
	BehaviorSubject,
	debounce,
	debounceTime,
	filter,
	finalize,
	from,
	map,
	mergeMap,
	type Observable,
	of,
	scan,
	tap,
	throttleTime,
} from 'rxjs';
import { CurrenciesService } from 'services/currencies.service';
import { PageableParams, type PageableResponse } from 'models/pageable.model';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import {
	type TransactionFilterModel,
	TransactionsFilterModalComponent,
} from './transactions-filter-modal/transactions-filter-modal.component';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { format } from 'date-fns';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { ConfigService } from 'services/config.service';
import { TransactionItemComponent } from '../dashboard/transactions/transaction-item/transaction-item.component';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';

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
		TransactionItemComponent,
		ScrollingModule,
	],
	templateUrl: './transactions-page.component.html',
	styleUrl: './transactions-page.component.css',
})
export class TransactionsPageComponent {
	private cryptocurrenciesService = inject(CurrenciesService);
	private transactionService = inject(TransactionsService);
	private destroyRef = inject(DestroyRef);
	private dialogService = inject(TuiDialogService);
	private injector = inject(Injector);
	public configService = inject(ConfigService);

	trxWalletAddress = input<string>();

	public viewport = viewChild(CdkVirtualScrollViewport);

	protected isLoading = signal(false);
	protected page = signal(0);
	protected pageSize = 10;
	private filters?: TransactionFilterModel;

	private loadBatch = new BehaviorSubject<boolean | void>(void 0);
	public mobileTransactions: Observable<TransactionDto[] | undefined>;

	protected columns = ['createdAt', 'transactionHash', 'address', 'amount', 'status', 'type'];
	protected transactions = signal<TransactionDto[]>([]);
	protected search = new FormControl<string | null>(null, [
		Validators.minLength(64),
		Validators.pattern(/^[a-fA-F0-9x]+$/),
	]);
	protected totalElements = signal(0);

	constructor() {
		this.search.valueChanges
			.pipe(
				filter((val) => this.search.valid),
				debounceTime(300),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe(() => {
				this.loadTransactions();
				this.loadBatch.next(true);
			});

		this.mobileTransactions = this.loadBatch.pipe(
			mergeMap((toClear) => {
				return of(toClear).pipe(
					throttleTime(500),
					mergeMap(() => this.getTransactions()),
					map((data) => data.data),
					tap(console.log),
					scan((acc, batch) => {
						if (!acc || !batch) {
							return [];
						}

						if (toClear) {
							return batch;
						}

						return [...acc, ...batch];
					}),
				);
			}),
		);
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
			return this.cryptocurrenciesService.getCurrencyLinkUrl(transaction.currencyTo);
		}

		return this.cryptocurrenciesService.getCurrencyLinkUrl(transaction.currencyFrom);
	}

	nextBatch() {
		const end = this.viewport()?.getRenderedRange().end;
		const total = this.viewport()?.getDataLength();
		if (end === total) {
			if ((this.page() + 1) * this.pageSize >= this.totalElements()) {
				return;
			}
			this.page.update((n) => (n += 1));
			this.loadBatch.next();
		}
	}

	trackById(i: number): number {
		return i;
	}

	hasFilters(): boolean {
		return !!this.filters && Object.keys(this.filters).length > 0;
	}
	onPageChange(state: PaginatorState): void {
		if (state.page) {
			this.page.set(state.page);
			this.loadTransactions();
		}
	}

	openFilters() {
		this.dialogService
			.open<TransactionFilterModel>(new PolymorpheusComponent(TransactionsFilterModalComponent, this.injector), {
				data: this.filters,
			})
			.pipe(filter((val) => !!val))
			.subscribe((filters) => {
				this.filters = filters;
				this.page.set(0);
				this.loadTransactions();
				this.loadBatch.next(true);
			});
	}

	openDetails(transaction: TransactionDto) {
		this.dialogService
			.open(new PolymorpheusComponent(TransactionDetailsComponent, this.injector), {
				data: transaction,
			})
			.subscribe();
	}

	private isTransactionIn(type: TransactionDto['type']): boolean {
		return ['IN', 'F2C', 'C2C', 'CSTD_IN'].includes(type);
	}

	private loadTransactions() {
		this.isLoading.set(true);
		this.getTransactions()
			.pipe(
				finalize(() => this.isLoading.set(false)),
				takeUntilDestroyed(this.destroyRef),
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

	private getTransactions(): Observable<PageableResponse<TransactionDto>> {
		const params: TransactionPageableParams = {
			size: this.pageSize,
			sort: 'id,desc',
			page: this.page(),
			transactionHash: this.search.value || undefined,
		};
		if (this.filters?.dateFrom) params.dateFrom = this.formatDate(this.filters.dateFrom.toLocalNativeDate());
		if (this.filters?.dateTo) params.dateTo = this.formatDate(this.filters.dateTo.toLocalNativeDate());
		if (this.filters?.cryptocurrency) params.cryptocurrency = this.filters.cryptocurrency.cryptoCurrency;
		if (this.filters?.statuses) params.statuses = this.filters.statuses;
		if (this.trxWalletAddress()) params.trxWalletAddress = this.trxWalletAddress();

		return this.transactionService.getTransactions(params);
	}

	private formatDate(date: Date): string {
		return format(date, 'yyyy-MM-dd+HH:mm');
	}
}
