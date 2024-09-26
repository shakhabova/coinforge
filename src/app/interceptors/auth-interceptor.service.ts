import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { ACCESS_TOKEN_KEY, AuthService } from "services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      req = this.addToken(req, accessToken);
    }

    return next.handle(req).pipe(
      catchError((error) => {
        // Check if the error is due to an expired access token
        if (error.status === 401 && accessToken) {
          return this.handleTokenExpired(req, next);
        }

        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handleTokenExpired(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Call the refresh token endpoint to get a new access token
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const newAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        // Retry the original request with the new access token
        return next.handle(this.addToken(request, newAccessToken));
      }),
      catchError((error) => {
        // Handle refresh token error (e.g., redirect to login page)
        console.error('Error handling expired access token:', error);
        return throwError(() => new Error(error));
      })
    );
  }
}