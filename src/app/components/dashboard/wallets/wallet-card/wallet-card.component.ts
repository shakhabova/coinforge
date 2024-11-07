import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { WalletStatusChipComponent } from 'components/shared/wallet-status-chip/wallet-status-chip.component';
import { map, of } from 'rxjs';
import { CurrenciesService } from 'services/currencies.service';
import { WalletDto, WalletStatus } from 'services/wallets.service';

@Component({
  selector: 'app-wallet-card',
  standalone: true,
  imports: [
    AsyncPipe,
    WalletStatusChipComponent,
    DecimalPipe
  ],
  templateUrl: './wallet-card.component.html',
  styleUrl: './wallet-card.component.css'
})
export class WalletCardComponent {
  wallet = input.required<WalletDto>();


  private cryptoService = inject(CurrenciesService);

  // TODO make requests trough proxy for development
  cryptoIcon = computed(() => of(''));
  cryptoName = computed(() => of(''))

  
}
