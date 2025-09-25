import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'surveys',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/surveys/surveys').then((m) => m.Surveys),
  },
  {
    path: 'surveys/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/survey-detail/survey-detail').then((m) => m.SurveyDetail),
  },
  {
    path: 'public/:publicId',
    loadComponent: () => import('./pages/public-survey/public-survey').then((m) => m.PublicSurvey),
  },
  {
    path: 'results/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/results/results').then((m) => m.Results),
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/users/users').then((m) => m.Users),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: '' },
];
