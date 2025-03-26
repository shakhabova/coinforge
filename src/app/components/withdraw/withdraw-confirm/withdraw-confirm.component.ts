import { Component, DestroyRef, inject } from '@angular/core';
import { TuiIcon, type TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { WithdrawService } from '../widthdraw.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-withdraw-confirm',
	imports: [TuiIcon],
	templateUrl: './withdraw-confirm.component.html',
	styleUrl: './withdraw-confirm.component.css',
})
export class WithdrawConfirmComponent {
	public withdrawService = inject(WithdrawService);
	private destroyRef = inject(DestroyRef);

	public context = injectContext<TuiDialogContext<boolean, void>>();

	ngOnInit() {
		this.context.$implicit.next(true);

		this.withdrawService.formGroup.valueChanges
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => this.context.$implicit.next(false));
	}
}
