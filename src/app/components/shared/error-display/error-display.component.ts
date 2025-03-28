import { CommonModule } from '@angular/common';
import { Component, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-error-display',
  imports: [CommonModule],
  templateUrl: './error-display.component.html',
  styleUrl: './error-display.component.css'
})
export class ErrorDisplayComponent {
  text = input<string>();
  action = input<TemplateRef<unknown>>();
}
