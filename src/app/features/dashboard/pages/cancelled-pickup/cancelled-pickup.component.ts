import { Component, OnInit, inject } from '@angular/core';
import { VaultManagementService, CancelledPickup } from '../../../../core/services/vault-management.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UiStateService } from '../../../../core/services/ui-state.service';

@Component({
  selector: 'app-cancelled-pickup',
  templateUrl: './cancelled-pickup.component.html',
  styleUrls: ['./cancelled-pickup.component.scss']
})
export class CancelledPickupPageComponent implements OnInit {
  vaultService = inject(VaultManagementService);
  toast = inject(ToastService);
  ui = inject(UiStateService);

  cancelledPickups: CancelledPickup[] = [];
  loading = false;

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Cancelled Pickups',
      'History of pickup requests that were cancelled before completion',
      ['Operations', 'Cancelled Pickup']
    );
    this.loadCancelledPickups();
  }

  loadCancelledPickups(): void {
    this.loading = true;
    this.vaultService.getCancelledPickups().subscribe({
      next: (res) => {
        this.cancelledPickups = res.content;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error loading cancelled pickups', 'error');
        this.loading = false;
        
        // Mock data fallback
        this.cancelledPickups = [
          {
            id: 'CP-101',
            branchName: 'Mumbai Main Branch',
            csmName: 'Amit Sharma',
            pickupDate: '2026-04-10',
            cancelledDate: '2026-04-09',
            reason: 'Branch closed due to local holiday',
            status: 'Cancelled'
          },
          {
            id: 'CP-102',
            branchName: 'Delhi North Coast',
            csmName: 'Priya Singh',
            pickupDate: '2026-04-12',
            cancelledDate: '2026-04-11',
            reason: 'Documents not ready for collection',
            status: 'Cancelled'
          }
        ];
      }
    });
  }
}
