import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthInterceptor } from 'interceptors/auth-interceptor.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule
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
