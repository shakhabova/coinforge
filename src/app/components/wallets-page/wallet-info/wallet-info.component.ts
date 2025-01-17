import QRCode from 'qrcode'
import { AsyncPipe, DecimalPipe, Location } from '@angular/common';
import { Component, DestroyRef, effect, inject, Injector, input, OnInit, runInInjectionContext, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiIcon } from '@taiga-ui/core';
import { finalize, Observable } from 'rxjs';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { CurrenciesService } from 'services/currencies.service';
import { tuiPure } from '@taiga-ui/cdk';
import { WalletStatusChipComponent } from "../../shared/wallet-status-chip/wallet-status-chip.component";
import { WalletItemOptionComponent } from "../wallet-item-option/wallet-item-option.component";
import { TransactionsComponent } from "../../dashboard/transactions/transactions.component";
import { TransactionsPageComponent } from "../../transactions-page/transactions-page.component";

@Component({
  selector: 'app-wallet-info',
  standalone: true,
  imports: [
    TuiIcon,
    AsyncPipe,
    DecimalPipe,
    WalletStatusChipComponent,
    WalletItemOptionComponent,
    TransactionsComponent,
    TransactionsPageComponent
],
  templateUrl: './wallet-info.component.html',
  styleUrl: './wallet-info.component.css'
})
export class WalletInfoComponent implements OnInit {
  public address = input<string>();

  private walletService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private location = inject(Location);
  private cryptoService = inject(CurrenciesService);

  protected isLoading = signal(false);
  protected error = signal<unknown | null>(null);

  protected walletInfo = signal<WalletDto | null>(null);
  protected addressDataUrl = signal<string | null>(null);

  ngOnInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const address = this.address();
        if (address) {
          this.generateQR();

          this.error.set(null);
          this.isLoading.set(true);
          this.walletService.getWalletInfo(address)
            .pipe(
              finalize(() => this.isLoading.set(false)),
              takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
              next: walletInfo => {
                this.walletInfo.set(walletInfo);
              },
              error: err => {
                // TODO handle wallet info error
                this.error.set(err);
              }
            });
        }
      }, { allowSignalWrites: true });
    });
  }

  back() {
    this.location.back();
  }

  copyAddress() {
    navigator.clipboard.writeText(this.address()!);
  }

  @tuiPure
  getCryptoIconUrl(): Observable<string> {
    return this.cryptoService.getCurrencyLinkUrl(this.walletInfo()!.cryptocurrency);
  }
  
  @tuiPure
  getCryptoName(): Observable<string> {
    return this.cryptoService.getCurrencyName(this.walletInfo()!.cryptocurrency);
  }

  
  onBlock(): void {
    // TODO use actual code
    this.walletInfo.update(wallet => {
      if (wallet) {
        return { ...wallet, walletStatus: 'CUSTOMER_BLOCKED' };
      }

      return null;
    });
    
    // this.walletsService.blockWallet(wallet);
  }

  onUnblock(): void {
    this.walletInfo.update(wallet => {
      if (wallet) {
        return { ...wallet, walletStatus: 'ACTIVE' };
      }

      return null;
    });
    // this.walletsService.unblockWallet(wallet);
  }

  onDeactivate(): void {
    // this.walletsService.deactivateWallet(wallet);
  }

  topUp() {
    // TODO top up
  }

  withdraw() {
    // TODO withdraw
  }

  private async generateQR() {
    const address = this.address();
    if (address) {
      this.addressDataUrl.set(await QRCode.toDataURL(address, { margin: 0, width: 84 }));
    }
  }
}
