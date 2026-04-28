import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DataService } from '../../../../shared/services/data.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';
import { ApiService } from '../../../../core/services/api.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { VaultManagementService } from '../../../../core/services/vault-management.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-request-for-pickup-page',
  templateUrl: './request-for-pickup.component.html',
  styleUrls: ['./request-for-pickup.component.scss']
})
export class RequestForPickupPageComponent implements OnInit {
  data = inject(DataService);
  toast = inject(ToastService);
  api = inject(ApiService);
  ui = inject(UiStateService);
  vaultService = inject(VaultManagementService);
  authService = inject(AuthService);

  loading = signal(false);
  confirmLoading = signal(false);
  error = signal('');
  isDisabled = computed(() => this.authService.isCSM());

  // Filtering Signals (Branch & Date)
  searchTerm = signal('');
  dateFilter = signal('');

  // Reactive Filtered List
  filteredPickups = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const df = this.dateFilter();
    let records = this.data.kleetoRequests();

    if (term) {
      records = records.filter(r => 
        r.branch.toLowerCase().includes(term) || 
        r.ownerName.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term)
      );
    }

    if (df) {
      records = records.filter(r => r.date.includes(df));
    }

    return records;
  });

  showModal = signal(false);
  showCancelModal = signal(false);
  selectedRequest = signal<PickupRequestKleeto | null>(null);
  confirmDate = signal('');
  confirmPOD = signal('');
  cancelReason = signal('');
  selectedFile = signal<File | null>(null);
  formError = signal(false);

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Request for Pickup'
    );
    
    // Skip redundant fetch if Dashboard already populated the signal
    if (this.data.kleetoRequests().length === 0) {
      this.fetchData();
    }
  }

  openCancelModal(r: PickupRequestKleeto): void {
    this.selectedRequest.set(r);
    this.cancelReason.set('');
    this.showCancelModal.set(true);
  }
  
  clearFilters(): void {
    this.searchTerm.set('');
    this.dateFilter.set('');
    this.toast.show('Filters cleared');
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
      next: (res) => {
        this.closeCancelModal();
        this.toast.show(`Pickup for branch ${r.branch} has been cancelled.`);
        this.fetchData();
      },
      error: () => {
        this.toast.show('Failed to cancel pickup', 'error');
      }
    });
  }

  fetchData(): void {
    this.loading.set(true);
    this.api.get<any>('/pickup-requests?status=Requested').subscribe({
      next: (res) => {
        const records = res.data || res.records || (Array.isArray(res) ? res : []);
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
          state: 'pending',
          actualPickupDate: r.actualPickupDate || '—'
        }));
        this.data.kleetoRequests.set(mapped);
        // Sync global counts
        const totalFiles = mapped.reduce((sum, r) => sum + (r.files || 0), 0);
        this.data.updateCounts({ pending: mapped.length, totalFiles: totalFiles });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load pending requests. Please try again.');
        this.loading.set(false);
      }
    });
  }

  openConfirmModal(r: PickupRequestKleeto): void {
    this.selectedRequest.set(r);
    this.confirmDate.set('');
    this.confirmPOD.set('');
    this.selectedFile.set(null);
    this.formError.set(false);
    this.showModal.set(true);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast.show('File is too large (max 10MB)', 'error');
        event.target.value = '';
        return;
      }
      this.selectedFile.set(file);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  getMinDate(): string {
    const d = this.selectedRequest()?.date;
    if (!d || d === '—') return '';
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return '';
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  submitConfirm(): void {
    if (!this.confirmDate() || !this.confirmPOD().trim() || !this.selectedFile()) {
      this.formError.set(true);
      return;
    }

    const minDate = this.getMinDate();
    if (minDate && this.confirmDate() < minDate) {
      this.toast.show(`Scheduled date cannot be earlier than requested date (${this.selectedRequest()?.date})`, 'error');
      return;
    }

    const r = this.selectedRequest()!;
    this.confirmLoading.set(true);
    
    const formData = new FormData();
    formData.append('recordId', r.id);
    formData.append('consignmentId', r.consignmentId);
    formData.append('pod', this.confirmPOD().trim());
    formData.append('estimatedPickupDate', this.confirmDate());
    
    const file = this.selectedFile();
    if (file) {
      formData.append('file', file);
    }

    this.api.post<any>('/update-pickup-date', formData).subscribe({
      next: (res) => {
        this.confirmLoading.set(false);
        if (res.success || res.status === 'success') {
          this.closeModal();
          this.toast.show(`Pickup scheduled successfully`);
          this.fetchData();
        } else {
          this.toast.show(res.message || 'Failed to schedule pickup', 'error');
        }
      },
      error: () => {
        this.confirmLoading.set(false);
        this.toast.show('Error scheduling pickup. Please try again.', 'error');
      }
    });
  }
}
