import {
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  type Signal,
  signal,
} from '@angular/core';
import { SelectListComponent } from '../shared/select-list/select-list.component';
import { type WalletDto, WalletsService } from 'services/wallets.service';
import { map, type Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CurrenciesService } from 'services/currencies.service';
import {
  tuiDialog,
  type TuiDialogContext,
  TuiDialogService,
  TuiError,
  TuiIcon,
} from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { tuiPure } from '@taiga-ui/cdk';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TUI_VALIDATION_ERRORS,
  TuiConfirmService,
  TuiFieldErrorPipe,
  TuiUnmaskHandler,
} from '@taiga-ui/kit';
import { MaskitoDirective } from '@maskito/angular';
import {
  MaskitoMask,
  MaskitoPostprocessor,
  maskitoUpdateElement,
  type MaskitoElement,
  type MaskitoOptions,
} from '@maskito/core';
import {
  maskitoCaretGuard,
  maskitoPostfixPostprocessorGenerator,
} from '@maskito/kit';
import { TransactionsService } from 'services/transactions.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService } from 'services/dialog.service';
import { WithdrawConfirmComponent } from './withdraw-confirm/withdraw-confirm.component';
import {
  addressPatternValidator,
  amountMinValidator,
  amountPatternValidator,
} from './validators';
import {
  customMaskitoPostprocessor,
  maskitoMask,
  onBlurMaskitoPlugin,
} from './maskito-options';

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
    TuiConfirmService,
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'Value is required',
        minlength:
          'A wallet address must be a minimum of 20 characters in length',
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
  private tuiConfirmService = inject(TuiConfirmService);
  private tuiDialogService = inject(TuiDialogService);

  public context =
    injectContext<TuiDialogContext<void, WalletDto | undefined>>();

  private confirmDialog = tuiDialog(WithdrawConfirmComponent, { size: 'auto' });

  formGroup = new FormBuilder().nonNullable.group({
    address: [
      '',
      [
        Validators.required,
        addressPatternValidator(/^[A-Za-z0-9]+$/),
        Validators.minLength(20),
      ],
    ],
    amount: [
      '',
      [Validators.required, amountMinValidator, amountPatternValidator],
    ],
    cryptocurrency: [''],
  });

  amountMaskOptions: Signal<MaskitoOptions> = computed(() => {
    const postfix = this.amountPostfix();
    return {
      mask: maskitoMask(postfix),
      postprocessors: [
        // customMaskitoPostprocessor,
        maskitoPostfixPostprocessorGenerator(postfix),
      ],
      plugins: [
        maskitoCaretGuard((value) => [0, value.length - postfix.length]),
        onBlurMaskitoPlugin(postfix),
      ],
    };
  });

  amountPostfix = computed(() => ` ${this.selected()?.cryptocurrency ?? ''}`);

  selected = model<WalletDto | null>(null);
  phase = signal<'from' | 'to'>('from');
  title = computed(() =>
    this.phase() === 'from' ? 'Withdraw from' : 'Withdraw to',
  );

  protected readonly wallets$ = this.walletService
    .getWallets({
      statusIn: ['ACTIVE'],
      size: 2000,
      page: 0,
    })
    .pipe(map((data) => data.data));

  amountUnmask = (value: string) =>
    value.substring(0, value.length - this.amountPostfix().length);

  ngOnInit() {
    if (this.context.data) {
      this.selected.set(this.context.data);
      this.formGroup.controls.cryptocurrency.setValue(
        this.context.data.cryptocurrency,
      );
      this.phase.set('to');
    }

    // this.context = { ...this.context, dismissible: false };
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
              this.formGroup.controls.amount.setErrors({
                other: 'Insufficient balance. Please re-enter the amount',
              });
              break;
            case 'minimum_amount_not_met':
              this.formGroup.controls.amount.setErrors({
                other: 'Selected amount should be equal or more than 1 EUR',
              });
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

  confirm() {
    const toWalletInfo = this.selected();
    const formValue = this.formGroup.getRawValue();
    if (!toWalletInfo || !formValue.amount) {
      return;
    }

    const closeable = this.tuiConfirmService.withConfirm({
      data: {
        content: 'Are you sure you want to cancel the transfer?',
      },
    });

    this.tuiConfirmService.markAsDirty();

    this.tuiDialogService
      .open(WithdrawConfirmComponent, {
        size: 'auto',
        closeable,
        dismissible: closeable,
        data: {
          toTrxAddress: toWalletInfo.trxAddress,
          amount: Number.parseFloat(formValue.amount),
          cryptocurrency: toWalletInfo.cryptocurrency,
        },
      })
      .subscribe({
        complete: () => this.tuiConfirmService.markAsPristine(),
      });
  }

  backToFromPhase() {
    this.selected.set(null);
    this.phase.set('from');
  }
}

// export function getWithdrawModal() {
//   const confirm = tuiDialog(WithdrawConfirmComponent, {
//     closeable: false,
//     dismissible: false,
//   });
//   return tuiDialog(WithdrawComponent, {
//     closeable: confirm(),
//     dismissible: confirm(),
//   });
// }
