import { Component, computed, inject, model, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiLabel } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';

@Component({
	selector: 'app-mfa-connect',
	imports: [FormsModule, TuiLabel, TuiCheckbox],
	templateUrl: './mfa-connect.component.html',
	styleUrl: './mfa-connect.component.css',
})
export class MfaConnectComponent implements OnInit {
	private router = inject(Router);

	protected mfaAdded = model(false);
	protected isMobileAppsPage = signal(true);
	protected displayBack = computed(() => !this.isMobileAppsPage());
	protected displayNext = computed(() => this.isMobileAppsPage());

	ngOnInit(): void {
		// if (!this.router.getCurrentNavigation()?.extras.state?.['mfaQR']) {
		//   this.goToLogin();
		// }
	}

	goNext() {
		this.isMobileAppsPage.set(false);
	}

	goBack() {
		this.isMobileAppsPage.set(true);
	}

	done() {
		// TODO check request
		this.goToLogin();
	}

	private goToLogin() {
		this.router.navigateByUrl('/auth/login');
	}
}
