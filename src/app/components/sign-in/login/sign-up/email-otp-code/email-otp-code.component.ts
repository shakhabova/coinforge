import { Component, model } from '@angular/core';
import { OtpCodeInputComponent } from '../../../otp-code-input/otp-code-input.component';

@Component({
  selector: 'app-email-otp-code',
  standalone: true,
  imports: [
    OtpCodeInputComponent,
  ],
  templateUrl: './email-otp-code.component.html',
  styleUrl: './email-otp-code.component.css'
})
export class EmailOtpCodeComponent {
  otpCode = model('');
}
