import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  type OnInit,
  effect,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiPure } from '@taiga-ui/cdk';
import { TuiDataList, TuiDropdown, TuiIcon, tuiDialog } from '@taiga-ui/core';
import { TuiFilterByInputPipe } from '@taiga-ui/kit';
import {
  TuiComboBoxModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { PaginatorModule, type PaginatorState } from 'primeng/paginator';
import {
  BehaviorSubject,
  type Observable,
  filter,
  finalize,
  map,
  mergeMap,
  scan,
  throttleTime,
} from 'rxjs';
import { ConfigService } from 'services/config.service';
import {
  CurrenciesService,
  type CurrencyDto,
} from 'services/currencies.service';
import {
  type GetWalletsParams,
  type WalletDto,
  WalletsService,
} from 'services/wallets.service';
import { WalletStatusChipComponent } from '../shared/wallet-status-chip/wallet-status-chip.component';
import { CreateWalletModalComponent } from './create-wallet-modal/create-wallet-modal.component';
import { WalletInfoCardComponent } from './wallet-info-card/wallet-info-card.component';
import { WalletItemOptionComponent } from './wallet-item-option/wallet-item-option.component';

@Component({
  selector: 'app-wallets-page',
  imports: [
    TuiComboBoxModule,
    TuiSelectModule,
    TuiIcon,
    FormsModule,
    TuiTable,
    TuiTextfieldControllerModule,
    TuiDropdown,
    TuiDataList,
    WalletStatusChipComponent,
    AsyncPipe,
    WalletItemOptionComponent,
    PaginatorModule,
    TuiFilterByInputPipe,
    RouterModule,
    DecimalPipe,
    WalletInfoCardComponent,
    ScrollingModule,
  ],
  templateUrl: './wallets-page.component.html',
  styleUrl: './wallets-page.component.css',
})
export class WalletsPageComponent implements OnInit {
  private cryptocurrenciesService = inject(CurrenciesService);
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);
  private createWalletDialog = tuiDialog(CreateWalletModalComponent);
  public configService = inject(ConfigService);
  private router = inject(Router);

  public viewport = viewChild(CdkVirtualScrollViewport);

  protected cryptocurrencies = signal<CurrencyDto[]>([]);
  protected selectedCurrency = model<CurrencyDto | null>(null);
  protected isLoading = signal(false);
  protected page = signal(0);
  protected pageSize = 10;
  protected totalElements = signal(0);

  protected wallets = signal<WalletDto[]>([]);
  protected columns = [
    'trxAddress',
    'availableOprBalance',
    'walletStatus',
    'actions',
  ];
  protected open = false;

  private loadBatch = new BehaviorSubject<void>(void 0);
  public mobileWallets: Observable<WalletDto[] | undefined>;

  constructor() {
    effect(
      () => {
        this.loadWallets(this.selectedCurrency()?.cryptoCurrency);
      },
      { allowSignalWrites: true },
    );

    this.mobileWallets = this.loadBatch.pipe(
      throttleTime(500),
      mergeMap(() => this.getWallets()),
      scan((acc, batch) => {
        if (!acc || !batch) {
          return [];
        }
        return [...acc, ...batch];
      }),
    );
  }

  ngOnInit() {
    // this.loadWallets();
    this.loadCurrencies();
  }

  navigateDetails(wallet: WalletDto): void {
    this.router.navigateByUrl(`/wallets/${wallet.trxAddress}`);
  }

  nextBatch() {
    const end = this.viewport()?.getRenderedRange().end;
    const total = this.viewport()?.getDataLength();
    if (end === total) {
      if ((this.page() + 1) * this.pageSize >= this.totalElements()) {
        return;
      }
      this.page.update((n) => {
        return n + 1;
      });
      this.loadBatch.next();
    }
  }

  createWallet() {
    this.createWalletDialog()
      .pipe(
        filter((toUpdate) => !!toUpdate),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.loadWallets();
      });
  }

  trackById(i: number): number {
    return i;
  }

  @tuiPure
  getCryptoIcon(crypto: string): Observable<string> {
    return this.cryptocurrenciesService.getCurrencyLinkUrl(crypto);
  }

  async copy(address: string) {
    await navigator.clipboard.writeText(address);
    // TODO display copy success message
  }

  onPageChange(state: PaginatorState) {
    if (state.page != null) {
      this.page.set(state.page);
      this.loadWallets();
    }
  }

  onBlock(wallet: WalletDto): void {
    // TODO use actual code
    wallet.walletStatus = 'CUSTOMER_BLOCKED';
    // this.walletsService.blockWallet(wallet);
  }

  onUnblock(wallet: WalletDto): void {
    wallet.walletStatus = 'ACTIVE';
    // this.walletsService.unblockWallet(wallet);
  }

  onDeactivate(wallet: WalletDto): void {
    wallet.walletStatus = 'DEACTIVATED';
    // this.walletsService.deactivateWallet(wallet);
  }

  stringifyCryptoSelectItem(item: CurrencyDto): string {
    return item.cryptoCurrencyName;
  }

  currencyMatcher(item: CurrencyDto, search: string): boolean {
    return (
      item.cryptoCurrency.toLowerCase().includes(search.toLowerCase()) ||
      item.cryptoCurrencyName.toLowerCase().includes(search.toLowerCase())
    );
  }

  private loadWallets(selectedCurrency?: string) {
    this.isLoading.set(true);
    const params: GetWalletsParams = {
      statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
      page: this.page(),
      size: this.pageSize,
      sort: 'id,desc',
    };
    if (selectedCurrency) {
      params.cryptocurrency = selectedCurrency;
    }

    this.walletsService
      .getWallets(params)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (walletsResponse) => {
          this.wallets.set(walletsResponse.data);
          this.totalElements.set(walletsResponse.totalElements);
        },
        error: (err) => {
          console.error(err);
          // TODO handle wallets table error
        },
      });
  }

  private getWallets(): Observable<WalletDto[]> {
    const params: GetWalletsParams = {
      statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
      page: this.page(),
      size: this.pageSize,
      sort: 'id,desc',
    };
    const crypto = this.selectedCurrency()?.cryptoCurrency;
    if (crypto) {
      params.cryptocurrency = crypto;
    }
    return this.walletsService.getWallets(params).pipe(
      map((res) => {
        this.totalElements.set(res.totalElements);
        return res.data;
      }),
    );
  }

  private loadCurrencies() {
    this.cryptocurrenciesService.getCurrenciesRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currencies) => this.cryptocurrencies.set(currencies));
  }
}
