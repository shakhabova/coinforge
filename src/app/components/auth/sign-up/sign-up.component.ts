import { Component, DestroyRef, inject, INJECTOR, OnInit } from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  firstNameValidator,
  lastNameValidator,
  passwordEqualsValidator,
} from 'utils/validators';
import { CommonModule } from '@angular/common';
import {
  TuiComboBoxModule,
  TuiInputModule,
  TuiSelectModule,
  TuiTextareaModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import {
  TuiDataList,
  TuiDialogService,
  TuiError,
  TuiLabel,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TUI_VALIDATION_ERRORS,
  TuiDataListWrapper,
  TuiFieldErrorPipe,
  TuiFilterByInputPipe,
  TuiInputPassword,
  TuiInputPhoneInternational,
  tuiInputPhoneInternationalOptionsProvider,
  TuiSortCountriesPipe,
  TuiStringifyContentPipe,
} from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { getCountries } from 'libphonenumber-js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, switchMap, take } from 'rxjs';
import {
  CreateUserRequest,
  CreateUserResponse,
  Gender,
  SignUpApiService,
} from 'services/sign-up-api.service';
import { DialogService } from 'services/dialog.service';
import { EmailOtpCodeComponent } from '../email-otp-code/email-otp-code.component';
import { COUNTRIES } from 'utils/countries';
import { PasswordCriteriaComponent } from 'components/shared/password-criteria/password-criteria.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
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
      metadata: defer(async () =>
        import('libphonenumber-js/max/metadata').then((m) => m.default)
      ),
    }),
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        email: 'Please enter a valid email, e.g., name@example.com',
        required: 'Value is required',
        minlength: (val: unknown) => {
          console.log(val);
          return 'hehe';
        },
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

  formGroup = this.fb.group({
    firstName: ['', [firstNameValidator(2, 100), Validators.required]],
    lastName: ['', [lastNameValidator(2, 100), Validators.required]],
    gender: ['FEMALE' as Gender, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [
      '',
      [Validators.required, Validators.minLength(7), Validators.maxLength(15)],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(
          /^(?=.*?[A-ZА-Я])(?=.*?[a-zа-я])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
        ),
      ],
    ],
    repeatPassword: ['', [Validators.required, passwordEqualsValidator]],
    country: ['', Validators.required],
    city: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.maxLength(10)]],
    address: ['', Validators.maxLength(255)],
  });

  genders: Gender[] = ['FEMALE', 'MALE'];
  genderLabels: Record<Gender, string> = {
    FEMALE: 'Female',
    MALE: 'Male',
  };

  protected readonly phoneCountries = getCountries();

  countries = COUNTRIES.map((country) => country.countryCodeAlpha3);

  private userWasCreated = false;
  private userCreationResponse?: CreateUserResponse;

  toGender(value: any): Gender {
    return value as Gender;
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
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (user) => {
          if (user?.status !== 'EMAIL_NOT_CONFIRMED') {
            throw user;
          }

          this.showOTPModal(user);

          this.userWasCreated = true;
          this.userCreationResponse = user;
          this.formGroup.valueChanges
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
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
                buttonText: 'Back to sign up'
              });
              break;
            default:
              this.dialogService.showInfo({
                type: 'error',
                text: 'An unexpected error has appeared. Please try again later',
                title: 'Error',
                buttonText: 'Back to sign up'
              });
          }
        },
      });
  }

  protected readonly stringify = (code: string): string =>
    !code
      ? ''
      : COUNTRIES.find((country) => country.countryCodeAlpha3 === code)!.name;

  private showOTPModal(user: CreateUserResponse | null): void {
    const otpDialog = this.dialogs.open<unknown>(
      new PolymorpheusComponent(EmailOtpCodeComponent, this.injector),
      {
        data: {
          email: user?.email,
          submitUrl: '/v1/users/registration/otp/validate',
          id: user?.id,
        },
      }
    );

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
