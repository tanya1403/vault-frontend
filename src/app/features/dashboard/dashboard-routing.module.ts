import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { RequestForPickupPageComponent } from './pages/request-for-pickup/request-for-pickup.component';
import { PickupScheduledPageComponent } from './pages/pickup-scheduled/pickup-scheduled.component';
import { IntransitPageComponent } from './pages/intransit/intransit.component';
import { DeliveredPageComponent } from './pages/delivered/delivered.component';
import { VaultManagementPageComponent } from './pages/vault-management/vault-management.component';
import { CancelledPickupPageComponent } from './pages/cancelled-pickup/cancelled-pickup.component';
import { UserRegistrationPageComponent } from './pages/user-registration/user-registration.component';
import { RoleGuard } from '@core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'request-for-pickup', pathMatch: 'full' },
      { path: 'request-for-pickup', component: RequestForPickupPageComponent },
      { path: 'pickup-scheduled', component: PickupScheduledPageComponent },
      { path: 'intransit', component: IntransitPageComponent },
      { path: 'delivered', component: DeliveredPageComponent },
      { path: 'vault-management', component: VaultManagementPageComponent, canActivate: [RoleGuard], data: { role: ['ADMIN', 'MANAGEMENT', 'KLEETO'] } },
      { path: 'cancelled-pickup', component: CancelledPickupPageComponent },
      { path: 'user-registration', component: UserRegistrationPageComponent, canActivate: [RoleGuard], data: { role: ['ADMIN'] } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
