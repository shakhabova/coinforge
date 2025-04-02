import { Component, inject, linkedSignal, model, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiInputPassword } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { PasswordCriteriaComponent } from 'components/shared/password-criteria/password-criteria.component';
import { LoginApiService } from 'services/login-api.service';
import { passwordEqualsValidator } from 'utils/validators';
import { OtpCodeInputComponent } from '../../shared/otp-code-input/otp-code-input.component';

@Component({
  selector: 'app-forget-password',
  imports: [
    TuiLabel,
    TuiInputModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiInputPassword,
    TuiTextfield,
    PasswordCriteriaComponent,
    OtpCodeInputComponent,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private loginApiService = inject(LoginApiService);

  public otpCode = model<string>('');
  public readonly codeLength = 8;
  public errorMessage = signal<string | null>(null);
  public loading = signal(false);
  public isSaveDisabled = linkedSignal(
    () => this.otpCode().length !== this.codeLength && this.formGroup.invalid,
  );

  public email = this.router.getCurrentNavigation()?.extras?.state?.['email'];

  protected formGroup = this.fb.group({
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(
          /^(?=.*?[A-ZА-Я])(?=.*?[a-zа-я])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/,
        ),
      ],
    ],
    repeatPassword: ['', [Validators.required, passwordEqualsValidator]],
  });
}
