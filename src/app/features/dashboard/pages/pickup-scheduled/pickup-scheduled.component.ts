import { Component, OnInit, signal, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { DataService } from '../../../../shared/services/data.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { VaultManagementService } from '../../../../core/services/vault-management.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-pickup-scheduled-page',
  templateUrl: './pickup-scheduled.component.html',
  styleUrls: ['./pickup-scheduled.component.scss']
})
export class PickupScheduledPageComponent implements OnInit {
  api = inject(ApiService);
  data = inject(DataService);
  toast = inject(ToastService);
  ui = inject(UiStateService);
  vaultService = inject(VaultManagementService);
  authService = inject(AuthService);

  loading = signal(true);
  error = signal('');
  isDisabled = computed(() => this.authService.isCSM());

  // Modal State
  showModal = signal(false);
  showCancelModal = signal(false);
  selectedRequest = signal<PickupRequestKleeto | null>(null);
  confirmDate = signal('');
  cancelReason = signal('');
  confirmLoading = signal(false);
  formError = signal(false);

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Pickup Scheduled',
      'Pickups confirmed and scheduled for collection',
      ['Operations', 'Pickup Scheduled']
    );
    this.fetchData();
  }

  openCancelModal(r: PickupRequestKleeto): void {
    this.selectedRequest.set(r);
    this.cancelReason.set('');
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  submitCancel(): void {
    if (!this.cancelReason().trim()) {
      this.toast.show('Please provide a cancellation reason', 'error');
      return;
    }
    const r = this.selectedRequest()!;
    this.vaultService.cancelPickup(r.id, this.cancelReason()).subscribe({
      next: () => {
        this.closeCancelModal();
        this.toast.show(`Scheduled pickup for ${r.branch} has been cancelled.`);
        this.fetchData();
      },
      error: () => {
        this.toast.show('Failed to cancel pickup', 'error');
      }
    });
  }

  fetchData(): void {
    this.loading.set(true);
    this.api.get<any>('/pickup-requests?status=Scheduled').subscribe({
      next: (res) => {
        const records = res.data || [];
        const mapped: PickupRequestKleeto[] = records.map((r: any) => ({
          id: r.id || r.Id || r.Name || Math.random().toString(),
          branch: r.branchName || r.Branch_Name__r?.Name || r.Branch_Name__c || '—',
          addr: r.branchAddress || r.Branch_Name__r?.Branch_Address_line_1__c || r.Branch_Address__c || '—',
          csm: r.ownerName || r.BM_BMD__c || r.CSM_BM__c || '—',
          mob: r.mobile || r.Mobile__c || '—',
          files: r.noOfFiles ?? r.No_Of_Files__c ?? r.No_of_Files__c ?? 0,
          boxes: r.noOfBoxes ?? r.Number_Of_Boxes__c ?? r.Number_of_Boxes__c ?? 0,
          date: r.requestedDate || r.Requested_Pickup_Date__c || r.Pickup_Date__c || '—',
          remarks: r.remarks || r.Remarks__c || '—',
          ownerName: r.ownerName || r.Owner?.Name || '—',
          consignmentId: r.consignmentId || r.Consignment_ID__c || '—',
          state: 'scheduled',
          actualPickupDate: r.actualPickupDate || '—'
        }));
        this.data.kleetoRequests.set(mapped);
        // Update global count for scheduled items
        this.data.updateCounts({ scheduled: mapped.length });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load scheduled pickups.');
        this.loading.set(false);
      }
    });
  }

  markIntransit(request: PickupRequestKleeto): void {
    this.selectedRequest.set(request);
    this.confirmDate.set('');
    this.formError.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRequest.set(null);
  }

  submitInTransit(): void {
    if (!this.confirmDate()) {
      this.formError.set(true);
      return;
    }

    const r = this.selectedRequest()!;
    this.confirmLoading.set(true);

    const formData = new FormData();
    formData.append('recordId', r.id);
    formData.append('actualPickupDate', this.confirmDate());
    formData.append('status', 'Intransit');

    this.api.post<any>('/update-pickup-date', formData).subscribe({
      next: (res) => {
        this.confirmLoading.set(false);
        if (res.success || res.status === 'success') {
          this.closeModal();
          this.toast.show(`${r.branch} marked as In Transit`);
          this.fetchData();
        } else {
          this.toast.show(res.message || 'Failed to update status', 'error');
        }
      },
      error: () => {
        this.confirmLoading.set(false);
        this.toast.show('Error updating status. Please try again.', 'error');
      }
    });
  }
}
