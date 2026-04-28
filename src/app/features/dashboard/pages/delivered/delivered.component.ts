import { Component, OnInit, signal, inject } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { DataService } from '../../../../shared/services/data.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';

@Component({
  selector: 'app-delivered-page',
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.scss']
})
export class DeliveredPageComponent implements OnInit {
  api = inject(ApiService);
  data = inject(DataService);
  ui = inject(UiStateService);

  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.ui.setPageTitle(
      'Delivered'
    );
    this.fetchData();
  }

  fetchData(): void {
    this.loading.set(true);
    this.api.get<any>('/pickup-requests?status=Delivered').subscribe({
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
          state: 'delivered',
          actualPickupDate: r.actualPickupDate || '—'
        }));
        this.data.kleetoRequests.set(mapped);
        // Sync global count
        this.data.updateCounts({ delivered: mapped.length });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load delivered shipments:', err);
        this.error.set('Failed to load delivered shipments.');
        this.loading.set(false);
      }
    });
  }
}
