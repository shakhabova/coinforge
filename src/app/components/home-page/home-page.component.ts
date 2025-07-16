import { Component } from '@angular/core';
import { MissionComponent } from './mission/mission.component';
import { ServicesCardComponent } from './services-card/services-card.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { RouterModule } from '@angular/router';
import { tuiDialog } from '@taiga-ui/core';
import { MfaOtpCodeComponent, MfaOtpModalData } from 'components/auth/shared/mfa-otp-code/mfa-otp-code.component';

@Component({
	selector: 'app-home-page',
	imports: [MissionComponent, ServicesCardComponent, ContactUsComponent, RouterModule],
	templateUrl: './home-page.component.html',
	styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
	private mfaOptDialog = tuiDialog(MfaOtpCodeComponent, { size: 'auto' });

	ngOnInit() {
		this.mfaOptDialog(null as unknown as MfaOtpModalData).subscribe();
	}
}
