import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthInterceptor } from 'interceptors/auth-interceptor.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ConfigService } from 'services/config.service';
import { filter } from 'rxjs';
import { HOME_PAGE_LINKS } from 'components/header/constants';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class LayoutComponent {
  private router = inject(Router);
  public configService = inject(ConfigService);

  public isHomePage = signal(true);
  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateIsHomePage();
      });

    this.updateIsHomePage();
  }

  private updateIsHomePage(): void {
    this.isHomePage.set(
      HOME_PAGE_LINKS.some((link) => this.router.url.endsWith(link.routerLink))
    );
  }
}
