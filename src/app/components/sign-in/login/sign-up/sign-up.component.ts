import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordEqualsValidator } from '../../../../utils/validators';
import { CommonModule } from '@angular/common';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiDataList, TuiLabel, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { COUNTRY_CODES } from '../../../../utils/constants';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

type Gender = 'MALE' | 'FEMALE';

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
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.less'
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
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/)]],
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
