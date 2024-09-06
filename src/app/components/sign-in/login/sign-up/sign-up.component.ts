import { Component, computed, inject, Signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstNameValidator, lastNameValidator, passwordEqualsValidator } from '../../../../utils/validators';
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
  TuiError,
  TuiIcon,
  TuiLabel,
  TuiScrollable,
  TuiScrollbar,
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
} from '@taiga-ui/kit';
import type {TuiCountryIsoCode} from '@taiga-ui/i18n';
import {getCountries} from 'libphonenumber-js';
import { COUNTRY_CODES } from '../../../../utils/constants';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';
import { TuiLet } from '@taiga-ui/cdk';
import { defer } from 'rxjs';

type Gender = 'MALE' | 'FEMALE';

interface PasswordCriteriaModel {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  char: boolean;
}

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
    CdkVirtualScrollViewport,
    TuiScrollable,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    TuiScrollbar,
    TuiError,
    TuiFieldErrorPipe,
    TuiInputPassword,
    TuiIcon,
    TuiComboBoxModule,
    TuiLet,
    TuiFilterByInputPipe,
    TuiTextareaModule,
    TuiInputPhoneInternational,
    TuiSortCountriesPipe,
    FormsModule,
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
          return 'hehe'
        }
      },
    },
  ],
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  formGroup = this.fb.group({
    firstName: [
      '',
      [firstNameValidator(2, 100), Validators.required],
    ],
    lastName: [
      '',
      [lastNameValidator(2, 100), Validators.required],
    ],
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

  private passwordSignal = toSignal(
    this.formGroup.controls.password.valueChanges
  );
  passwordCriteriaPassed: Signal<PasswordCriteriaModel> = computed(() => {
    const password = this.passwordSignal();
    return {
      length: password ? password.length > 5 : false,
      uppercase: password
        ? password.split('').some((l) => l === l.toUpperCase())
        : false,
      lowercase: password
        ? password.split('').some((l) => l === l.toLowerCase())
        : false,
      number: new RegExp(/\d/).test(password ?? ''),
      char: new RegExp(/[#?!@$%^&*-]/).test(password ?? ''),
    };
  });
  passwordCriteriaIcons: Signal<{
    [key in keyof PasswordCriteriaModel]: string;
  }> = computed(() => {
    const criteria = this.passwordCriteriaPassed();
    const icons = ['@tui.check', '@tui.dot'];
    return {
      length: criteria.length ? icons[0] : icons[1],
      uppercase: criteria.uppercase ? icons[0] : icons[1],
      lowercase: criteria.lowercase ? icons[0] : icons[1],
      number: criteria.number ? icons[0] : icons[1],
      char: criteria.char ? icons[0] : icons[1],
    };
  });

  countries = COUNTRY_CODES.map(({ name }) => name);

  toGender(value: any): Gender {
    return value as Gender;
  }

  onSubmit() {
    this.formGroup.updateValueAndValidity();
    console.log(this.formGroup);
  }

  getCountryIconLink(code: string): string {
    return `https://s3-api.guavapay.com/public-icons/countries/1x1/zw.svg`;
  }
}
