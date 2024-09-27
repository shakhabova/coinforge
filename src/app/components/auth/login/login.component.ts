import { Component, DestroyRef, inject, INJECTOR } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { OptCodeComponent } from '../opt-code/opt-code.component';
import { LoginApiService } from 'services/login-api.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiDialogService, TuiError, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiFieldErrorPipe, TuiInputPassword } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { ForcePasswordChangeComponent } from './force-password-change/force-password-change.component';
import { AskForMfaComponent } from './ask-for-mfa/ask-for-mfa.component';
import { MfaApiService } from 'services/mfa-api.service';
import {PolymorpheusComponent} from '@taiga-ui/polymorpheus';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmailOtpCodeComponent, EmailOtpModalData } from '../email-otp-code/email-otp-code.component';

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
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private dialog = inject(MatDialog);
  private loginService = inject(LoginApiService);
  private fb = inject(NonNullableFormBuilder);
  private loginApiService = inject(LoginApiService);
  private mfaApiService = inject(MfaApiService);
  private destroyRef = inject(DestroyRef);
  private readonly tuiDialogs = inject(TuiDialogService);
  private readonly injector = inject(INJECTOR);

  protected formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    const email = this.formGroup.value.email!;

    this.loginService.login(this.formGroup.getRawValue())
      .subscribe({
        next: response => {
          if (response.userStatus === 'FORCE_PASSWORD_CHANGE') {
            this.forceChangePass();
            return;
          }

          if (response.userStatus === 'ACTIVE') {
            switch(response.mfaStatus) {
              case 'PENDING':
                this.askForMfa(email);
                break;
              case 'ACTIVATED':
                // TODO display google otp code input
                break;
              case 'REJECTED':
                this.authorize();
                break;
            }
          }
        },
        error: err => {
          switch(err.code) {
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
        }
      })
  }

  signIn() {
    this.dialog.open(OptCodeComponent);
  }

  private forceChangePass() {
    // TODO open change password modal
    this.dialog.open(ForcePasswordChangeComponent);
  }

  private askForMfa(email: string) {
    const dialogRef = this.dialog.open(AskForMfaComponent);
    dialogRef.afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: boolean) => {
        if (result) {
          this.mfaApiService.resetMfa(email)
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
              this.showOTPModal(email);
            });
        } else {
          this.mfaApiService.rejectMfa(email)
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => this.authorize());
        }
      })
  }

  private authorize() {
    
  }

  private showOTPModal(email: string): void {
    const otpDialog = this.tuiDialogs.open<unknown>(
      new PolymorpheusComponent(EmailOtpCodeComponent, this.injector),
      {
        data: { email, submitUrl: '/v1/auth/srp/reset-mfa/submit' },
      }
    );

    otpDialog.subscribe(result => {
      if (!result) {
        return;
      }

      // TODO navigate to google auth page
    });
  }
}
