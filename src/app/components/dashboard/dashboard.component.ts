import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TotalBalanceComponent } from './total-balance/total-balance.component';
import { WalletsComponent } from './wallets/wallets.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TotalBalanceComponent,
    WalletsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
