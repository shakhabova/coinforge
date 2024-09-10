import { Component, model, effect, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-code-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './otp-code-input.component.html',
  styleUrl: './otp-code-input.component.css'
})
export class OtpCodeInputComponent {
  otpCode = model('');
  length = input(6);

  otpCodeArray = new Array(this.length()).fill(null);

  constructor() {
    effect(() => {
      this.otpCodeArray = this.otpCodeArray.map((_, i) => this.otpCode()[i]);
    });

    effect(() => {
      this.otpCodeArray = new Array(this.length()).fill(null);
    });
  }

  
  onFieldInput(index: number): void {
    const currentInput = document.querySelector<HTMLInputElement>(`#otp-code-input-${index}`);
    if (!currentInput?.value) {
      return;
    }

    const nextInput = document.querySelector<HTMLInputElement>(`#otp-code-input-${++index}`);
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  }

  onInputPaste(event: ClipboardEvent): void {
    const value = event.clipboardData?.getData('text/plain');
    if (!value) {
      return;
    }

    this.otpCodeArray = this.otpCodeArray.map((_, i) => value[i]);
  }

  onCodeChange(): void {
    this.otpCode.set(this.otpCodeArray.join(''));
  }

  toClipboardEvent(event: Event): ClipboardEvent {
    return event as ClipboardEvent;
  }
}
