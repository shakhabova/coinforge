import { Component, DestroyRef, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticateResponse, LoginApiService } from 'services/login-api.service';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TuiError, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiFieldErrorPipe, TuiInputPassword } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { ForcePasswordChangeComponent } from './force-password-change/force-password-change.component';
import { MfaApiService } from 'services/mfa-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MfaOtpCodeComponent } from '../mfa-otp-code/mfa-otp-code.component';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDialogModule,
    TuiLabel,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiInputPassword,
    TuiTextfield,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private dialog = inject(MatDialog);
  private loginService = inject(LoginApiService);
  private fb = inject(NonNullableFormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private authService = inject(AuthService);

  protected formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    const email = this.formGroup.value.email!;
 

    this.loginService
      .login(this.formGroup.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.userStatus === 'FORCE_PASSWORD_CHANGE') {
            this.forceChangePass(email);
            return;
          }

          if (response.userStatus === 'ACTIVE') {
            switch (response.mfaStatus) {
              case 'PENDING':
                this.askForMfa(email);
                break;
              case 'ACTIVATED':
                this.sendMfaOtpCode(email);
                break;
              case 'REJECTED':
                this.authorize(response);
                break;
            }
          }
        },
        error: (err) => {
          switch (err.code) {
            case 'user_not_found':
              // TODO display not found modal
              break;
            case 'unauthorized':
              // TODO display invalid creds modal
              break;
            case 'temporary_blocked':
              // TODO display temp blocked modal
              break;
            case 'account_pending':
              // TODO display account pending modal
              break;
            case 'too_many_attempts':
              // TODO display too many attempts modal
              break;
            case 'email_confirmation_pending':
              // TODO display conf email modal
              break;
            default:
            // TODO dispaly unexpected error modal;
          }
        },
      });
  }

  private sendMfaOtpCode(email: string) {
    const dialogRef = this.dialog.open(MfaOtpCodeComponent, { data: { email }});

    dialogRef.afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(response => {
        if (response) {
          this.authorize(response);
        }
      })
  }

  private forceChangePass(email: string) {
    this.router.navigateByUrl('/auth/force-change-password', { state: { email }});
  }

  private askForMfa(email: string) {
    this.router.navigate(['/auth/two-factor-auth'], { state: { email } });
  }

  private authorize(response: AuthenticateResponse) {
    this.authService.saveToken(response.accessToken!, response.refreshToken!);
    this.router.navigateByUrl('/dashboard');
  }
}
