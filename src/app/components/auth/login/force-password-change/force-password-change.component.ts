import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TuiError, TuiIcon, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputPassword } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { PasswordCriteriaComponent } from 'components/shared/password-criteria/password-criteria.component';
import { LoginApiService } from 'services/login-api.service';
import { passwordEqualsValidator } from 'utils/validators';

@Component({
  selector: 'app-force-password-change',
  standalone: true,
  imports: [
    TuiLabel,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiInputPassword,
    TuiTextfield,
    PasswordCriteriaComponent,
    TuiIcon
  ],
  templateUrl: './force-password-change.component.html',
  styleUrl: './force-password-change.component.css'
})
export class ForcePasswordChangeComponent {
  private fb = inject(NonNullableFormBuilder);
  private loginApiService = inject(LoginApiService);
  private router = inject(Router);

  private email = this.router.getCurrentNavigation()?.extras?.state?.['email'];

  protected formGroup = this.fb.group({
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
  });

  save() {
    this.loginApiService.forceChangePassword(this.email!, this.formGroup.getRawValue().repeatPassword)
      .subscribe(response => {
        this.router.navigateByUrl('/auth/mfa-connect', { state: { mfaQR: response.data, email: this.email }});
      })
  }
}
