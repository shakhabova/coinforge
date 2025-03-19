import { Component } from '@angular/core';
import { MissionComponent } from './mission/mission.component';
import { ServicesCardComponent } from './services-card/services-card.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

@Component({
	selector: 'app-home-page',
	imports: [MissionComponent, ServicesCardComponent, ContactUsComponent],
	templateUrl: './home-page.component.html',
	styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
