import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { catchError, switchMap, throwError } from "rxjs";
import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../components/auth/auth.service";
import { environment } from "../../environments/environment";

const REFRESH_PATH_REGEX = /\/(login|refresh|logout)\/?$/i;

const PUBLIC_AUTH_PATHS = [
    '/login/',
    '/register/',
];

/**
 * Check if a given URL targets a public auth endpoint (no refresh/redirect).
 */
function isPublicAuthRequest(url: string): boolean {
    return PUBLIC_AUTH_PATHS.some(path => url.includes(path));
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const auth = inject(AuthService);
    const router = inject(Router);

    const baseUrl = environment.baseUrl;
    const isApi = req.url.startsWith(baseUrl);
    const apiReq = isApi ? req.clone({ withCredentials: true }) : req;

    return next(apiReq).pipe(
        catchError((err: unknown) => {
            const isHttp = err instanceof HttpErrorResponse;
            const is401 = isHttp && err.status === 401;

            const isRefreshLike = REFRESH_PATH_REGEX.test(apiReq.url);
            const isPublicAuth = isPublicAuthRequest(apiReq.url);
            const alreadyRetried = apiReq.headers.has('X-Retry');

            if (is401 && !alreadyRetried && !isRefreshLike && !isPublicAuth) {
                return auth.refresh().pipe(
                    switchMap(() =>
                        next(apiReq.clone({ headers: apiReq.headers.set('X-Retry', '1') }))
                    ),
                    catchError(() => {
                        auth.removeAuthData();
                        router.navigate(['/login'], { replaceUrl: true });
                        return throwError(() => err);
                    })
                );
            }
            return throwError(() => err);
        })
    );
}