import { HttpEvent, HttpHandlerFn, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { ACCESS_TOKEN_KEY, AuthService } from "services/auth.service";


export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (accessToken) {
    req = addToken(req, accessToken);
  }

  return next(req).pipe(
    catchError((error) => {
      // Check if the error is due to an expired access token
      if (error.status === 401 && accessToken) {
        return handleTokenExpired(req, next);
      }

      return throwError(error);
    })
  );
}

function addToken(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handleTokenExpired(request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);

  // Call the refresh token endpoint to get a new access token
  return authService.refreshToken().pipe(
    switchMap(() => {
      const newAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      // Retry the original request with the new access token
      return next(addToken(request, newAccessToken));
    }),
    catchError((error) => {
      // Handle refresh token error (e.g., redirect to login page)
      console.error('Error handling expired access token:', error);
      return throwError(() => new Error(error));
    })
  );
}