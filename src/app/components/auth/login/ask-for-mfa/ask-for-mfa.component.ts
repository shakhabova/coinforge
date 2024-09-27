import { Component, DestroyRef, inject, INJECTOR } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { EmailOtpCodeComponent } from 'components/auth/email-otp-code/email-otp-code.component';
import { MfaApiService } from 'services/mfa-api.service';

@Component({
  selector: 'app-ask-for-mfa',
  standalone: true,
  imports: [MatDialogModule, TuiIcon],
  templateUrl: './ask-for-mfa.component.html',
  styleUrl: './ask-for-mfa.component.css',
})
export class AskForMfaComponent {
  private mfaApiService = inject(MfaApiService);
  private destroyRef = inject(DestroyRef);
  private readonly tuiDialogs = inject(TuiDialogService);
  private readonly injector = inject(INJECTOR);
  private router = inject(Router);

  private email = this.router.getCurrentNavigation()?.extras.state?.['email'];

  enable() {
    this.mfaApiService
      .resetMfa(this.email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.showOTPModal();
      });
  }

  discard() {
    this.mfaApiService
      .rejectMfa(this.email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.goToDashboard());
  }

  private showOTPModal(): void {
    const otpDialog = this.tuiDialogs.open<unknown>(
      new PolymorpheusComponent(EmailOtpCodeComponent, this.injector),
      {
        data: { email: this.email, submitUrl: '/v1/auth/srp/reset-mfa/submit' },
      }
    );

    otpDialog.subscribe((result) => {
      if (!result) {
        return;
      }

      // TODO navigate to google auth page
    });
  }

  private goToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }
}
