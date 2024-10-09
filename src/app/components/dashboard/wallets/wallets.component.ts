import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { WalletCardComponent } from "./wallet-card/wallet-card.component";

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [WalletCardComponent],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.css'
})
export class WalletsComponent implements OnInit {
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);

  wallets: WalletDto[] = [];
  isLoading = signal(false);
  hasError = signal(false);

  ngOnInit(): void {
    this.loadWallets();
  }

  private loadWallets() {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.walletsService.getWalletsForDashboard()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: wallets => this.wallets = wallets,
        error: err => {
          this.hasError.set(true);
          console.error(err);
        }
      });
  }
}
