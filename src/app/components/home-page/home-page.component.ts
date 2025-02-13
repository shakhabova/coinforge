import { Component } from '@angular/core';
import { MissionComponent } from './mission/mission.component';
import { ServicesCardComponent } from './services-card/services-card.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MissionComponent,
    ServicesCardComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
