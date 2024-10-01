import { Component, DestroyRef, effect, inject, model, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';
import { TuiIcon } from '@taiga-ui/core';
import { LoginApiService } from 'services/login-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mfa-otp-code',
  standalone: true,
  imports: [
    MatDialogModule,
    OtpCodeInputComponent,
    TuiIcon,
  ],
  templateUrl: './mfa-otp-code.component.html',
  styleUrl: './mfa-otp-code.component.css'
})
export class MfaOtpCodeComponent implements OnInit {
  private dialogRef = inject(MatDialogRef);
  private loginService = inject(LoginApiService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private email = inject(MAT_DIALOG_DATA).email;

  protected otpCode = model('');
  protected errorMessage = signal('');

  ngOnInit(): void {
    effect(() => {
      if (this.otpCode().length === 6) {
        this.sendOtpCode();
      } else {
        this.errorMessage.set('');
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  recover() {
    this.router.navigateByUrl('/auth/mfa-connect', { state: { email: this.email }});
  }

  private sendOtpCode() {
    this.loginService.sendMfaOtpCode(this.otpCode(), this.email)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: response => this.dialogRef.close(response),
        error: err => {
          if (err.code === 'invalid_otp') {
            this.errorMessage.set('Invalid verification code');
            return;
          }

          // TODO display other error
        }
      })
  }
}
