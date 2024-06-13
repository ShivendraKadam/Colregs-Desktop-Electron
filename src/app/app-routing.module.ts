import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  // Add routes for other roles (company-admin, user) here

  {
    path: 'individual-user',
    loadChildren: () =>
      import('./individual-user/individual-user.module').then(
        (m) => m.IndividualUserModule
      ),
  },
  {
    path: '**',
    component: NotFoundComponent, // Wildcard route for a 404 page
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
