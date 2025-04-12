import { CommonModule } from '@angular/common';
import { Component, DestroyRef, INJECTOR, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiDataList, TuiDialogService, TuiError, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import {
	TUI_VALIDATION_ERRORS,
	TuiDataListWrapper,
	TuiFieldErrorPipe,
	TuiFilterByInputPipe,
	TuiInputPassword,
	TuiInputPhoneInternational,
	TuiSortCountriesPipe,
	TuiStringifyContentPipe,
	tuiInputPhoneInternationalOptionsProvider,
} from '@taiga-ui/kit';
import {
	TuiComboBoxModule,
	TuiInputModule,
	TuiSelectModule,
	TuiTextareaModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { PasswordCriteriaComponent } from 'components/shared/password-criteria/password-criteria.component';
import { getCountries } from 'libphonenumber-js';
import { defer, take } from 'rxjs';
import { DialogService } from 'services/dialog.service';
import { type CreateUserResponse, type Gender, SignUpApiService } from 'services/sign-up-api.service';
import { COUNTRIES } from 'utils/countries';
import {
	confirmPasswordValidator,
	firstNameValidator,
	getPasswordValidator,
	lastNameValidator,
} from 'utils/validators';
import { EmailOtpCodeComponent } from '../shared/email-otp-code/email-otp-code.component';

@Component({
	selector: 'app-sign-up',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TuiTextfieldControllerModule,
		TuiInputModule,
		TuiTextfield,
		TuiLabel,
		TuiSelectModule,
		TuiDataListWrapper,
		TuiDataList,
		TuiError,
		TuiFieldErrorPipe,
		TuiInputPassword,
		TuiComboBoxModule,
		TuiFilterByInputPipe,
		TuiTextareaModule,
		TuiInputPhoneInternational,
		TuiSortCountriesPipe,
		FormsModule,
		TuiStringifyContentPipe,
		PasswordCriteriaComponent,
	],
	templateUrl: './sign-up.component.html',
	styleUrl: './sign-up.component.less',
	providers: [
		tuiInputPhoneInternationalOptionsProvider({
			metadata: defer(async () => import('libphonenumber-js/max/metadata').then((m) => m.default)),
		}),
		{
			provide: TUI_VALIDATION_ERRORS,
			useValue: {
				email: 'Please enter a valid email, e.g., name@example.com',
				required: 'Value is required',
			},
		},
	],
})
export class SignUpComponent {
	private fb = inject(NonNullableFormBuilder);
	private signUpApiService = inject(SignUpApiService);
	private destroyRef = inject(DestroyRef);
	private dialogService = inject(DialogService);
	private readonly dialogs = inject(TuiDialogService);
	private readonly injector = inject(INJECTOR);
	private readonly router = inject(Router);

	formGroup = this.fb.group(
		{
			firstName: ['', [firstNameValidator(2, 100), Validators.required]],
			lastName: ['', [lastNameValidator(2, 100), Validators.required]],
			gender: ['FEMALE' as Gender, [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			phoneNumber: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15)]],
			password: ['', [Validators.required, Validators.minLength(6), getPasswordValidator()]],
			repeatPassword: ['', [Validators.required, getPasswordValidator()]],
			country: ['', Validators.required],
			city: ['', Validators.required],
			zipCode: ['', [Validators.required, Validators.maxLength(10)]],
			address: ['', Validators.maxLength(255)],
		},
		{ validators: [confirmPasswordValidator] },
	);

	genders: Gender[] = ['FEMALE', 'MALE'];
	genderLabels: Record<Gender, string> = {
		FEMALE: 'Female',
		MALE: 'Male',
	};

	protected readonly phoneCountries = getCountries();

	countries = COUNTRIES.map((country) => country.countryCodeAlpha3);

	private userWasCreated = false;
	private userCreationResponse?: CreateUserResponse;

	toGender(value: unknown): Gender {
		return value as Gender;
	}

	ngOnInit() {
		this.formGroup.statusChanges.subscribe(() => console.log(this.formGroup.get('password')?.errors));
	}

	onSubmit() {
		if (this.userWasCreated && this.userCreationResponse) {
			this.signUpApiService.resendOTP(this.userCreationResponse.email);
			this.showOTPModal(this.userCreationResponse);
			return;
		}

		this.formGroup.updateValueAndValidity();
		if (!this.formGroup.valid) {
			return;
		}

		const formValue = this.formGroup.getRawValue();
		this.signUpApiService
			.createUser({
				...formValue,
				address: formValue.address || undefined,
			})
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (user) => {
					if (user?.status !== 'EMAIL_NOT_CONFIRMED') {
						throw user;
					}

					this.showOTPModal(user);

					this.userWasCreated = true;
					this.userCreationResponse = user;
					this.formGroup.valueChanges.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
						this.userWasCreated = false;
						this.userCreationResponse = undefined;
					});
				},
				error: (err) => {
					switch (err.error.status) {
						case 'user_already_exists':
							this.dialogService.showInfo({
								type: 'error',
								text: 'Email already exists. Please log in with your existing account or use a different email to sign up',
								title: 'Error',
								buttonText: 'Back to sign up',
							});
							break;
						default:
							this.dialogService.showInfo({
								type: 'error',
								text: 'An unexpected error has appeared. Please try again later',
								title: 'Error',
								buttonText: 'Back to sign up',
							});
					}
				},
			});
	}

	protected readonly stringify = (code: string): string =>
		!code ? '' : (COUNTRIES.find((country) => country.countryCodeAlpha3 === code)?.name ?? '');

	private showOTPModal(user: CreateUserResponse | null): void {
		if (!user?.email || !user?.id) {
			return;
		}

		const requestGetter = (otp: string) =>
			this.signUpApiService.validateOTP({
				email: user.email,
				id: user.id,
				otp,
			});

		const otpDialog = this.dialogs.open<unknown>(new PolymorpheusComponent(EmailOtpCodeComponent, this.injector), {
			data: {
				email: user?.email,
				requestGetter,
				errorButtonText: 'Back to sign up',
			},
		});

		otpDialog.subscribe((value) => {
			if (value) {
				this.dialogService
					.showInfo({
						type: 'success',
						text: `Your account has been created successfully. Let's get started`,
						title: 'Congratulations',
						buttonText: 'Get started',
					})
					.subscribe(() => this.router.navigateByUrl('/auth/login'));
			}
		});
	}
}
