import { Component, computed, DestroyRef, inject, model, OnInit, signal } from '@angular/core';
import {injectContext} from '@taiga-ui/polymorpheus';
import { OtpCodeInputComponent } from '../../otp-code-input/otp-code-input.component';
import { TuiDialogContext } from '@taiga-ui/core';
import { CreateUserResponse } from 'services/sign-up-api.service';
import { interval, map, Observable, share, startWith, take, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  otpCode = model('');
  readonly codeLength = 8;

  message = signal('');
  errorMessage = signal('');
  codeExpired = signal(false);
  expiresTimer$!: Observable<string>;
  isConfirmDisabled = computed(() => this.otpCode().length < this.codeLength);

  private readonly context = injectContext<TuiDialogContext<boolean, CreateUserResponse>>();
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
}
