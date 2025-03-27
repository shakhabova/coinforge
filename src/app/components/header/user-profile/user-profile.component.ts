import { Component, DestroyRef, inject, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { type TuiDialogContext, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';
import { TuiInputComponent, TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { AuthService } from 'services/auth.service';
import { DialogService } from 'services/dialog.service';
import { UserService } from 'services/user.service';

@Component({
	selector: 'app-user-profile',
	imports: [TuiInputModule, FormsModule, TuiTextfield, TuiTextfieldControllerModule, TuiSwitch, TuiIcon],
	templateUrl: './user-profile.component.html',
	styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
	private usersService = inject(UserService);
	private destroyRef = inject(DestroyRef);
	private router = inject(Router);
	public readonly context = injectContext<TuiDialogContext<void, void>>();
	private authService = inject(AuthService);
	private dialogService = inject(DialogService);
	name = model('');
	email = model('');
	phone = model('');
	googleAuth = model(true);

	ngOnInit() {
		this.usersService
			.currentUser$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((info) => {
				this.name.set(`${info.firstName} ${info.lastName}`);
				this.email.set(info.email);
				this.phone.set(info.phoneNumber);
				this.googleAuth.set(info.mfaStatus === 'ACTIVATED');
			});
	}

	googleAuthChanged() {
		this.context.completeWith();
		if (!this.googleAuth()) {
			this.dialogService
				.confirm({
					text: 'Are you sure you want to deactivate Google Authenticator?',
				})
				.subscribe(console.log);
		} else {
			this.router.navigateByUrl('/auth/two-factor-auth');
		}
	}
	logOut() {
		this.authService.logout();
	}
	changePassword() {
		//TODO change password modal
	}
}
