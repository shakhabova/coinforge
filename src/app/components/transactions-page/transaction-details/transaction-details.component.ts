import { Component, computed, inject, input, signal } from '@angular/core';
import type { TransactionDto } from 'services/transactions.service';
import { TransactionTypeIconComponent } from '../../shared/transaction-type-icon/transaction-type-icon.component';
import { TransactionStatusChipComponent } from '../../shared/transaction-status-chip/transaction-status-chip.component';
import { CopyIconComponent } from '../../shared/copy-icon/copy-icon.component';
import { CurrenciesService } from 'services/currencies.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { injectContext } from '@taiga-ui/polymorpheus';
import { type TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
	selector: 'app-transaction-details',
	imports: [TransactionStatusChipComponent, CopyIconComponent, DatePipe, TuiIcon],
	templateUrl: './transaction-details.component.html',
	styleUrl: './transaction-details.component.scss',
})
export class TransactionDetailsComponent {
	private cryptocurrenciesService = inject(CurrenciesService);
	public readonly context = injectContext<TuiDialogContext<void, TransactionDto>>();

	transaction = signal<TransactionDto>({} as unknown as TransactionDto);
	scanUrl = signal('');
	screenshotIsTaking = signal(false);

	isOutTransaction = computed(() => ['CSTD_OUT', 'C2F'].includes(this.transaction().type));
	displayToWallet = computed(() => ['CSTD_OUT', 'CSTD_IN'].includes(this.transaction().type));

	ngOnInit() {
		this.transaction.set(this.context.data);
		this.cryptocurrenciesService
			.getCryptoInfo(this.transaction().cryptocurrency)
			.pipe(map((info) => info?.scanUrl))
			.subscribe((scanUrl) => this.scanUrl.set(scanUrl ?? ''));
	}

	async download() {
		this.screenshotIsTaking.set(true);
		setTimeout(async () => {
			const canvas = await html2canvas(document.querySelector('.screenshot-wrapper')!);
			const imageBase64 = canvas.toDataURL('image/png');
			const a = document.createElement('a');
			a.href = imageBase64;
			a.download = 'transaction.png';
			a.click();
			this.screenshotIsTaking.set(false);
		}, 0);
	}
}
