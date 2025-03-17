import { HttpEvent, HttpHandlerFn, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injector, runInInjectionContext } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { ACCESS_TOKEN_KEY, AuthService } from "services/auth.service";


export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const injector = inject(Injector);

  if (accessToken) {
    req = addToken(req, accessToken);
  }

  return next(req).pipe(
    catchError((error) => {
      // Check if the error is due to an expired access token
      if (error.status === 401 && accessToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return runInInjectionContext(injector, () => {
          return handleTokenExpired(req, next);
        });
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
  const router = inject(Router);

  // Call the refresh token endpoint to get a new access token
  return authService.refreshToken().pipe(
    switchMap(() => {
      debugger
      const newAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      // Retry the original request with the new access token
      return next(addToken(request, newAccessToken));
    }),
    catchError((error) => {
      // Handle refresh token error (e.g., redirect to login page)
      console.error('Error handling expired access token:', error);
      router.navigateByUrl('/auth/login')
      return throwError(() => new Error(error));
    })
  );
}