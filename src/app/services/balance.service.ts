import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable, switchMap } from 'rxjs';
import { UserService } from './user.service';

export type TotalBalanceCurrency = 'EUR' | 'GBP';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);
  private userService = inject(UserService);

  getBalance(
    currency: TotalBalanceCurrency,
  ): Observable<number> {
    // return of(currency === 'EUR' ? 6555 : 7509); // TODO remove temp code
    return this.userService.getInfo()
      .pipe(
        switchMap(user => this.httpClient.get<number>(
          `${this.configService.serverUrl}/v1/bff-custody/wallets/customer/total-balance`,
          { params: { currency }, headers: { 'Customer-ID': user.id.toString() } }
        ))
      )
     ;
  }
}
