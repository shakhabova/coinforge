import {
	assertInInjectionContext,
	Component,
	computed,
	DestroyRef,
	inject,
	model,
	type OnInit,
	signal,
} from '@angular/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';
import type { TuiDialogContext } from '@taiga-ui/core';
import { CreateUserResponse, SignUpApiService } from 'services/sign-up-api.service';
import { finalize, interval, map, type Observable, share, startWith, type Subscription, take, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'services/config.service';
import { DialogService } from 'services/dialog.service';
import { explicitEffect } from 'ngxtension/explicit-effect';

export interface EmailOtpModalData {
	email: string;
	submitUrl: string;
	id: number;
}

@Component({
	selector: 'app-email-otp-code',
	imports: [OtpCodeInputComponent, AsyncPipe],
	templateUrl: './email-otp-code.component.html',
	styleUrl: './email-otp-code.component.css',
})
export class EmailOtpCodeComponent implements OnInit {
	private destroyRef = inject(DestroyRef);
	private httpClient = inject(HttpClient);
	private configService = inject(ConfigService);
	private dialogService = inject(DialogService);
	private signUpApiService = inject(SignUpApiService);

	otpCode = model('');
	readonly codeLength = 6;

	loading = signal(false);
	message = signal('');
	errorMessage = signal('');
	codeExpired = signal(false);
	expiresTimer$!: Observable<string>;
	expiresTimerSub?: Subscription;
	isConfirmDisabled = computed(() => this.otpCode().length < this.codeLength || this.loading());

	private readonly context = injectContext<TuiDialogContext<unknown, EmailOtpModalData>>();
	private expiresSeconds = 90;

	get email(): string {
		return this.context.data?.email;
	}

	constructor() {
		explicitEffect([this.otpCode], () => {
			this.errorMessage.set('');
		});
	}

	ngOnInit(): void {
		this.runTimer();
	}

	private runTimer(): void {
		if (this.expiresTimerSub) {
			this.expiresTimerSub.unsubscribe();
		}

		this.message.set('');

		let currentSecond = this.expiresSeconds;
		this.expiresTimer$ = interval(1000).pipe(
			map(() => `00:${currentSecond.toString().length === 1 ? `0${currentSecond}` : currentSecond}`),
			startWith(`00:${currentSecond}`),
			tap(() => (currentSecond -= 1)),
			take(this.expiresSeconds + 1),
			share(),
		);

		this.expiresTimerSub = this.expiresTimer$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			complete: () => {
				this.codeExpired.set(true);
				this.message.set('Code has expired. Please send a request for a new code.');
			},
		});
	}

	confirm() {
		this.loading.set(true);
		this.httpClient
			.post(`${this.configService.serverUrl}${this.context.data?.submitUrl}`, {
				otp: this.otpCode(),
				email: this.email,
				id: this.context.data.id,
			})
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.loading.set(false)),
			)
			.subscribe({
				next: () => this.context.completeWith(true),
				error: (err) => {
					if (err.code === 'invalid_confirmation_code') {
						this.errorMessage.set('Invalid OTP code');
						return;
					}

					if (err.code === 'OTP_EXPIRED') {
						this.codeExpired.set(true);
						this.errorMessage.set('OTP has expired');
						return;
					}

					this.displayErrorModal(err);
				},
			});
	}

	resendCode() {
		this.loading.set(true);
		this.otpCode.set('');
		this.signUpApiService
			.resendOTP(this.email)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				finalize(() => this.loading.set(false)),
			)
			.subscribe(() => {
				this.codeExpired.set(false);
				this.runTimer();
			});
	}

	private displayErrorModal(err: unknown) {
		this.dialogService
			.showInfo({
				type: 'warning',
				title: 'Error',
				text: 'An unexpected error has appeared. Please try again later.',
				buttonText: 'Back to sign up',
			})
			.subscribe(() => this.context.completeWith(null));
	}
}
