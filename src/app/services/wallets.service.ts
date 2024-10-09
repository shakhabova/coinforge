import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { map, Observable, of } from 'rxjs';

export interface GetWalletsParams {
  statusIn: WalletStatus[];
  size: number;
  page: number;
  sort: string;
}

export type WalletStatus = 'ACTIVE' | 'CUSTOMER_BLOCKED' | 'DEACTIVATED';

export interface WalletsPageableDto {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  data: WalletDto[];
}

export interface WalletDto {
  id: number;
  oprAddress: string;
  trxAddress: string;
  walletName: string;
  walletStatus: WalletStatus;
  cryptocurrency: string;
  oprBalance: number;
  availableOprBalance: number;
  trxBalance: number;
  nativeTokenBalance: number | null;
  createdAt: string;
  updatedAt: string;
  status: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);

  getWallets(params: GetWalletsParams): Observable<WalletsPageableDto> {
    return of({
      "data": [
        {
          "id": 215,
          "oprAddress": "GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2",
          "trxAddress": "tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9",
          "walletName": "Custody user's 1 wallet",
          "walletStatus": "ACTIVE", // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
          "cryptocurrency": "BTC",
          "oprBalance": 0,
          "availableOprBalance": 0, 
          "trxBalance": 0,
          "nativeTokenBalance": null,
          "createdAt": "2024-09-26T11:29:23.366437",
          "updatedAt": "2024-09-26T11:29:23.366484",
          "status": null
        }
      ],
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 1
    })
    // return this.httpClient.get<WalletsPageableDto>(
    //   `${this.configService.serverUrl}/v1/bff-custody/wallets/customer`, 
    //   { 
    //     params: {
    //       statusIn: params.statusIn,
    //       page: params.page,
    //       size: params.size,
    //       sort: params.sort,
    //     } 
    //   }
    // );
  }

  getWalletsForDashboard(): Observable<WalletDto[]> {
    return this.getWallets({ statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'], page: 0, size: 5, sort: 'id,desc'})
      .pipe(
        map(pageable => pageable.data),
      );
  }
}
