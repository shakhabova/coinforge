import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

export const PASSWORDS_NOT_EQUAL = 'passwordsNotEqual';
const NAME_REGEX = /^(?=.{1,15}$)[\p{L}]+(?:['\-][\p{L}]+)*$/u;

export function firstNameValidator(
	minLength: number,
	maxLength: number,
): (control: AbstractControl) => ValidationErrors | null {
	return (control) => {
		if (!control?.value) {
			return null;
		}

		return new RegExp(NAME_REGEX).test(control?.value)
		? null
		: { firstName: 'Please enter a valid first name' };
	};
}

export function lastNameValidator(
	minLength: number,
	maxLength: number,
): (control: AbstractControl) => ValidationErrors | null {
	return (control) => {
		if (!control?.value) {
			return null;
		}

		return new RegExp(NAME_REGEX).test(control?.value)
		? null
		: { lastName: 'Please enter a valid last name' };
	};
}

export function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
	return control.value.password === control.value.repeatPassword
		? null
		: { [PASSWORDS_NOT_EQUAL]: 'Passwords do not match' };
}

export function getPasswordValidator() {
	return RxwebValidators.password({
		validation: { minLength: 6, digit: true, specialCharacter: true, upperCase: true, lowerCase: true },
		message: {
			minLength: 'minLength',
			digit: 'digit',
			specialCharacter: 'specialCharacter',
			upperCase: 'upperCase',
			lowerCase: 'lowerCase',
		},
	});
}
