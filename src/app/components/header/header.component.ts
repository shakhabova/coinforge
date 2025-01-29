import { Component, inject, Injector, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { tuiDialog, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { DashboardComponent } from 'components/dashboard/dashboard.component';
import { WalletsComponent } from 'components/dashboard/wallets/wallets.component';
import { ConfigService } from 'services/config.service';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

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
  private dialogService = inject(TuiDialogService);
  private injector = inject(Injector);
  private dialog = tuiDialog(UserProfileComponent, {size: 'auto'});

  isMobileMenuOpened = signal(false);
  
  

  mobileMenuToggle() {
    this.isMobileMenuOpened.update(opened => !opened);
  }

  openUserProfile(){
       this.dialog().subscribe();
  }
}
