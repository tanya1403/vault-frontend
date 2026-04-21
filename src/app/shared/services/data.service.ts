import { Injectable, signal, computed } from '@angular/core';
import { PickupRequestKleeto, PickupRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  kleetoRequests = signal<PickupRequestKleeto[]>([]);
  sfRequests = signal<PickupRequest[]>([]);

  // Computed counts for UI
  countPending = computed(() => this.kleetoRequests().filter(r => r.state === 'pending').length);
  countScheduled = computed(() => this.kleetoRequests().filter(r => r.state === 'scheduled').length);
  countIntransit = computed(() => this.kleetoRequests().filter(r => r.state === 'intransit').length);
  countDelivered = computed(() => this.kleetoRequests().filter(r => r.state === 'delivered').length);
  
  totalFilesPending = computed(() => this.kleetoRequests()
    .filter(r => r.state === 'pending')
    .reduce((sum, r) => sum + (r.files || 0), 0)
  );

  BRANCH_ADDR: Record<string, string> = { 'BranchA': 'AddressA' };

  updateKleetoFromBackend(backendData: any[]): void {
    const mapped: PickupRequestKleeto[] = backendData.map(r => ({
      id: r.id || r.consignmentId || Math.random().toString(),
      branch: r.branchName || '—',
      consignmentId: r.consignmentId || '—',
      ownerName: r.ownerName || '—',
      addr: r.branchAddress || '—',
      csm: r.csmBM || '—',
      mob: r.mobile || '—',
      files: r.noOfFiles || 0,
      boxes: r.noOfBoxes || 0,
      date: r.requestedDate || '—',
      remarks: r.status || '—',
      state: r.status?.toLowerCase() === 'requested' ? 'pending' : (r.status?.toLowerCase() === 'scheduled' ? 'scheduled' : 'pending')
    }));
    this.kleetoRequests.set(mapped);
  }

  markDelivered(id: string) {}
  markIntransit(id: string) {}
  confirmPickup(id: string, pod: string, date: string) {}
  
  toggleVault(prId: string, lai: string, idx: number) {}
  acknowledgeLAI(prId: string, laiNum: string) {}
  revertLAI(prId: string, laiNum: string) {}
}
