import { Component } from '@angular/core';
import { MissionComponent } from './mission/mission.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MissionComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
