import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

export interface CurrencyDto {
  cryptoCurrency: string;
  cryptoCurrencyName: string;
  logUrl: string;
  shortName: string;
  scanUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);

  getCurrencies(): Observable<CurrencyDto[]> {
    return this.httpClient.get<CurrencyDto[]>(`${this.configService.serverUrl}/v1/bff-custody/dict/currencies`);
  }
}
