import {
	Component,
	computed,
	inject,
	linkedSignal,
	model,
	signal,
} from '@angular/core';
import { SelectListComponent } from '../shared/select-list/select-list.component';
import { type WalletDto, WalletsService } from 'services/wallets.service';
import { map, type Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrenciesService } from 'services/currencies.service';
import { type TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { tuiPure } from '@taiga-ui/cdk';

@Component({
	selector: 'app-withdraw',
	standalone: true,
	imports: [SelectListComponent, AsyncPipe, TuiIcon],
	templateUrl: './withdraw.component.html',
	styleUrl: './withdraw.component.css',
})
export class WithdrawComponent {
	private walletService = inject(WalletsService);
	private currenciesService = inject(CurrenciesService);
	private readonly context =
		injectContext<TuiDialogContext<void, string | undefined>>();

	selected = model<WalletDto | null>(null);
	phase = signal<'from' | 'to'>('from');
	title = computed(() =>
		this.phase() === 'from' ? 'Withdraw from' : 'Withdraw to',
	);
	selectedFrom = linkedSignal(() => this.selected()?.trxAddress);

	protected readonly wallets$ = this.walletService
		.getWallets({
			statusIn: ['ACTIVE'],
			size: 2000,
			page: 0,
		})
		.pipe(map((data) => data.data));

	ngOnInit() {
		if (this.context.data) {
			this.selectedFrom.set(this.context.data);
		}
	}

	@tuiPure
	getCryptoIcon(crypto?: string): Observable<string> {
		if (!crypto) return of('');

		return this.currenciesService.getCurrencyLinkUrl(crypto);
	}

	@tuiPure
	getCryptoName(crypto?: string): Observable<string> {
		if (!crypto) return of('');

		return this.currenciesService.getCurrencyName(crypto);
	}

	onContinue() {
		const selected = this.selected();
		if (!selected) {
			return;
		}

		this.phase.set('to');
	}

	backToFromPhase() {
		this.selected.set(null);
		this.phase.set('from');
	}
}
