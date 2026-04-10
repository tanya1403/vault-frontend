import { Injectable, signal } from '@angular/core';
import { PickupRequestKleeto, PickupRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  kleetoRequests = signal<PickupRequestKleeto[]>([]);
  sfRequests = signal<PickupRequest[]>([]);
  BRANCH_ADDR: Record<string, string> = { 'BranchA': 'AddressA' };

  markDelivered(id: string) {}
  markIntransit(id: string) {}
  confirmPickup(id: string, pod: string, date: string) {}
  
  toggleVault(prId: string, lai: string, idx: number) {}
  acknowledgeLAI(prId: string, laiNum: string) {}
  revertLAI(prId: string, laiNum: string) {}
}
