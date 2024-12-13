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
import { TuiSelectModule } from '@taiga-ui/legacy';
import { filter, finalize, Observable, takeUntil } from 'rxjs';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { CreateWalletModalComponent } from './create-wallet-modal/create-wallet-modal.component';
import { TuiTable } from '@taiga-ui/addon-table';
import { AsyncPipe } from '@angular/common';
import { WalletStatusChipComponent } from "../shared/wallet-status-chip/wallet-status-chip.component";
import { tuiPure } from '@taiga-ui/cdk';

@Component({
  selector: 'app-wallets-page.component.ts',
  standalone: true,
  imports: [
    TuiSelectModule,
    TuiIcon,
    FormsModule,
    TuiTable,
    TuiButton,
    TuiDropdown,
    TuiDataList,
    WalletStatusChipComponent,
    AsyncPipe,
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
  private totalElements = signal(0);

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

  copy(address: string): void {
    navigator.clipboard.writeText(address);
    // TODO display copy success message
  }

  deactivateWallet(wallet: WalletDto) {
    throw new Error('Method not implemented.');
  }
  unblockWallet(wallet: WalletDto) {
    throw new Error('Method not implemented.');
  }
  blockWallet(wallet: WalletDto) {
    throw new Error('Method not implemented.');
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
