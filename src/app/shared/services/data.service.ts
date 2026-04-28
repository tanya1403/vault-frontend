import { Injectable, signal, computed } from '@angular/core';
import { PickupRequestKleeto, PickupRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  kleetoRequests = signal<PickupRequestKleeto[]>([]);
  sfRequests = signal<PickupRequest[]>([]);

  // Global counts for Dashboard Top Bar (Synced across pages)
  dashboardStats = signal({
    pending: 0,
    scheduled: 0,
    intransit: 0,
    delivered: 0,
    cancelled: 0,
    totalFiles: 0
  });

  // Backward compatibility / convenience
  countPending = computed(() => this.dashboardStats().pending);
  countScheduled = computed(() => this.dashboardStats().scheduled);
  countIntransit = computed(() => this.dashboardStats().intransit);
  countDelivered = computed(() => this.dashboardStats().delivered);
  countCancelled = computed(() => this.dashboardStats().cancelled);

  totalFilesPending = computed(() => this.dashboardStats().totalFiles);

  updateCounts(stats: Partial<typeof this.dashboardStats.prototype>) {
    this.dashboardStats.update(current => ({ ...current, ...stats }));
  }

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
