import { Component, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { type TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { finalize } from 'rxjs';
import { DialogService } from 'services/dialog.service';
import {
  type AuthenticateResponse,
  LoginApiService,
} from 'services/login-api.service';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';

export interface MfaOtpModalData {
  email: string;
}

@Component({
  selector: 'app-mfa-otp-code',
  imports: [OtpCodeInputComponent],
  templateUrl: './mfa-otp-code.component.html',
  styleUrl: './mfa-otp-code.component.css',
})
export class MfaOtpCodeComponent {
  private loginService = inject(LoginApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  public readonly context =
    injectContext<
      TuiDialogContext<AuthenticateResponse | null, MfaOtpModalData>
    >();

  protected otpCode = model('');
  protected errorMessage = signal('');
  protected loading = signal(false);

  constructor() {
    explicitEffect([this.otpCode], ([otpCode]) => {
      if (otpCode.length === 6) {
        this.sendOtpCode();
      } else {
        this.errorMessage.set('');
      }
    });
  }

  closeModal() {
    this.context.completeWith(null);
  }

  recover() {
    this.router.navigateByUrl('/auth/mfa-connect', {
      state: { email: this.context.data.email },
    });
  }

  private sendOtpCode() {
    this.loading.set(true);

    this.loginService
      .sendMfaOtpCode(this.otpCode(), this.context.data.email)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => this.context.completeWith(response),
        error: (err) => {
          if (err.code === 'invalid_otp') {
            this.errorMessage.set('Invalid verification code');
            return;
          }

          this.dialogService
            .showInfo({
              type: 'warning',
              title: 'Error',
              text: 'An unexpected error has appeared. Please try again later.',
            })
            .subscribe();
        },
      });
  }
}
