import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { map, Observable, of } from 'rxjs';
import { CurrenciesService } from './currencies.service';

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

export const DASHBOARD_WALLETS_COUNT = 5;

@Injectable({
  providedIn: 'root',
})
export class WalletsService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);
  private currenciesService = inject(CurrenciesService);

  getWallets(params: GetWalletsParams): Observable<WalletsPageableDto> {
    console.log(params);
    return of(MOCK_WALLETS);
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
    return this.getWallets({
      statusIn: ['ACTIVE', 'CUSTOMER_BLOCKED', 'DEACTIVATED'],
      page: 0,
      size: DASHBOARD_WALLETS_COUNT,
      sort: 'id,desc',
    }).pipe(map((pageable) => pageable.data));
  }

  blockWallet(wallet: WalletDto): Observable<void> {
    return this.setWalletStatus(wallet.trxAddress, 'CUSTOMER_BLOCKED');
  }

  unblockWallet(wallet: WalletDto): Observable<void> {
    return this.setWalletStatus(wallet.trxAddress, 'ACTIVE');
  }

  deactivateWallet(wallet: WalletDto): Observable<void> {
    return this.setWalletStatus(wallet.trxAddress, 'DEACTIVATED')
  }

  getEligibleCryptos(): Observable<{ cryptocurrency: string }[]> {
    return this.currenciesService.getCurrenciesRequest.pipe(map(infos => infos.map(info => ({cryptocurrency: info.})))
    // return this.httpClient.get<{ cryptocurrency: string }[]>(`${this.configService.serverUrl}/v1/bff-custody/wallets/eligible-cryptocurrencies`);
  }

  private setWalletStatus(trxAddress: string, status: WalletStatus): Observable<void> {
    // TODO check 
    return this.httpClient.put<void>(`${this.configService.serverUrl}/v1/bff-custody/wallets/customer/update-status/${trxAddress}?status=${status}`, status)
  }
}

const MOCK_WALLETS = {
  data: [
    {
      id: 215,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'CUSTOMER_BLOCKED' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 0,
      availableOprBalance: 0,
      trxBalance: 0,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2156,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'DEACTIVATED' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 3,
      availableOprBalance: 0,
      trxBalance: 0,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2135,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 4,
      availableOprBalance: 0,
      trxBalance: 0,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2154,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 5,
      availableOprBalance: 0,
      trxBalance: 0,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2155,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 6,
      availableOprBalance: 0,
      trxBalance: 0,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2156,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 7,
      availableOprBalance: 7,
      trxBalance: 7,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 21534,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 8,
      availableOprBalance: 7,
      trxBalance: 7,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
    {
      id: 2158,
      oprAddress: 'GUA_BTC_30b652cd-ca24-4cc0-873a-ff4ddb1ccba2',
      trxAddress: 'tb1qevz7vtsq5e9ert5qp0za9fzgwt7pksys66guq9',
      walletName: "Custody user's 1 wallet",
      walletStatus: 'ACTIVE' as WalletStatus, // ACTIVE / CUSTOMER_BLOCKED / DEACTIVATED
      cryptocurrency: 'BTC',
      oprBalance: 9,
      availableOprBalance: 7,
      trxBalance: 7,
      nativeTokenBalance: null,
      createdAt: '2024-09-26T11:29:23.366437',
      updatedAt: '2024-09-26T11:29:23.366484',
      status: null,
    },
  ],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 8,
};
