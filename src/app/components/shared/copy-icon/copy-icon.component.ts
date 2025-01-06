import { Component, input, signal } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-copy-icon',
  standalone: true,
  imports: [
    TuiIcon,
  ],
  templateUrl: './copy-icon.component.html',
  styleUrl: './copy-icon.component.css'
})
export class CopyIconComponent {
  text = input<string>();
  width = input(20);
  height = input(20);
  displaySuccess = signal(false);

  async copy() {
    if (this.text()) {
      await navigator.clipboard.writeText(this.text()!);

      this.displaySuccess.set(true);
      setTimeout(() => this.displaySuccess.set(false), 2000);
    }
  }
}
