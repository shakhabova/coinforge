import { Component, DestroyRef, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginApiService } from 'services/login-api.service';
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
  private loginApiService = inject(LoginApiService);
  private mfaApiService = inject(MfaApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

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
            this.forceChangePass();
            return;
          }

          if (response.userStatus === 'ACTIVE') {
            switch (response.mfaStatus) {
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

  private forceChangePass() {
    this.dialog.open(ForcePasswordChangeComponent);
  }

  private askForMfa(email: string) {
    this.router.navigate(['/auth/two-factor-auth'], { state: { email } });
  }

  private authorize() {
    // TODO naviage to dashboard
  }
}
