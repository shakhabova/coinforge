import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { tuiDialog, TuiIcon } from '@taiga-ui/core';
import { BalanceService, TotalBalanceCurrency } from 'services/balance.service';
import {
	ChooseBalanceCurrencyComponent,
	ChooseBalanceDialogResultData,
} from './choose-balance-currency/choose-balance-currency.component';
import { CurrentCurrencyService } from 'services/current-currency.service';
import { TopUpComponent } from 'components/top-up/top-up.component';
import { UserService } from 'services/user.service';
import { switchMap } from 'rxjs';

@Component({
	selector: 'app-total-balance',
	imports: [TuiIcon, CurrencyPipe],
	templateUrl: './total-balance.component.html',
	styleUrl: './total-balance.component.scss',
})
export class TotalBalanceComponent implements OnInit {
	private balanceService = inject(BalanceService);
	private currentCurrencyService = inject(CurrentCurrencyService);
	private destroyRef = inject(DestroyRef);
	private dialog = inject(MatDialog);
	private userService = inject(UserService);

	private topUpDialog = tuiDialog(TopUpComponent, { size: 'auto' });

	balance = signal(0);
	currency = this.currentCurrencyService.currentCurrency;

	currencyIconLinks: Record<TotalBalanceCurrency, string> = {
		EUR: 'assets/icons/euro.svg',
		GBP: 'assets/icons/gbp.svg',
	};

	ngOnInit(): void {
		this.loadBalance();
	}

	topUp() {
		this.topUpDialog().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
	}

	withdraw() {
		// TODO implement withdraw
	}

	chooseCurrency() {
		const dialogRef = this.dialog.open<
			ChooseBalanceCurrencyComponent,
			unknown,
			ChooseBalanceDialogResultData
		>(ChooseBalanceCurrencyComponent, {
			data: {
				currentCurrency: this.currency(),
			},
		});

		dialogRef
			.afterClosed()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((currency) => {
				if (currency) {
					this.currency.set(currency.currency);
					this.currentCurrencyService.setCurrentCurrency(currency.currency);

					this.balance.set(currency.balance);
				}
			});
	}

	private loadBalance() {
		this.balanceService
			.getBalance(this.currency())
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (balance) => this.balance.set(balance),
				error: (err) => {
					// TODO handle load balances error
				},
			});
	}

	private getCurrencyFromStorage(): TotalBalanceCurrency {
		return localStorage.getItem(
			'TOTAL_BALANCE_CURRENCY',
		) as TotalBalanceCurrency;
	}
}
