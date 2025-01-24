import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { DashboardComponent } from 'components/dashboard/dashboard.component';
import { WalletsComponent } from 'components/dashboard/wallets/wallets.component';
import { ConfigService } from 'services/config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    TuiIcon
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public configService = inject(ConfigService);

  isMobileMenuOpened = signal(false);

  mobileMenuToggle() {
    this.isMobileMenuOpened.update(opened => !opened);
  }
}
