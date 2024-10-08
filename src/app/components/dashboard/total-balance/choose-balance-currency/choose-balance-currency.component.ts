import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ModalCloseButtonComponent } from "../../../shared/modal-close-button/modal-close-button.component";
import { BalanceService, TotalBalanceCurrency } from 'services/balance.service';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';

export interface ChooseBalanceDialogResultData {
  balance: number;
  currency: TotalBalanceCurrency;
}

@Component({
  selector: 'app-choose-balance-currency',
  standalone: true,
  imports: [
    MatDialogModule,
    ModalCloseButtonComponent,
    CurrencyPipe
],
  templateUrl: './choose-balance-currency.component.html',
  styleUrl: './choose-balance-currency.component.css'
})
export class ChooseBalanceCurrencyComponent implements OnInit {
  private dialogRef: MatDialogRef<unknown, ChooseBalanceDialogResultData> = inject(MatDialogRef);
  private data = inject(MAT_DIALOG_DATA);
  private balanceService = inject(BalanceService);
  private destroyRef = inject(DestroyRef);
  
  protected isLoading = signal(false);

  selected = signal<TotalBalanceCurrency>(this.data?.currentCurrency || 'EUR');
  balances = signal<Record<TotalBalanceCurrency, number>>({
    EUR: 0,
    GBP: 0,
  });

  radioIcons: Map<boolean, string> = new Map([
    [true, 'assets/icons/radio-active.svg'],
    [false, 'assets/icons/radio-inactive.svg']
  ]);

  public ngOnInit(): void {
    this.isLoading.set(true);

    forkJoin([
      this.balanceService.getBalance('EUR'),
      this.balanceService.getBalance('GBP'),
    ])
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ([EUR, GBP]) => this.balances.set({ EUR, GBP }),
        error: err => {
          // TODO handle balances error
        }
      });
  }

  choose() {
    this.dialogRef.close({
      balance: this.balances()[this.selected()],
      currency: this.selected(),
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
