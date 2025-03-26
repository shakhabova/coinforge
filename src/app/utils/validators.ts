import type { AbstractControl, ValidationErrors } from '@angular/forms';

const PASSWORDS_NOT_EQUAL = 'passwordsNotEqual';

export function passwordEqualsValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value;
	const password = control?.parent?.get('password')?.value;
	return value !== password ? { [PASSWORDS_NOT_EQUAL]: 'Passwords do not match' } : null;
}

export function firstNameValidator(
	minLength: number,
	maxLength: number,
): (control: AbstractControl) => ValidationErrors | null {
	return (control) => {
		if (!control?.value) {
			return null;
		}

		return control?.value?.length < minLength || control?.value?.length > maxLength
			? { firstName: 'Please enter a valid first name' }
			: null;
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

		return control?.value?.length < minLength || control?.value?.length > maxLength
			? { lastName: 'Please enter a valid last name' }
			: null;
	};
}
