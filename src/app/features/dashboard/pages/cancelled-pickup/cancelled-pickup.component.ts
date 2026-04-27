import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { DataService } from '../../../../shared/services/data.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cancelled-pickup',
  templateUrl: './cancelled-pickup.component.html',
  styleUrls: ['./cancelled-pickup.component.scss']
})
export class CancelledPickupPageComponent implements OnInit {
  api = inject(ApiService);
  data = inject(DataService);
  toast = inject(ToastService);
  ui = inject(UiStateService);

  loading = signal(true);
  error = signal(''); // Added missing error signal
  searchTerm = signal('');
  dateFilter = signal('');

  // Reactive Filtered List (Referencing logic from request-for-pickup)
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

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Cancelled Pickups',
      'History of pickup requests that were cancelled before completion',
      ['Operations', 'Cancelled Pickup']
    );
    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.error.set('');
    // Standardizing to plural endpoint and PascalCase status as requested
    this.api.get<any>('/pickup-requests?status=Cancelled').pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        if (!res) {
          this.data.kleetoRequests.set([]);
          return;
        }
        
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
          remarks: r.cancellationReason || r.Reason_for_Cancellation__c || r.remarks || r.Remarks__c || '—',
          ownerName: r.ownerName || r.Owner?.Name || '—',
          consignmentId: r.consignmentId || r.Consignment_ID__c || '—',
          state: 'cancelled',
          actualPickupDate: r.cancelledDate || r.LastModifiedDate || '—'
        }));

        this.data.kleetoRequests.set(mapped);
        
        // Sync global counts
        this.data.updateCounts({ cancelled: mapped.length });
      },
      error: (err) => {
        console.error('Failed to load cancelled pickups:', err);
        this.error.set('Failed to load cancelled pickups. Please check your connection.');
        this.data.kleetoRequests.set([]);
      }
    });
  }
}
