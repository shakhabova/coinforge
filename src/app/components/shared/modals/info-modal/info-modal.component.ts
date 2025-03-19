import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface InfoModalConfig {
	type: 'success' | 'warning' | 'pending' | 'error';
	title: string;
	text?: string;
	buttonText?: string;
}

@Component({
	selector: 'app-info-modal',
	imports: [],
	templateUrl: './info-modal.component.html',
	styleUrl: './info-modal.component.css',
})
export class InfoModalComponent {
	public readonly context =
		injectContext<TuiDialogContext<void, InfoModalConfig>>();
}
