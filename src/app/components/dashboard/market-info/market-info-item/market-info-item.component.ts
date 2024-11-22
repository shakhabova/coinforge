import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrenciesService } from 'services/currencies.service';
import { CurrentCurrencyService } from 'services/current-currency.service';

export interface MarketInfoItemModel {
  shortName: string;
  balance: number;
  invertedBalance: number;
}

@Component({
  selector: 'app-market-info-item',
  standalone: true,
  imports: [
    CurrencyPipe,
    AsyncPipe,
  ],
  templateUrl: './market-info-item.component.html',
  styleUrl: './market-info-item.component.css'
})
export class MarketInfoItemComponent {
  public info = input.required<MarketInfoItemModel>();

  protected shortName = computed(() => this.info().shortName);
  // protected fullName = computed(() => this.info().fullName);
  protected balance = computed(() => this.info().balance);
  protected invertedBalance = computed(() => this.info().invertedBalance);

  private currentCurrencyService = inject(CurrentCurrencyService);
  private cryptoService = inject(CurrenciesService);

  cryptoIcon = computed(() =>  this.cryptoService.getCurrencyLinkUrl(this.shortName()));
  fullName = computed(() => this.cryptoService.getCurrencyName(this.shortName()));
  protected currentCurrency = this.currentCurrencyService.currentCurrency;

  // TODO rework rate
  protected rate = computed(() => `1 ${this.currentCurrency()} = ${this.invertedBalance().toFixed(7)} ${this.shortName()}`);
}
