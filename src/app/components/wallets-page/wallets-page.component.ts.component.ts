import {
  Component,
  DestroyRef,
  effect,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiSelect,
} from '@taiga-ui/core';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { filter, finalize, Observable, takeUntil, tap } from 'rxjs';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { GetWalletsParams, WalletDto, WalletsService } from 'services/wallets.service';
import { CreateWalletModalComponent } from './create-wallet-modal/create-wallet-modal.component';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { WalletStatusChipComponent } from "../shared/wallet-status-chip/wallet-status-chip.component";
import { tuiPure } from '@taiga-ui/cdk';
import { WalletItemOptionComponent } from "./wallet-item-option/wallet-item-option.component";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TuiFilterByInputPipe } from '@taiga-ui/kit';
import { RouterModule } from '@angular/router';
import { ConfigService } from 'services/config.service';
import { WalletCardComponent } from "../dashboard/wallets/wallet-card/wallet-card.component";
import { WalletInfoCardComponent } from "./wallet-info-card/wallet-info-card.component";

@Component({
  selector: 'app-wallets-page.component.ts',
  standalone: true,
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
    WalletCardComponent,
    WalletInfoCardComponent
],
  templateUrl: './wallets-page.component.ts.component.html',
  styleUrl: './wallets-page.component.ts.component.css',
})
export class WalletsPageComponentTsComponent implements OnInit {
  private cryptocurrenciesService = inject(CurrenciesService);
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  public configService = inject(ConfigService);

  protected cryptocurrencies = signal<CurrencyDto[]>([]);
  protected selectedCurrency = model<CurrencyDto | null>(null);
  protected isLoading = signal(false);
  protected page = signal(0);
  protected totalElements = signal(0);

  protected wallets = signal<WalletDto[]>([]);
  protected columns = ['trxAddress', 'availableOprBalance', 'walletStatus', 'actions'];
  protected open: boolean = false;

  constructor() {
    effect(() => {
      this.loadWallets(this.selectedCurrency()?.cryptoCurrency);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // this.loadWallets();
    this.loadCurrencies();
  }

  createWallet() {
    const dialogRef = this.dialog.open(CreateWalletModalComponent);
    dialogRef
      .afterClosed()
      .pipe(
        filter((toUpdate) => !!toUpdate),
        tap(console.log),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadWallets()
      });
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
    return item.cryptoCurrency.toLowerCase().includes(search.toLowerCase()) || item.cryptoCurrencyName.toLowerCase().includes(search.toLowerCase());
  }

  private loadWallets(selectedCurrency?: string) {
    this.isLoading.set(true);
    const params: GetWalletsParams = {
      statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
      page: this.page(),
      size: 10,
      sort: 'id,desc',
    };
    if (selectedCurrency) {
      params.cryptocurrency = selectedCurrency;
    }

    this.walletsService
      .getWallets(params)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
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

  private loadCurrencies() {
    this.cryptocurrenciesService.getCurrenciesRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currencies) => this.cryptocurrencies.set(currencies));
  }
}
