import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface ChallengeResponse {
  b: string;
  salt: string;
}

export type Gender = 'MALE' | 'FEMALE';

interface UserBaseModel {
  "firstName": string;
  "lastName" : string;
  "gender": Gender;
  "email": string;
  "phoneNumber": string,
  "country": string,
  "city": string,
  "zipCode": string,
  "address"?: string,
}

export interface CreateUserRequest extends UserBaseModel {
  "verifier": string;
  "salt": string;
}

export interface CreateUserResponse extends UserBaseModel {
  id: string;
  status: string;
  role: string;
}

export interface ValidateOTPRequest {
  email: string;
  otp: string;
  id: string;
}

export interface ValidateOTPError {
  code: number;
  status: ValidateOTPErrorMessages;
}

export type ValidateOTPErrorMessages = 'OTP_EXPIRED' | 'INVALID_OTP' | 'invalid_mail_format' | 'empty_email' | 'empty_opt';

@Injectable({providedIn: 'root'})
export class SignUpApiService {
  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
  ) { }
  
  generateVerifierAndSalt(email: string): Observable<ChallengeResponse> {
    return this.httpClient.post<ChallengeResponse>(`${this.configService.serverUrl}/v1/auth/srp/challenge`, { email });
  }

  createUser(user: CreateUserRequest): Observable<CreateUserResponse> {
    return this.httpClient.post<CreateUserResponse>(`${this.configService.serverUrl}/v1/users/registration`, user);
  }

  resendOTP(email: string): Observable<void> {
    return this.httpClient.post<void>(`${this.configService.serverUrl}/v1/users/registration/otp/resend`, { email });
  }

  validateOTP(req: ValidateOTPRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.configService.serverUrl}/v1/users/registration/otp/validate`, req);
  }
}