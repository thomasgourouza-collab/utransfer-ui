import { Routes } from '@angular/router';

import { unlockedGuard } from './core/guards/unlocked.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'wizard',
    loadComponent: () =>
      import('./features/wizard/wizard-page.component').then((m) => m.WizardPageComponent),
  },
  {
    path: 'power',
    loadComponent: () =>
      import('./features/power-user/power-user-form.component').then(
        (m) => m.PowerUserFormComponent,
      ),
  },
  {
    path: 'profiles',
    canActivate: [unlockedGuard],
    loadComponent: () =>
      import('./features/profiles/profiles-page.component').then((m) => m.ProfilesPageComponent),
  },
  {
    path: 'presets',
    loadComponent: () =>
      import('./features/presets/presets-page.component').then((m) => m.PresetsPageComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/history-page.component').then((m) => m.HistoryPageComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent),
  },
  { path: '**', redirectTo: '' },
];
