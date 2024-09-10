import { Component, effect, inject, model } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import {POLYMORPHEUS_CONTEXT} from '@taiga-ui/polymorpheus';
import { CreateUserResponse } from '../../../services/sign-up-api.service';
import { FormsModule } from '@angular/forms';
import { OtpCodeInputComponent } from '../otp-code-input/otp-code-input.component';


@Component({
  selector: 'app-opt-code',
  standalone: true,
  imports: [
    OtpCodeInputComponent,
  ],
  templateUrl: './opt-code.component.html',
  styleUrl: './opt-code.component.css'
})
export class OptCodeComponent {
  private readonly context = inject<TuiDialogContext<void, CreateUserResponse>>(POLYMORPHEUS_CONTEXT);

  otpCode = model('');

  constructor() {
    effect(() => {
      console.log(this.otpCode());
    })
  }

  onClose() {
    this.context.completeWith();
  }

}
