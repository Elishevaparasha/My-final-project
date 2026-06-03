import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./features/content/content-list/content-list.component').then(
            (m) => m.ContentListComponent,
          ),
        data: { contentTypeFilter: 'Video', pageTitle: 'סרטונים' },
      },
      {
        path: 'articles',
        loadComponent: () =>
          import('./features/content/content-list/content-list.component').then(
            (m) => m.ContentListComponent,
          ),
        data: { contentTypeFilter: 'Article', pageTitle: 'כתבות' },
      },
      {
        path: 'content',
        redirectTo: 'videos',
        pathMatch: 'full',
      },
      {
        path: 'content/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/content/content-form/content-form.component').then(
            (m) => m.ContentFormComponent,
          ),
      },
      {
        path: 'content/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/content/content-form/content-form.component').then(
            (m) => m.ContentFormComponent,
          ),
      },
      {
        path: 'content/:id',
        loadComponent: () =>
          import('./features/content/content-detail/content-detail.component').then(
            (m) => m.ContentDetailComponent,
          ),
      },
      {
        path: 'saved',
        loadComponent: () =>
          import('./features/content/content-list/content-list.component').then(
            (m) => m.ContentListComponent,
          ),
        data: { pageTitle: '★ שמורים', showStarred: true },
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'verify-email/:token',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  { path: '**', redirectTo: 'home' },
];
