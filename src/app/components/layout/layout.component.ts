import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from 'interceptors/auth-interceptor.service';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent
],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ]
})
export class LayoutComponent {

}
