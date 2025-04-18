import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { map, type Observable, of, switchMap } from 'rxjs';
import type { PageableParams, PageableResponse } from 'models/pageable.model';
import { environment } from '../../environment/environment';
import { UserService } from './user.service';

export interface TransactionDto {
	id: string;
	fromOprAddress: string;
	fromTrxAddress: string;
	toOprAddress: unknown;
	toTrxAddress: string;
	customerId: string;
	receiverCustomerId: unknown;
	institutionId: number;
	amount: string;
	amountInSenderCurrency: string;
	creditAmount: string;
	debitAmount: string;
	totalCommissionAmount: string;
	exchangeCommissionAmount: string;
	transactionCommissionAmount: string;
	maxSlippage: unknown;
	slippageCommissionAmount: unknown;
	currencyFrom: string;
	currencyTo: string;
	exchangeRate: number;
	requestedRate: unknown;
	transactionId: number;
	transactionFee: unknown;
	gasPrice: unknown;
	transactionHash: string;
	trxStatus: string;
	statusDescription: unknown;
	cryptocurrency: string;
	oprStatus: 'REJECTED' | 'CONFIRMED' | 'REFUNDED';
	type: 'IN' | 'OUT' | 'C2F' | 'F2C' | 'C2C' | 'CSTD_OUT' | 'CSTD_IN';
	category: string;
	commissionIsTransferred: unknown;
	provider: unknown;
	amountDirection: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransactionDto {
	cryptocurrency: string;
	amount: number;
	fromTrxAddress: string;
	toTrxAddress: string;
}

interface CreateTransactionResponse {
	id: string;
	cryptocurrency: string;
	amount: number;
	fromTrxAddress: string;
	toTrxAddress: string;
}

export interface TransactionPageableParams extends PageableParams {
	transactionHash?: string;
	dateFrom?: string;
	dateTo?: string;
	cryptocurrency?: string;
	statuses?: string;
	trxAddress?: string;
}

export interface TransactionPageableResponse {
	data: TransactionDto[];
	limit: number;
	page: number;
	total: number;
}

@Injectable({
	providedIn: 'root',
})
export class TransactionsService {
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);
	private userService = inject(UserService);

	getTransactions(params: TransactionPageableParams): Observable<TransactionPageableResponse> {
		const userId = this.userService.currentUser$.value?.id;
		if (!userId) {
			throw new Error('no current user');
		}

		return this.httpClient.get<TransactionPageableResponse>(
			`${this.configService.serverUrl}/v1/bff-custody/transactions`,
			{
				params: params as HttpParams,
				headers: { 'Customer-ID': environment.customerId, 'Custody-User-ID': userId?.toString() ?? '' },
			},
		);
	}

	getSingleTransaction(id: string): Observable<TransactionDto> {
		return this.httpClient
			.get<TransactionPageableResponse>(`${this.configService.serverUrl}/v1/bff-custody/transactions`)
			.pipe(map((transactions) => transactions.data[0]));
	}

	makeTransaction(info: CreateTransactionDto): Observable<CreateTransactionResponse> {
		const userId = this.userService.currentUser$.value?.id;
		if (!userId) {
			throw new Error('no current user');
		}

		return this.httpClient.post<CreateTransactionResponse>(
			`${this.configService.serverUrl}/v1/bff-custody/transactions`,
			info,
			{
				headers: {
					'Customer-ID': environment.customerId,
					'User-ID': userId?.toString() ?? '',
				},
			},
		);
	}

	confirmTransaction(id: string): Observable<void> {
		const userId = this.userService.currentUser$.value?.id;
		if (!userId) {
			throw new Error('no current user');
		}
		
		return this.httpClient.post<void>(
			`${this.configService.serverUrl}/v1/bff-custody/transactions/confirm/${id}`,
			{},
			{
				headers: {
					'Customer-ID': environment.customerId,
					'User-ID': userId?.toString() ?? '',
				},
			},
		);
	}

	deleteTransaction(id: string): Observable<void> {
		const userId = this.userService.currentUser$.value?.id;
		if (!userId) {
			throw new Error('no current user');
		}

		return this.httpClient.delete<void>(
			`${this.configService.serverUrl}/v1/bff-custody/transactions/remove/${id}`,
			{
				headers: {
					'Customer-ID': environment.customerId,
					'User-ID': userId?.toString() ?? '',
				},
			},
		);
	}
}

