import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TotalBalanceComponent } from './total-balance/total-balance.component';
import { WalletsComponent } from './wallets/wallets.component';
import { MarketInfoComponent } from './market-info/market-info.component';
import { TransactionsComponent } from './transactions/transactions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TotalBalanceComponent,
    WalletsComponent,
    MarketInfoComponent,
    TransactionsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
