import { Component, computed, inject, input, signal } from '@angular/core';
import { TransactionDto } from 'services/transactions.service';
import { TransactionTypeIconComponent } from '../../shared/transaction-type-icon/transaction-type-icon.component';
import { TransactionStatusChipComponent } from '../../shared/transaction-status-chip/transaction-status-chip.component';
import { CopyIconComponent } from '../../shared/copy-icon/copy-icon.component';
import { CurrenciesService } from 'services/currencies.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [
    TransactionTypeIconComponent,
    TransactionStatusChipComponent,
    CopyIconComponent,
  ],
  templateUrl: './transaction-details.component.html',
  styleUrl: './transaction-details.component.css',
})
export class TransactionDetailsComponent {
  private cryptocurrenciesService = inject(CurrenciesService);
  transaction = signal<TransactionDto>({} as unknown as TransactionDto);

   public readonly context =
      injectContext<TuiDialogContext<void, TransactionDto>>();

  scanUrl = signal('');

  ngOnInit(){
    this.transaction.set(this.context.data)
    this.cryptocurrenciesService
        .getCryptoInfo(this.transaction().cryptocurrency)
        .pipe(map((info) => info?.scanUrl))
        .subscribe(scanUrl=>this.scanUrl.set(scanUrl ?? ''))
  }
}
