import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	INJECTOR,
	type WritableSignal,
	afterNextRender,
	computed, inject,
	signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TuiIcon, tuiDialog } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { EmptyDisplayComponent } from 'components/shared/empty-display/empty-display.component';
import { ErrorDisplayComponent } from 'components/shared/error-display/error-display.component';
import { CreateWalletModalComponent } from 'components/wallets-page/create-wallet-modal/create-wallet-modal.component';
import { filter } from 'rxjs';
import { ConfigService } from 'services/config.service';
import { GetWalletsParams, type WalletDto, WalletsService } from 'services/wallets.service';
import { WalletCardComponent } from './wallet-card/wallet-card.component';
import slice from 'lodash-es/slice';

@Component({
	selector: 'app-wallets',
	imports: [WalletCardComponent, TuiIcon, EmptyDisplayComponent, ErrorDisplayComponent, TuiSkeleton],
	templateUrl: './wallets.component.html',
	styleUrl: './wallets.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsComponent {
	private walletsService = inject(WalletsService);
	private destroyRef = inject(DestroyRef);
	private configService = inject(ConfigService);
	private router = inject(Router);
	private injector = inject(INJECTOR);

	private createWalletDialog = tuiDialog(CreateWalletModalComponent, { size: 'auto' });

	wallets: WritableSignal<WalletDto[]> = signal([]);

	isLoading = signal(false);
	hasError = signal(false);
	showEmpty = computed(() => !this.isLoading() && !this.hasError() && !this.wallets()?.length);
	showError = computed(() => !this.isLoading() && this.hasError());

	pageSize = computed(() => (this.configService.isMobile() ? 2 : 4));
	currentPage = signal(0);
	showPrevBtn = computed(() => this.offset() > 0);
	showNextStepBtn = computed(() => this.offset() + this.pageSize() < this.wallets().length);
	offset = computed(() => (this.currentPage() === 0 ? 0 : this.currentPage() * this.pageSize() - 1));
	currentWalletsSlice = computed(() =>
		this.currentPage() === 0 ? slice(this.wallets(), 0, this.pageSize() - 1) : slice(this.wallets(), this.offset(), this.offset() + this.pageSize()),
	);

	constructor() {
		toObservable(this.configService.isMobile)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => this.currentPage.set(0));

		this.loadWallets();
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

	seeAll() {
		this.router.navigateByUrl('/wallets');
	}

	goToWallet(wallet: WalletDto) {
		this.router.navigate(['/wallets', wallet.trxAddress]);
	}

	private loadWallets() {
		this.hasError.set(false);
		this.isLoading.set(true);
		this.currentPage.set(0);

		const params: GetWalletsParams = {
			page: 0,
			size: 42,
			statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
			sort: 'id,desc',
		};

		this.walletsService
			.getWallets(params)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (res) => {
					this.wallets.set(res.data);

					afterNextRender(
						{
							write: () => this.isLoading.set(false),
						},
						{ injector: this.injector },
					);
				},
				error: (err) => {
					this.hasError.set(true);
					console.error(err);
					this.isLoading.set(false);
				},
			});
	}
}
