import { Component, DestroyRef, effect, inject } from '@angular/core';
import { MarketInfoItemComponent, MarketInfoItemModel } from "./market-info-item/market-info-item.component";
import { RatesService } from 'services/rates.service';
import { CurrentCurrencyService } from 'services/current-currency.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const MARKET_INFO_COINS = ['BTC', 'ETH', 'USDC', 'USDT'];

@Component({
  selector: 'app-market-info',
  standalone: true,
  imports: [MarketInfoItemComponent],
  templateUrl: './market-info.component.html',
  styleUrl: './market-info.component.css'
})
export class MarketInfoComponent {
  private ratesService = inject(RatesService);
  private currentCurrencyService = inject(CurrentCurrencyService);
  private destroyRef = inject(DestroyRef);

  protected infos: MarketInfoItemModel[] = [];

  constructor() {
    effect(() => this.loadMarketInfo(this.currentCurrencyService.currentCurrency()));
  }

  private loadMarketInfo(currentCurrency: string) {
    this.ratesService.ratesBulk()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ratesDto => {
          this.infos = [];
          MARKET_INFO_COINS.forEach(coin => {
            this.infos.push({
              shortName: coin,
              balance: ratesDto[coin][currentCurrency].rate,
              invertedBalance: ratesDto[currentCurrency][coin].rate,
            });
          });
        },
        error: err => {
          // TODO handle rates error
        }
      });
  }
}
