import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { tuiPure } from '@taiga-ui/cdk';
import { TuiIcon } from '@taiga-ui/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { WalletsService } from 'services/wallets.service';

@Component({
  selector: 'app-create-wallet-modal',
  standalone: true,
  imports: [TuiIcon, AsyncPipe],
  templateUrl: './create-wallet-modal.component.html',
  styleUrl: './create-wallet-modal.component.css',
})
export class CreateWalletModalComponent {
  private dialogRef = inject(MatDialogRef);
  private currenciesService = inject(CurrenciesService);
  private walletService = inject(WalletsService);

  selected = signal('');

  radioIcons: Map<boolean, string> = new Map([
    [true, 'assets/icons/radio-active.svg'],
    [false, 'assets/icons/radio-inactive.svg']
  ]);

  cryptos$ = this.walletService
    .getEligibleCryptos()
    .pipe(
      switchMap((eligibles) =>
        forkJoin(
          eligibles.map((eligibleCrypto) =>
            this.currenciesService.getCurrenciesRequest.pipe(
              map((cryptoInfos) =>
                cryptoInfos.find(
                  (info) =>
                    info.cryptoCurrency === eligibleCrypto.cryptocurrency
                )
              )
            )
          )
        )
      ),
      map(cryptos => cryptos.filter(crypto => !!crypto)),
    );

  selectCrypto(crypto?: CurrencyDto): void {
    if (!crypto) return;

    this.selected.set(crypto.cryptoCurrency);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  @tuiPure
  getCryptoIcon(crypto?: string): Observable<string> {
    if (!crypto) return of('');

    return this.currenciesService.getCurrencyLinkUrl(crypto);
  }

  confirm() {
    if (!this.selected()) {
      return;
    }

    this.dialogRef.close(this.selected());
  }
}
