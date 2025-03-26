import { Injectable } from '@angular/core';
import { type AbstractControl, FormBuilder, type ValidatorFn, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class WithdrawService {
	public formGroup = new FormBuilder().nonNullable.group({
		address: ['', [Validators.required, addressPatternValidator(/^[A-Za-z0-9]+$/), Validators.minLength(20)]],
		amount: ['', [Validators.required, amountMinValidator, amountPatternValidator]],
		cryptocurrency: [''],
	});
}

function addressPatternValidator(regex: RegExp): ValidatorFn {
	return (field: AbstractControl): Validators | null => {
		return field.value && regex.test(field.value)
			? null
			: {
					other: 'Only digits and letters are allowed',
				};
	};
}

function amountMinValidator(field: AbstractControl): Validators | null {
	return field.value && Number.parseFloat(field.value) > 0
		? null
		: {
				other: 'Only valid numbers greater than 0 are allowed',
			};
}

function amountPatternValidator(field: AbstractControl): Validators | null {
	return field.value && /^[0-9]+$|^[0-9]+\.{0,1}[0-9]+$/.test(field.value)
		? null
		: {
				other: 'Only valid numbers greater than 0 are allowed',
			};
}
