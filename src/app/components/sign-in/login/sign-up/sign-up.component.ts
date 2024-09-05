import { Component, computed, inject, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordEqualsValidator } from '../../../../utils/validators';
import { CommonModule } from '@angular/common';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiDataList, TuiError, TuiIcon, TuiLabel, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { TUI_VALIDATION_ERRORS, TuiDataListWrapper, TuiFieldErrorPipe, TuiInputPassword } from '@taiga-ui/kit';
import { COUNTRY_CODES } from '../../../../utils/constants';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';

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
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.less',
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        email: 'Please enter a valid email, e.g., name@example.com'
      }
    }
  ]
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  formGroup = this.fb.group({
    firstName: ['', [Validators.minLength(2), Validators.maxLength(100), Validators.required]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(100), Validators.required]],
    gender: ['' as Gender, [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneCountryCode: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(13)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*?[A-ZА-Я])(?=.*?[a-zа-я])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/)]],
    repeatPassword: ['', [Validators.required, passwordEqualsValidator]],
    country: ['', Validators.required],
    city: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.minLength(10)]],
    address: ['', Validators.maxLength(255)],
  });

  genders: Gender[] = ['FEMALE', 'MALE'];
  genderLabels: Record<Gender, string> = {
    FEMALE: 'Female',
    MALE: 'Male',
  }

  countryCodes = COUNTRY_CODES;

  private passwordSignal = toSignal(this.formGroup.controls.password.valueChanges);
  passwordCriteriaPassed: Signal<PasswordCriteriaModel> = computed(() => {
    const password = this.passwordSignal();
    return {
      length: password ? password.length > 5 : false,
      uppercase: password ? password.split('').some(l => l === l.toUpperCase()) : false,
      lowercase: password ? password.split('').some(l => l === l.toLowerCase()) : false,
      number: new RegExp(/\d/).test(password ?? ''),
      char: new RegExp(/[#?!@$%^&*-]/).test(password ?? ''),
    }
  });
  passwordCriteriaIcons: Signal<{ [key in keyof PasswordCriteriaModel]: string }> = computed(() => {
    const criteria = this.passwordCriteriaPassed();
    const icons = ['@tui.check', '@tui.dot'];
    return {
      length: criteria.length ? icons[0]: icons[1],
      uppercase: criteria.uppercase ? icons[0]: icons[1],
      lowercase: criteria.lowercase ? icons[0]: icons[1],
      number: criteria.number ? icons[0]: icons[1],
      char: criteria.char ? icons[0]: icons[1],
    }
  });

  toGender(value: any): Gender {
    return value as Gender;
  }

  onSubmit() {
    this.formGroup.updateValueAndValidity();
    console.log(this.formGroup)
  }

  getCountryIconLink(code: string): string {
    return `https://s3-api.guavapay.com/public-icons/countries/1x1/zw.svg`;
  }
}
