import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { WalletCardComponent } from "./wallet-card/wallet-card.component";
import { TuiIcon } from '@taiga-ui/core';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    WalletCardComponent,
    TuiIcon,
    SlicePipe
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsComponent implements OnInit {
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);

  wallets: WritableSignal<WalletDto[]> = signal([]);
  isLoading = signal(false);
  hasError = signal(false);
  step = signal(0);
  maxPages = computed(() => Math.floor(this.wallets().length / 4));
  showNextStepBtn = computed(() => this.sliceEnd() < this.wallets().length);

  sliceStart = computed(() =>{
    if (this.step() === 0) {
      return 0;
    }
    return this.step() * 4 - 1;
  });

  sliceEnd = computed(() => {
    if (this.step() === 0) {
      return 3;
    }

    return this.sliceStart() + 4;
  });

  ngOnInit(): void {
    this.loadWallets();
  }

  seeAll() {
    // TODO see all
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
        next: wallets => this.wallets.set(wallets),
        error: err => {
          // TODO check wallets error and empty
          this.hasError.set(true);
          console.error(err);
        }
      });
  }
}
