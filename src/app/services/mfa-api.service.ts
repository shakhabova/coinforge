import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class MfaApiService {
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);

	resetMfa(email: string): Observable<void> {
		return this.httpClient.post<void>(
			`${this.configService.serverUrl}/v1/auth/srp/reset-mfa`,
			{ email },
		);
	}

	rejectMfa(email: string, userId: number): Observable<void> {
		return this.httpClient.put<void>(
			`${this.configService.serverUrl}/v1/internal/users/mfa-status?mfaStatus=REJECTED`,
			null,
			{ headers: { 'Custody-User-ID': userId.toString() } },
		);
	}
}
