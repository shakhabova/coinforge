import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, model, signal } from '@angular/core';
import { tuiPure } from '@taiga-ui/cdk';
import { TuiIcon } from '@taiga-ui/core';
import { SelectListComponent } from 'components/shared/select-list/select-list.component';
import { map, Observable, of } from 'rxjs';
import { CurrenciesService } from 'services/currencies.service';
import { WalletDto, WalletsService } from 'services/wallets.service';
import QRCode from 'qrcode';

@Component({
	selector: 'app-top-up',
	imports: [AsyncPipe, SelectListComponent, TuiIcon],
	templateUrl: './top-up.component.html',
	styleUrl: './top-up.component.css',
})
export class TopUpComponent {
	private walletService = inject(WalletsService);
	private currenciesService = inject(CurrenciesService);

	selected = model<WalletDto | null>(null);
	phase = signal<'select' | 'qr'>('select');
	qrDataUrl = signal<string | null>(null);
	title = computed(() =>
		this.phase() === 'select' ? 'Top-up with crypto' : 'Receive crypto',
	);

	protected readonly wallets$ = this.walletService
		.getWallets({
			statusIn: ['ACTIVE'],
			size: 2000,
			page: 0,
		})
		.pipe(map((data) => data.data));

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

	async onContinue() {
		const selected = this.selected();
		if (!selected) {
			return;
		}

		this.qrDataUrl.set(
			await QRCode.toDataURL(selected.trxAddress, { margin: 0, width: 200 }),
		);
		this.phase.set('qr');
	}

	copyAddress() {
		navigator.clipboard.writeText(this.selected()?.trxAddress!);
	}

	toSelectPhase() {
		this.selected.set(null);
		this.phase.set('select');
	}
}
