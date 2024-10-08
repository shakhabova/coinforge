import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable, of } from 'rxjs';

export type TotalBalanceCurrency = 'EUR' | 'GBP';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);

  getBalance(currency: TotalBalanceCurrency): Observable<number> {
    return of(7509); // TODO remove temp code
    // return this.httpClient.get<number>(`${this.configService.serverUrl}/v1/bff-custody/wallets/customer/total-balance`, { params: { currency } });
  }
}
