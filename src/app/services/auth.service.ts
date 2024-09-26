import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ConfigService } from "./config.service";
import { catchError, map, Observable, tap, throwError } from "rxjs";

export const ACCESS_TOKEN_KEY = 'AUTH_TOKEN';
const REFRESH_TOKEN_KEY = 'AUTH_REFRESH_TOKEN';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);
  
  private refreshTokenEndpoint = '';
  
  public refreshToken(): Observable<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    return this.httpClient.post<{ accessToken: string; refreshToken: string }>(`${this.configService.serverUrl}/${this.refreshTokenEndpoint}`, { refreshToken })
      .pipe(
        tap((response) => {
          // Update the access token in the local storage
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        }),
        catchError((error) => {
          // Handle refresh token error (e.g., redirect to login page)
          console.error('Error refreshing access token:', error);
          return throwError(() => new Error(error));
        }),
        map(() => undefined)
      )
  }

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}