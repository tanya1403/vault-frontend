import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from '../../shared/shared.module';

import { RequestForPickupPageComponent } from './pages/request-for-pickup/request-for-pickup.component';
import { PickupScheduledPageComponent } from './pages/pickup-scheduled/pickup-scheduled.component';
import { IntransitPageComponent } from './pages/intransit/intransit.component';
import { DeliveredPageComponent } from './pages/delivered/delivered.component';
import { VaultManagementPageComponent } from './pages/vault-management/vault-management.component';

@NgModule({
  declarations: [
    DashboardComponent,
    RequestForPickupPageComponent,
    PickupScheduledPageComponent,
    IntransitPageComponent,
    DeliveredPageComponent,
    VaultManagementPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
