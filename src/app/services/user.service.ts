import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable, shareReplay } from 'rxjs';
import type { MfaStatus } from './login-api.service';
import { ConfigService } from './config.service';

export interface UserInfoDto {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	country: string;
	city: string;
	zipCode: string;
	address: string;
	status: string;
	mfaStatus: MfaStatus;
	role: string;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);

	currentUserId$ = this.getInfo().pipe(map(info => info.id));

	getInfo(): Observable<UserInfoDto> {
		return this.httpClient
			.get<UserInfoDto>(`${this.configService.serverUrl}/v1/users/current`)
			.pipe(shareReplay({ bufferSize: 1, refCount: true }));
	}

	getUser(email: string): Observable<UserInfoDto> {
		return this.httpClient.get<UserInfoDto>(
			`${this.configService.serverUrl}/v1/internal/users`,
			{ params: { email: decodeURIComponent(email) } },
		);
	}
}
