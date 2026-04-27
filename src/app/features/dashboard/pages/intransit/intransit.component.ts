import { Component, OnInit, signal, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { DataService } from '../../../../shared/services/data.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';
import { AuthService } from '../../../../core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-intransit-page',
  templateUrl: './intransit.component.html',
  styleUrls: ['./intransit.component.scss']
})
export class IntransitPageComponent implements OnInit {
  api = inject(ApiService);
  data = inject(DataService);
  ui = inject(UiStateService);
  authService = inject(AuthService);

  loading = signal(true);
  error = signal('');
  isDisabled = computed(() => this.authService.isCSM());

  // Modal Signals
  showModal = signal(false);
  selectedRequest = signal<PickupRequestKleeto | null>(null);
  deliveryDate = signal(new Date().toISOString().split('T')[0]);
  confirmLoading = signal(false);
  formError = signal(false);

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Intransit',
      'Shipments currently in transit to the vault',
      ['Operations', 'Intransit']
    );
    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.api.get<any>('/pickup-requests?status=Intransit').subscribe({
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
          state: 'intransit',
          actualPickupDate: r.actualPickupDate || '—'
        }));
        this.data.kleetoRequests.set(mapped);
        // Update global count
        this.data.updateCounts({ intransit: mapped.length });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load intransit shipments:', err);
        this.error.set('Failed to load intransit shipments.');
        this.loading.set(false);
      }
    });
  }

  markDelivered(request: PickupRequestKleeto): void {
    this.selectedRequest.set(request);
    this.deliveryDate.set(new Date().toISOString().split('T')[0]);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedRequest.set(null);
    this.formError.set(false);
  }

  submitDelivered(): void {
    if (!this.deliveryDate()) {
      this.formError.set(true);
      return;
    }

    const r = this.selectedRequest();
    if (!r) return;

    this.confirmLoading.set(true);
    const payload = {
      recordId: r.id,
      deliveryDate: this.deliveryDate(),
      status: 'Acknowledged'
    };

    this.api.post('/update-pickup-date', payload).subscribe({
      next: () => {
        this.confirmLoading.set(false);
        this.closeModal();
        this.fetchData();
      },
      error: (err) => {
        console.error('Failed to mark as delivered:', err);
        this.confirmLoading.set(false);
        alert('Failed to update record. Please try again.');
      }
    });
  }
}
