import { Component, computed, DestroyRef, inject, linkedSignal, model, type Signal, signal } from '@angular/core';
import { SelectListComponent } from '../shared/select-list/select-list.component';
import { type WalletDto, WalletsService } from 'services/wallets.service';
import { map, type Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrenciesService } from 'services/currencies.service';
import { tuiDialog, type TuiDialogContext, TuiDialogService, TuiError, TuiIcon } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { tuiPure } from '@taiga-ui/cdk';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { type AbstractControl, FormBuilder, ReactiveFormsModule, type ValidatorFn, Validators } from '@angular/forms';
import { TUI_VALIDATION_ERRORS, TuiConfirmService, TuiFieldErrorPipe, TuiUnmaskHandler } from '@taiga-ui/kit';
import { MaskitoDirective } from '@maskito/angular';
import { maskitoUpdateElement, type MaskitoElement, type MaskitoOptions } from '@maskito/core';
import { maskitoCaretGuard, maskitoPostfixPostprocessorGenerator } from '@maskito/kit';
import { TransactionsService } from 'services/transactions.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'services/dialog.service';
import { WithdrawConfirmComponent } from './withdraw-confirm/withdraw-confirm.component';
import { WithdrawService } from './widthdraw.service';

@Component({
	selector: 'app-withdraw',
	standalone: true,
	imports: [
		SelectListComponent,
		AsyncPipe,
		TuiIcon,
		TuiInputModule,
		TuiTextfieldControllerModule,
		ReactiveFormsModule,
		TuiError,
		TuiFieldErrorPipe,
		MaskitoDirective,
		TuiUnmaskHandler,
	],
	templateUrl: './withdraw.component.html',
	styleUrl: './withdraw.component.css',
	providers: [
		{
			provide: TUI_VALIDATION_ERRORS,
			useValue: {
				required: 'Value is required',
				minlength: 'A wallet address must be a minimum of 20 characters in length',
			},
		},
	],
})
export class WithdrawComponent {
	private walletService = inject(WalletsService);
	private currenciesService = inject(CurrenciesService);
	private transactionsService = inject(TransactionsService);
	private dialogService = inject(DialogService);
	private destroyRef = inject(DestroyRef);
	private withdrawService = inject(WithdrawService);

	private context = injectContext<TuiDialogContext<void, WalletDto | undefined>>();

	formGroup = this.withdrawService.formGroup;

	amountMaskOptions: Signal<MaskitoOptions> = computed(() => {
		const postfix = this.amountPostfix();
		return {
			mask: ({ value }) => {
				let isDotUsed = false;
				const digitsMask = Array.from(value.replaceAll(postfix, '')).map((char) => {
					if (char === this.decimalPointChar) {
						if (!isDotUsed) {
							isDotUsed = true;
							return /\./;
						}
					}
					return /\d/;
				});

				if (!digitsMask.length) {
					return [/[\d\.]/];
				}

				return [...digitsMask, postfix];
			},
			postprocessors: [
				// ({ value, selection }, initialElementState) => {
				// 	const [from, to] = selection;
				// 	const initValue = initialElementState.value;
				// 	let newValue = value;
				// 	if (value.startsWith('0')) {
				// 		if (value.includes('.') && /[1-9]+0*\./.test(value)) {
				// 			newValue = value.replace(/^0+/, '');
				// 		} else if (!value.includes('.') && !initValue.includes('.')) {
				// 			newValue = `0.${value}`;
				// 			selection = [from + 2, to + 2];
				// 		}
				// 	}

				// 	return {
				// 		value: newValue,
				// 		selection,
				// 	};
				// },
				maskitoPostfixPostprocessorGenerator(postfix),
			],
			plugins: [
				maskitoCaretGuard((value) => [0, value.length - postfix.length]),
				(element: MaskitoElement) => {
					const blurHandler = () => {
						const valueWithoutPostfix = element.value.substring(0, element.value.length - postfix.length);

						if (element.value.startsWith(this.decimalPointChar)) {
							maskitoUpdateElement(element, `0${element.value}`);
						} else if (
							element.value.startsWith('0') &&
							/[1-9]/.test(element.value) &&
							!element.value.includes(this.decimalPointChar)
						) {
							maskitoUpdateElement(element, `0.${element.value}`);
						}

						if (valueWithoutPostfix.endsWith(this.decimalPointChar)) {
							maskitoUpdateElement(
								element,
								`${valueWithoutPostfix.substring(0, valueWithoutPostfix.length - 1)}${postfix}`,
							);
						}
					};

					element.addEventListener('blur', blurHandler);

					return () => element.removeEventListener('blur', blurHandler);
				},
			],
		};
	});
	amountPostfix = computed(() => ` ${this.selected()?.cryptocurrency ?? ''}`);

	selected = model<WalletDto | null>(null);
	phase = signal<'from' | 'to'>('from');
	title = computed(() => (this.phase() === 'from' ? 'Withdraw from' : 'Withdraw to'));

	private decimalPointChar = '.';

	protected readonly wallets$ = this.walletService
		.getWallets({
			statusIn: ['ACTIVE'],
			size: 2000,
			page: 0,
		})
		.pipe(map((data) => data.data));

	amountUnmask = (value: string) => value.substring(0, value.length - this.amountPostfix().length);

	ngOnInit() {
		if (this.context.data) {
			this.selected.set(this.context.data);
			this.formGroup.controls.cryptocurrency.setValue(this.context.data.cryptocurrency);
			this.phase.set('to');
		}

		this.context = { ...this.context, dismissible: false };
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

		this.formGroup.controls.cryptocurrency.setValue(selected.cryptocurrency);

		this.phase.set('to');
	}

	onNext() {
		this.formGroup.updateValueAndValidity();
		if (this.formGroup.invalid) {
			return;
		}

		const formValue = this.formGroup.getRawValue();
		const selectedWallet = this.selected();
		if (!selectedWallet) {
			return;
		}

		this.transactionsService
			.makeTransaction({
				amount: Number.parseFloat(formValue.amount),
				fromTrxAddress: selectedWallet.trxAddress,
				toTrxAddress: formValue.address,
				cryptocurrency: selectedWallet.cryptocurrency,
			})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					// TODO transaction made successfully
				},
				error: (err) => {
					switch (err.error?.code) {
						case 'insufficient_balance':
							this.formGroup.controls.amount.setErrors({ other: 'Insufficient balance. Please re-enter the amount' });
							break;
						case 'minimum_amount_not_met':
							this.formGroup.controls.amount.setErrors({ other: 'Selected amount should be equal or more than 1 EUR' });
							break;
						default:
							this.dialogService
								.showInfo({
									type: 'warning',
									title: 'Error',
									text: 'An unexpected error has appeared. Please try again later.',
								})
								.subscribe();
					}
				},
			});
	}

	backToFromPhase() {
		this.selected.set(null);
		this.phase.set('from');
	}
}

export function getWithdrawModal() {
	const confirm = tuiDialog(WithdrawConfirmComponent, { closeable: false, dismissible: false });
	return tuiDialog(WithdrawComponent, { closeable: confirm(), dismissible: confirm() });
}
