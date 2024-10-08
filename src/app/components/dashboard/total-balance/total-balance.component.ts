import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { TuiIcon } from '@taiga-ui/core';
import { BalanceService, TotalBalanceCurrency } from 'services/balance.service';
import { ChooseBalanceCurrencyComponent, ChooseBalanceDialogResultData } from './choose-balance-currency/choose-balance-currency.component';

@Component({
  selector: 'app-total-balance',
  standalone: true,
  imports: [
    TuiIcon,
    CurrencyPipe
  ],
  templateUrl: './total-balance.component.html',
  styleUrl: './total-balance.component.scss'
})
export class TotalBalanceComponent implements OnInit {
  private balanceService = inject(BalanceService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  balance = signal(0);
  currency = signal<TotalBalanceCurrency>(this.getCurrencyFromStorage() || 'EUR');

  currencyIconLinks: Record<TotalBalanceCurrency, string> = {
    EUR: 'assets/icons/euro.svg',
    GBP: 'assets/icons/gbp.svg'
  };

  ngOnInit(): void {
    this.loadBalance();
  }

  topUp() {
    // TODO implement top up
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
        currentCurrency: this.currency()
      }
    });

    dialogRef.afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(currency => {
        if (currency) {
          this.currency.set(currency.currency);
          this.saveCurrencyToStorage();

          this.balance.set(currency.balance);
        }
      });
  }

  private loadBalance() {
    this.balanceService.getBalance(this.currency())
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: balance => this.balance.set(balance),
        error: err => {
          // TODO handle load balances error
        }
      });
  }

  private saveCurrencyToStorage(): void {
    localStorage.setItem('TOTAL_BALANCE_CURRENCY', this.currency());
  }

  private getCurrencyFromStorage(): TotalBalanceCurrency {
    return localStorage.getItem('TOTAL_BALANCE_CURRENCY') as TotalBalanceCurrency;
  }
}
