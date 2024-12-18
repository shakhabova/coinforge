import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from 'components/dashboard/dashboard.component';
import { WalletsComponent } from 'components/dashboard/wallets/wallets.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    DashboardComponent,
    WalletsComponent,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
