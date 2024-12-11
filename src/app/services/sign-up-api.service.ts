import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
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
    // return of({
    //   salt: '36b8d1940b799bd942e77bedb5dc2dab02dba0a82c21df01ad5060ab72431236',
    //   b: '41d723c013b0f5b4657ca8be531e08c32c3c1acfc2f2166b28830f017fa1e41a264fdc48d185d3565faae146205dfbfbe9942c18d0ed970d530262d2b89ff9fcd4f3c1510396010508d656e319befef6b82598af630fdbc22a0daec5453738216f311b621d936d92e68c1a5dc57525df1ce3f572dd3be30b757b7b19b151ed020ab013aed998a0c0936882ad2e40d3c89735feb23c074fff392e5780626833da5cd30a0f03ce409b66cdccd1eb9140cb92bf45e279c4638d8bd69b75a962a3d318ce462fa8c9897cb1c959e12f2e02a05ee38cb13aca5c13649632dd5ff5d2a550c1901bc6c838c5407b7cddd6b03f590aef2267c08d9e510d5132ddc8b2f84d'
    // })
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