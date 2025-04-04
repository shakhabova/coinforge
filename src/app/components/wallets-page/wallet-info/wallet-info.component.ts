import QRCode from 'qrcode';
import { AsyncPipe, DecimalPipe, Location } from '@angular/common';
import {
	Component,
	DestroyRef,
	effect,
	inject,
	Injector,
	input,
	type OnInit,
	runInInjectionContext,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tuiDialog, TuiIcon } from '@taiga-ui/core';
import { finalize, of, type Observable } from 'rxjs';
import { type WalletDto, WalletsService } from 'services/wallets.service';
import { CurrenciesService } from 'services/currencies.service';
import { tuiPure } from '@taiga-ui/cdk';
import { WalletStatusChipComponent } from '../../shared/wallet-status-chip/wallet-status-chip.component';
import { WalletItemOptionComponent } from '../wallet-item-option/wallet-item-option.component';
import { TransactionsComponent } from '../../dashboard/transactions/transactions.component';
import { TransactionsPageComponent } from '../../transactions-page/transactions-page.component';
import { ConfigService } from 'services/config.service';
import { CopyIconComponent } from 'components/shared/copy-icon/copy-icon.component';
import { TopUpComponent } from 'components/top-up/top-up.component';
import { WithdrawComponent } from 'components/withdraw/withdraw.component';

@Component({
	selector: 'app-wallet-info',
	imports: [
		TuiIcon,
		AsyncPipe,
		DecimalPipe,
		WalletStatusChipComponent,
		WalletItemOptionComponent,
		TransactionsComponent,
		TransactionsPageComponent,
		CopyIconComponent,
	],
	templateUrl: './wallet-info.component.html',
	styleUrl: './wallet-info.component.css',
})
export class WalletInfoComponent implements OnInit {
	public address = input<string>();

	private walletService = inject(WalletsService);
	private destroyRef = inject(DestroyRef);
	private injector = inject(Injector);
	private location = inject(Location);
	private cryptoService = inject(CurrenciesService);
	public configService = inject(ConfigService);

	private topUpDialog = tuiDialog(TopUpComponent, { size: 'auto' });
	private withdrawDialog = tuiDialog(WithdrawComponent, { size: 'auto' });

	protected isLoading = signal(false);
	protected error = signal<unknown | null>(null);

	protected walletInfo = signal<WalletDto | null>(null);
	protected addressDataUrl = signal<string | null>(null);

	ngOnInit() {
		runInInjectionContext(this.injector, () => {
			effect(
				() => {
					const address = this.address();
					if (address) {
						this.generateQR();

						this.error.set(null);
						this.isLoading.set(true);
						this.walletService
							.getWalletInfo(address)
							.pipe(
								finalize(() => this.isLoading.set(false)),
								takeUntilDestroyed(this.destroyRef),
							)
							.subscribe({
								next: (walletInfo) => {
									this.walletInfo.set(walletInfo);
								},
								error: (err) => {
									// TODO handle wallet info error
									this.error.set(err);
								},
							});
					}
				},
				{ allowSignalWrites: true },
			);
		});
	}

	back() {
		this.location.back();
	}

	@tuiPure
	getCryptoIconUrl(): Observable<string> {
		const info = this.walletInfo();
		if (!info) {
			return of('');
		}

		return this.cryptoService.getCurrencyLinkUrl(info.cryptocurrency);
	}

	@tuiPure
	getCryptoName(): Observable<string> {
		const info = this.walletInfo();
		if (!info) {
			return of('');
		}

		return this.cryptoService.getCurrencyName(info.cryptocurrency);
	}

	onBlock(): void {
		// TODO use actual code
		this.walletInfo.update((wallet) => {
			if (wallet) {
				return { ...wallet, walletStatus: 'CUSTOMER_BLOCKED' };
			}

			return null;
		});

		// this.walletsService.blockWallet(wallet);
	}

	onUnblock(): void {
		this.walletInfo.update((wallet) => {
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
		const info = this.walletInfo();
		if (!info) {
			return;
		}

		this.topUpDialog(info)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe();
	}

	withdraw() {
		const info = this.walletInfo();
		if (!info) {
			return;
		}

		this.withdrawDialog(info)
			.pipe(
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe();
	}

	private async generateQR() {
		const address = this.address();
		if (address) {
			this.addressDataUrl.set(await QRCode.toDataURL(address, { margin: 0, width: 84 }));
		}
	}
}