const mockData: TransactionDto[] = [
	{
		id: 'OUT631',
		fromOprAddress: 'GUA_ARB_9f1de16c-63be-42ca-8a25-7eec09c6821d',
		fromTrxAddress: '0x4F5E892F041f23bD56DAd2B8D957cFA926B92B6B',
		toOprAddress: null,
		toTrxAddress: '0x62886a46C1b71BA8998AF57c5e7Fc7b0a44a877C',
		customerId: '00010004',
		receiverCustomerId: null,
		institutionId: 1,
		amount: '1',
		amountInSenderCurrency: '1',
		creditAmount: '1',
		debitAmount: '1',
		totalCommissionAmount: '0',
		exchangeCommissionAmount: '0',
		transactionCommissionAmount: '0',
		maxSlippage: null,
		slippageCommissionAmount: null,
		currencyFrom: 'ARB',
		currencyTo: 'ARB',
		exchangeRate: 1,
		requestedRate: null,
		transactionId: 505,
		transactionFee: null,
		gasPrice: null,
		transactionHash: '0x173e10397ac8dfccc460c066ac4d1fba04830f38ccc82b8d1720470eab942708',
		trxStatus: 'CONFIRMED',
		statusDescription: null,
		cryptocurrency: 'ARB',
		oprStatus: 'CONFIRMED' as 'REJECTED' | 'CONFIRMED' | 'REFUNDED',
		type: 'CSTD_OUT',
		category: 'TRANSACTION',
		commissionIsTransferred: null,
		provider: null,
		amountDirection: 'currencyFrom',
		createdAt: '2024-11-21T09:16:49.699945',
		updatedAt: '2024-10-04T09:17:24.828483',
	},
	{
		id: 'OUT632',
		fromOprAddress: 'GUA_ARB_9f1de16c-63be-42ca-8a25-7eec09c6821d',
		fromTrxAddress: '0x4F5E892F041f23bD56DAd2B8D957cFA926B92B6B',
		toOprAddress: null,
		toTrxAddress: '0x62886a46C1b71BA8998AF57c5e7Fc7b0a44a877C',
		customerId: '00010004',
		receiverCustomerId: null,
		institutionId: 1,
		amount: '1',
		amountInSenderCurrency: '1',
		creditAmount: '1',
		debitAmount: '1',
		totalCommissionAmount: '0',
		exchangeCommissionAmount: '0',
		transactionCommissionAmount: '0',
		maxSlippage: null,
		slippageCommissionAmount: null,
		currencyFrom: 'ARB',
		currencyTo: 'ARB',
		exchangeRate: 1,
		requestedRate: null,
		transactionId: 505,
		transactionFee: null,
		gasPrice: null,
		transactionHash: '0x173e10397ac8dfccc460c066ac4d1fba04830f38ccc82b8d1720470eab942708',
		trxStatus: 'CONFIRMED',
		statusDescription: null,
		cryptocurrency: 'ARB',
		oprStatus: 'CONFIRMED' as 'REJECTED' | 'CONFIRMED' | 'REFUNDED',
		type: 'F2C',
		category: 'TRANSACTION',
		commissionIsTransferred: null,
		provider: null,
		amountDirection: 'currencyFrom',
		createdAt: '2024-11-22T09:16:49.699945',
		updatedAt: '2024-10-04T09:17:24.828483',
	},
	{
		id: 'OUT633',
		fromOprAddress: 'GUA_ARB_9f1de16c-63be-42ca-8a25-7eec09c6821d',
		fromTrxAddress: '0x4F5E892F041f23bD56DAd2B8D957cFA926B92B6B',
		toOprAddress: null,
		toTrxAddress: '0x62886a46C1b71BA8998AF57c5e7Fc7b0a44a877C',
		customerId: '00010004',
		receiverCustomerId: null,
		institutionId: 1,
		amount: '1',
		amountInSenderCurrency: '1',
		creditAmount: '1',
		debitAmount: '1',
		totalCommissionAmount: '0',
		exchangeCommissionAmount: '0',
		transactionCommissionAmount: '0',
		maxSlippage: null,
		slippageCommissionAmount: null,
		currencyFrom: 'ARB',
		currencyTo: 'ARB',
		exchangeRate: 1,
		requestedRate: null,
		transactionId: 505,
		transactionFee: null,
		gasPrice: null,
		transactionHash: '0x173e10397ac8dfccc460c066ac4d1fba04830f38ccc82b8d1720470eab942708',
		trxStatus: 'CONFIRMED',
		statusDescription: null,
		cryptocurrency: 'ARB',
		oprStatus: 'CONFIRMED' as 'REJECTED' | 'CONFIRMED' | 'REFUNDED',
		type: 'OUT',
		category: 'TRANSACTION',
		commissionIsTransferred: null,
		provider: null,
		amountDirection: 'currencyFrom',
		createdAt: '2024-11-22T09:16:49.699945',
		updatedAt: '2024-10-04T09:17:24.828483',
	},
];
