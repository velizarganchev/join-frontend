import { inject } from '@angular/core';
import { AuthService } from './components/auth/auth.service';
import { CanMatchFn, Router, Routes, } from '@angular/router';

import { homeRoutes } from './components/home/home.routes'
import { LoginComponent } from './components/auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';



const guestGuard: CanMatchFn = () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    const isAuthenticated = auth.isAuthenticated();
    if (isAuthenticated) {
        return router.createUrlTree(['/']);
    }
    return true;
};

const authGuard: CanMatchFn = () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    const isAuthenticated = auth.isAuthenticated();
    if (isAuthenticated) {
        return true;
    }
    return router.createUrlTree(['/login']);
};

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canMatch: [guestGuard] },
    { path: 'sign-up', component: SignupComponent, canMatch: [guestGuard] },
    {
        path: '',
        component: HomeComponent,
        children: homeRoutes,
        canMatch: [authGuard]
    },
    { path: 'legal-notice', component: LegalNoticeComponent },
    {
        path: '**',
        component: NotFoundComponent
    },
];
