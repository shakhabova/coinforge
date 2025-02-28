import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, finalize, from } from 'rxjs';
import { WalletDto, WalletsService } from 'services/wallets.service';
import { WalletCardComponent } from './wallet-card/wallet-card.component';
import { TuiIcon } from '@taiga-ui/core';
import { SlicePipe } from '@angular/common';
import { ConfigService } from 'services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateWalletModalComponent } from 'components/wallets-page/create-wallet-modal/create-wallet-modal.component';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [WalletCardComponent, TuiIcon, SlicePipe],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsComponent implements OnInit {
  private walletsService = inject(WalletsService);
  private destroyRef = inject(DestroyRef);
  private configService = inject(ConfigService);
  private dialog = inject(MatDialog);

  pageSize = computed(() => (this.configService.isMobile() ? 2 : 4));
  wallets: WritableSignal<WalletDto[]> = signal([]);
  isLoading = signal(false);
  hasError = signal(false);
  step = signal(0);
  maxPages = computed(() =>
    Math.floor(this.wallets().length / this.pageSize())
  );
  showNextStepBtn = computed(() => this.sliceEnd() < this.wallets().length);

  sliceStart = computed(() => {
    if (this.step() === 0) {
      return 0;
    }
    return this.step() * this.pageSize() - 1;
  });

  sliceEnd = computed(() => {
    if (this.step() === 0) {
      return this.configService.isMobile() ? 1 : 3;
    }

    return this.sliceStart() + this.pageSize();
  });

  constructor() {
    toObservable(this.configService.isMobile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.step.set(0));
  }

  ngOnInit(): void {
    this.loadWallets();
  }

  createWallet() {
    const dialogRef = this.dialog.open(CreateWalletModalComponent);
    dialogRef
      .afterClosed()
      .pipe(
        filter((toUpdate) => !!toUpdate),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadWallets();
      });
  }

  seeAll() {
    // TODO see all
  }

  private loadWallets() {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.walletsService
      .getWalletsForDashboard()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (wallets) => this.wallets.set(wallets),
        error: (err) => {
          // TODO check wallets error and empty
          this.hasError.set(true);
          console.error(err);
        },
      });
  }
}
