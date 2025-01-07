import { Component, inject, signal } from '@angular/core';
import { ModalCloseButtonComponent } from '../../shared/modal-close-button/modal-close-button.component';
import {
  TuiComboBoxModule,
  TuiInputDateModule,
  TuiSelectModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TuiDataList, TuiDropdown } from '@taiga-ui/core';
import { TuiFilterByInputPipe } from '@taiga-ui/kit';
import { CurrenciesService, CurrencyDto } from 'services/currencies.service';
import { AsyncPipe } from '@angular/common';
import { tuiPure } from '@taiga-ui/cdk';
import { Observable } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-transactions-filter-modal',
  standalone: true,
  imports: [
    TuiInputDateModule,
    ReactiveFormsModule,
    ModalCloseButtonComponent,
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
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef);
  private cryptocurrenciesService = inject(CurrenciesService);

  protected formGroup = this.fb.group({
    dateFrom: '',
    dateTo: '',
    cryptocurrency: '',
  });

  protected cryptocurrencies = signal<CurrencyDto[]>([]);

  @tuiPure
  getCryptoIcon(crypto: string): Observable<string> {
    return this.cryptocurrenciesService.getCurrencyLinkUrl(crypto);
  }

  closeModal() {
    this.dialogRef.close();
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
}
