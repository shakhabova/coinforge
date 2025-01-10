import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ModalCloseButtonComponent } from '../../shared/modal-close-button/modal-close-button.component';
import {
  TuiComboBoxModule,
  TuiInputDateModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TuiDataList, TuiDialogContext, TuiDialogService, TuiDropdown } from '@taiga-ui/core';
import { TuiFilterByInputPipe } from '@taiga-ui/kit';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { AsyncPipe } from '@angular/common';
import { TuiDay, tuiPure } from '@taiga-ui/cdk';
import { Observable, OperatorFunction } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {injectContext} from '@taiga-ui/polymorpheus';
import { TransactionDto } from 'services/transactions.service';

export interface TransactionFilterModel{
  dateFrom: TuiDay | null;
  dateTo: TuiDay | null;
  cryptocurrency: CurrencyDto | null;
  statuses: TransactionDto['oprStatus']
}

@Component({
  selector: 'app-transactions-filter-modal',
  standalone: true,
  imports: [
    TuiInputDateModule,
    ReactiveFormsModule,
    TuiComboBoxModule,
    TuiTextfieldControllerModule,
    TuiDataList,
    TuiFilterByInputPipe,
    TuiDropdown,
    TuiSelectModule,
    AsyncPipe,
  ],
  templateUrl: './transactions-filter-modal.component.html',
  styleUrl: './transactions-filter-modal.component.css',
})
export class TransactionsFilterModalComponent {
  private fb = inject(NonNullableFormBuilder);
  private cryptocurrenciesService = inject(CurrenciesService);
  private destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);

  public readonly context = injectContext<TuiDialogContext<TransactionFilterModel, void>>();
  protected formGroup = this.fb.group({
    dateFrom: null as TuiDay | null,
    dateTo: null as TuiDay | null,
    cryptocurrency: null as unknown as CurrencyDto,
    statuses: null as unknown as TransactionDto['oprStatus'],
  });
 
  statuses = ['CONFIRMED', 'REFUNDED', 'REJECTED'];
  
  protected cryptocurrencies = signal<CurrencyDto[]>([]);
  ngOnInit() {
    this.loadCurrencies();
  }

  @tuiPure
  getCryptoIcon(crypto: string): Observable<string> {
    return this.cryptocurrenciesService.getCurrencyLinkUrl(crypto);
  }

  closeModal() {
  }

  stringifyCryptoSelectItem(item: CurrencyDto): string {
    return item.cryptoCurrencyName;
  }

  currencyMatcher(item: CurrencyDto, search: string): boolean {
    return (
      item.cryptoCurrency.toLowerCase().includes(search.toLowerCase()) ||
      item.cryptoCurrencyName.toLowerCase().includes(search.toLowerCase())
    );
  }
  onApply(){
    console.log(this.formGroup.value);
    this.context.completeWith(this.formGroup.getRawValue());
  }

 onClear(){
   this.formGroup.reset();
 } 
  private loadCurrencies() {
      this.cryptocurrenciesService.getCurrenciesRequest
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((currencies) => this.cryptocurrencies.set(currencies));
    }
}
