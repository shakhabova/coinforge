import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { OptCodeComponent } from '../opt-code/opt-code.component';
import { LoginApiService } from 'services/login-api.service';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiError, TuiLabel } from '@taiga-ui/core';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiFieldErrorPipe, TuiInputPassword } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';

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
    TuiInputPassword
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private dialog = inject(MatDialog);
  private loginService = inject(LoginApiService);
  private fb = inject(NonNullableFormBuilder);

  protected formGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    this.loginService.login(this.formGroup.getRawValue())
      .subscribe({
        next: response => {
          if (response.userStatus === 'FORCE_PASSWORD_CHANGE') {
            this.forceChangePass();
            return;
          }

          switch(response.mfaStatus) {
            case 'PENDING':
              // TODO ask if user wants to activate google auth
              break;
            case 'ACTIVATED':
              // TODO display google otp code input
              break;
            case 'REJECTED':
              this.authorize();
              break;
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
  }

  private authorize() {
    
  }
}
