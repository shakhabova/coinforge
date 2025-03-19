import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable, switchMap } from 'rxjs';
import { UserService } from './user.service';
import { environment } from '../../environment/environment';

export type TotalBalanceCurrency = 'EUR' | 'GBP';

@Injectable({
	providedIn: 'root',
})
export class BalanceService {
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);
	private userService = inject(UserService);

	getBalance(currency: TotalBalanceCurrency): Observable<number> {
		return this.userService
			.getInfo()
			.pipe(
				switchMap((user) =>
					this.httpClient.get<number>(
						`${this.configService.serverUrl}/v1/bff-custody/wallets/customer/total-balance`,
						{
							params: { currency },
							headers: { 'Customer-ID': environment.customerId },
						},
					),
				),
			);
	}
}
