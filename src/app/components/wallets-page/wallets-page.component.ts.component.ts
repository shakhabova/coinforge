import {
  Component,
  DestroyRef,
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
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { filter, finalize, Observable, takeUntil } from 'rxjs';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { CreateWalletModalComponent } from './create-wallet-modal/create-wallet-modal.component';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe } from '@angular/common';
import { WalletStatusChipComponent } from "../shared/wallet-status-chip/wallet-status-chip.component";
import { tuiPure } from '@taiga-ui/cdk';
import { WalletItemOptionComponent } from "./wallet-item-option/wallet-item-option.component";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-wallets-page.component.ts',
  standalone: true,
  imports: [
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
],
  templateUrl: './wallets-page.component.ts.component.html',
  styleUrl: './wallets-page.component.ts.component.css',
})
export class WalletsPageComponentTsComponent implements OnInit {
  private cryptocurrenciesService = inject(CurrenciesService);
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  protected cryptocurrencies = signal<CurrencyDto[]>([]);
  protected selectedCurrency = model<CurrencyDto | null>(null);
  protected isLoading = signal(false);
  protected page = signal(0);
  protected totalElements = signal(0);

  protected wallets = signal<WalletDto[]>([]);
  protected columns = ['trxAddress', 'availableOprBalance', 'walletStatus', 'actions'];
  protected open: boolean = false;

  ngOnInit() {
    this.loadWallets();
    this.loadCurrencies();
  }

  createWallet() {
    const dialogRef = this.dialog.open(CreateWalletModalComponent);
    dialogRef
      .afterClosed()
      .pipe(
        filter((toUpdate) => !!toUpdate),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadWallets());
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

  private loadWallets() {
    this.isLoading.set(true);
    this.walletsService
      .getWallets({
        statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
        page: this.page(),
        size: 10,
        sort: 'id,desc',
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (walletsResponse) => {
          this.wallets.set(walletsResponse.data);
          this.totalElements.set(walletsResponse.totalElements);
          console.log(walletsResponse);
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
