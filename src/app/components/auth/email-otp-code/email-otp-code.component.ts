import { Component, computed, DestroyRef, inject, model, OnInit, signal } from '@angular/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';
import { TuiDialogContext } from '@taiga-ui/core';
import { CreateUserResponse } from 'services/sign-up-api.service';
import { interval, map, Observable, share, startWith, take, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'services/config.service';
import { DialogService } from 'services/dialog.service';

export interface EmailOtpModalData {
  email: string;
  submitUrl: string;
}

@Component({
  selector: 'app-email-otp-code',
  standalone: true,
  imports: [
    OtpCodeInputComponent,
    AsyncPipe,
  ],
  templateUrl: './email-otp-code.component.html',
  styleUrl: './email-otp-code.component.css'
})
export class EmailOtpCodeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private httpClient = inject(HttpClient);
  private configService = inject(ConfigService);
  private dialogService = inject(DialogService);

  otpCode = model('');
  readonly codeLength = 8;

  message = signal('');
  errorMessage = signal('');
  codeExpired = signal(false);
  expiresTimer$!: Observable<string>;
  isConfirmDisabled = computed(() => this.otpCode().length < this.codeLength);

  private readonly context = injectContext<TuiDialogContext<unknown, EmailOtpModalData>>();
  private expiresSeconds = 60;

  get email(): string {
    return this.context.data?.email;
  }

  ngOnInit(): void {
    this.runTimer();
  }

  private runTimer(): void {
    this.message.set('');

    let currentSecond = this.expiresSeconds;
    this.expiresTimer$ = interval(1000)
      .pipe(
        map(() => `00:${currentSecond.toString().length === 1 ? `0${currentSecond}` : currentSecond}`),
        startWith(`00:${currentSecond}`),
        tap(() => currentSecond -= 1),
        take(this.expiresSeconds + 1),
        share()
      );

    this.expiresTimer$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        complete: () => {
          this.codeExpired.set(true);
          this.message.set('Code has expired. Please send a request for a new code.');
        },
      });
  }

  confirm() {
    this.httpClient.post(`${this.configService.serverUrl}${this.context.data?.submitUrl}`, { otp: this.otpCode(), email: this.email })
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: unknown) => this.context.completeWith(response),
        error: err => {
          if (err.code === 'invalid_confirmation_code') {
            this.errorMessage.set('Invalid OTP code');
            return;
          }

          this.displayErrorModal(err);
        }
      });
  }

  private displayErrorModal(err: unknown) {
    this.dialogService.showErrorMessage({
      title: 'Error',
      message: 'An unexpected error has appeared. Please try again later.',
      buttonText: 'Back to sign in'
    });

    this.context.completeWith(null);
  }
}
