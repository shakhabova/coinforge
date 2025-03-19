import {
	Component,
	DestroyRef,
	effect,
	inject,
	model,
	OnInit,
	signal,
} from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialogModule,
	MatDialogRef,
} from '@angular/material/dialog';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';
import { TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import {
	AuthenticateResponse,
	LoginApiService,
} from 'services/login-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface MfaOtpModalData {
	email: string;
}

@Component({
	selector: 'app-mfa-otp-code',
	imports: [OtpCodeInputComponent, TuiIcon],
	templateUrl: './mfa-otp-code.component.html',
	styleUrl: './mfa-otp-code.component.css',
})
export class MfaOtpCodeComponent implements OnInit {
	private loginService = inject(LoginApiService);
	private destroyRef = inject(DestroyRef);
	private router = inject(Router);

	public readonly context =
		injectContext<
			TuiDialogContext<AuthenticateResponse | null, MfaOtpModalData>
		>();

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
		this.context.completeWith(null);
	}

	recover() {
		this.router.navigateByUrl('/auth/mfa-connect', {
			state: { email: this.context.data.email },
		});
	}

	private sendOtpCode() {
		this.loginService
			.sendMfaOtpCode(this.otpCode(), this.context.data.email)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (response) => this.context.completeWith(response),
				error: (err) => {
					if (err.code === 'invalid_otp') {
						this.errorMessage.set('Invalid verification code');
						return;
					}

					// TODO display other error
				},
			});
	}
}
