import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const ACCESS_TOKEN_KEY = 'AUTH_TOKEN';
const REFRESH_TOKEN_KEY = 'AUTH_REFRESH_TOKEN';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);
	private router = inject(Router);

	private refreshTokenEndpoint = '/v1/auth/srp/refresh';

	public refreshToken(): Observable<void> {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

		return this.httpClient
			.post<{ accessToken: string; refreshToken: string }>(
				`${this.configService.serverUrl}/${this.refreshTokenEndpoint}`,
				{ refreshToken },
			)
			.pipe(
				tap((response) => {
					// Update the access token in the local storage
					localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
					localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
				}),
				catchError((error) => {
					// Handle refresh token error (e.g., redirect to login page)
					console.error('Error refreshing access token:', error);
					return throwError(() => new Error(error));
				}),
				map(() => undefined),
			);
	}

	saveToken(accessToken: string, refreshToken: string) {
		localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
		localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
	}

	isLoggedIn(): boolean {
		// TODO implement
		return true;
	}

	logout() {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		this.router.navigateByUrl('/auth/login');
	}
}
