import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { from, Observable, switchMap } from 'rxjs';
import { hexStringToBigInt } from 'utils/functions';
import { SrpClientService } from './srp-client.service';

export interface LoginChallengeResponse {
  salt: string;
  b: string;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface AuthenticateResponse {
  userStatus: AuthenticateUserStatus;
  mfaStatus: MfaStatus;
  accessToken?: string;
  refreshToken?: string;
  role?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type AuthenticateUserStatus = 'FORCE_PASSWORD_CHANGE' | 'ACTIVE';
export type MfaStatus = 'REJECTED' | 'PENDING' | 'ACTIVATED';

@Injectable({providedIn: 'root'})
export class LoginApiService {
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);
  private srpClient = inject(SrpClientService).srpClient;

  public generateVerifierAndSalt(email: string): Observable<LoginChallengeResponse> {
    return this.httpClient.post<LoginChallengeResponse>(`${this.configService.serverUrl}/v1/custody/auth/srp/challenge`, { email });
  }

  public login(value: LoginModel): Observable<AuthenticateResponse> {
    return this.generateVerifierAndSalt(value.email)
      .pipe(
        switchMap(challenge => {
          this.srpClient.step1(value.email, value.password);
          const {A, M1} = this.srpClient.step2(challenge.salt, challenge.b);

          const request = { a: A, m1: M1, email: value.email };
          return this.httpClient.post<AuthenticateResponse>(`${this.configService.serverUrl}/v1/custody/auth/srp/authenticate`, request);
        }),
      );
  }

  public forceChangePassword(email: string, password: string): Observable<{ data: string }> {
    return this.generateVerifierAndSalt(email)
      .pipe(
        switchMap(challenge => {
          this.srpClient.step1(email, password);
          const {A, M1} = this.srpClient.step2(challenge.salt, challenge.b);

          const request = { a: A, m1: M1, email };
          return this.httpClient.post<{ data: string}>(`${this.configService.serverUrl}/v1/auth/srp/force-change-password`, request);
        })
      );
  }

  public sendMfaOtpCode(otp: string, email: string): Observable<AuthenticateResponse> {
    return this.httpClient.post<AuthenticateResponse>(`${this.configService.serverUrl}/v1/custody/auth/srp/check-mfa`, { otp, email });
  }
}