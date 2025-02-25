import { Component, computed, inject, Injector, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { tuiDialog, TuiDialogService, TuiIcon } from '@taiga-ui/core';
import { ConfigService } from 'services/config.service';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { filter } from 'rxjs';
import { AuthService } from 'services/auth.service';

interface HeaderLink {
  routerLink: string;
  icon?: string;
  label: string;
}

const dashboardLinks: HeaderLink[] = [
  {
    label: 'Dashboard',
    routerLink: '/dashboard',
    icon: '/assets/icons/Dashboard.svg',
  },
  {
    label: 'Wallets',
    routerLink: '/wallets',
    icon: '/assets/icons/Wallet.svg',
  },
  {
    label: 'Transactions',
    routerLink: '/transactions',
    icon: '/assets/icons/Transactions.svg',
  },
];

const homePageLinks: HeaderLink[] = [
  {
    label: 'Home',
    routerLink: '/home-page',
  },
  {
    label: 'Contact',
    routerLink: '/contact-page',
  },
  {
    label: 'About us',
    routerLink: '/about-us',
  },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, TuiIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public configService = inject(ConfigService);
  private router = inject(Router);
  private dialog = tuiDialog(UserProfileComponent, { size: 'auto' });
  public authService = inject(AuthService);

  public isHomePage = signal(true);
  public activeLinks = computed(() =>
    this.isHomePage() ? homePageLinks : dashboardLinks
  );

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isHomePage.set(
          homePageLinks.some((link) =>
            this.router.url.endsWith(link.routerLink)
          )
        );
      });
  }

  isMobileMenuOpened = signal(false);

  mobileMenuToggle() {
    this.isMobileMenuOpened.update((opened) => !opened);
  }

  openUserProfile() {
    this.dialog().subscribe();
  }
}
