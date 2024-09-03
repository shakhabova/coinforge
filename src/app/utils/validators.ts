import { AbstractControl, ValidationErrors } from "@angular/forms";

const PASSWORDS_NOT_EQUAL = 'passwordsNotEqual';

export function passwordEqualsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const password = control?.parent?.get('password')?.value;
  return value !== password ? { [PASSWORDS_NOT_EQUAL]: 'Passwords do not match' } : null;
}