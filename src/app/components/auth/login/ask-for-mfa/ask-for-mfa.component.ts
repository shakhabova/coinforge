import {
  Component,
  DestroyRef,
  INJECTOR,
  type OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { EmailOtpCodeComponent } from 'components/auth/shared/email-otp-code/email-otp-code.component';
import { finalize } from 'rxjs';
import { DialogService } from 'services/dialog.service';
import { MfaApiService } from 'services/mfa-api.service';
import { UserService } from 'services/user.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';

@Component({
  selector: 'app-ask-for-mfa',
  imports: [LoaderComponent],
  templateUrl: './ask-for-mfa.component.html',
  styleUrl: './ask-for-mfa.component.css',
})
export class AskForMfaComponent implements OnInit {
  private mfaApiService = inject(MfaApiService);
  private destroyRef = inject(DestroyRef);
  private readonly tuiDialogs = inject(TuiDialogService);
  private readonly injector = inject(INJECTOR);
  private router = inject(Router);
  private userService = inject(UserService);
  private dialogService = inject(DialogService);

  protected readonly loading = signal(false);
  private email?: string =
    this.router.getCurrentNavigation()?.extras.state?.['email'];
  private mfaQR?: string =
    this.router.getCurrentNavigation()?.extras.state?.['mfaQR'];
  private userId?: number;

  ngOnInit(): void {
    if (!this.email) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.loading.set(true);
    this.userService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (info) => {
          this.userId = info.id;
        },
        error: (err) => {
          this.dialogService.showInfo({
            type: 'error',
            title: 'Error',
            text: 'Unexpected error occured, please try again later',
          });
          console.error(err);
        },
      });
  }

  enable() {
    if (this.mfaQR) {
      this.goToMfaConnect(this.mfaQR);
      return;
    }

    if (this.email) {
      this.mfaApiService
        .resetMfa(this.email)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.showOTPModal();
        });
    }
  }

  // discard() {
  //   if (this.email && this.userId) {
  //     this.mfaApiService
  //       .rejectMfa(this.email, this.userId)
  //       .pipe(takeUntilDestroyed(this.destroyRef))
  //       .subscribe(() => this.goToDashboard());
  //   }
  // }

  private showOTPModal(): void {
    const otpDialog = this.tuiDialogs.open<{ data: string }>(
      new PolymorpheusComponent(EmailOtpCodeComponent, this.injector),
      {
        data: {
          email: this.email,
          submitUrl: '/v1/auth/srp/reset-mfa/submit',
          codeLength: 8,
          userId: this.userId,
        },
      },
    );

    otpDialog.subscribe((result) => {
      if (!result) {
        return;
      }

      this.goToMfaConnect(result.data);
    });
  }

  private goToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  private goToMfaConnect(mfaQR: string) {
    this.router.navigateByUrl('/auth/mfa-connect', { state: { mfaQR } });
  }
}
