import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CursorResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface VaultDocument {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  label: string;
  type: string;
  status: string;
  sentToKleeto: string;
  createdDate: string;
  lodName?: string;
  vaultingDate?: string;
}

export interface VaultBranch {
  branchId: string;
  branchName: string;
  address: string;
  csmName: string;
  mobile: string;
  totalDocuments: number;
}

export interface VaultLai {
  lai: string;
  customerName: string;
  totalFiles: number;
  sentToKleetoDate: string;
}

export interface CancelledPickup {
  id: string;
  branchName: string;
  csmName: string;
  pickupDate: string;
  cancelledDate: string;
  reason: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class VaultManagementService {
  constructor(private api: ApiService) { }

  getBranches(search?: string, lastBranch?: string): Observable<CursorResponse<VaultBranch>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (lastBranch) params = params.set('lastBranch', lastBranch);
    return this.api.get<CursorResponse<VaultBranch>>('/branches', params);
  }

  getLais(branchId: string, search?: string, lastLai?: string): Observable<CursorResponse<VaultLai>> {
    let params = new HttpParams().set('branchId', branchId);
    if (search) params = params.set('search', search);
    if (lastLai) params = params.set('lastLai', lastLai);
    return this.api.get<CursorResponse<VaultLai>>('/lais', params);
  }

  getDocuments(lai: string, lastId?: string): Observable<CursorResponse<VaultDocument>> {
    let params = new HttpParams().set('lai', lai);
    if (lastId) params = params.set('lastId', lastId);
    return this.api.get<CursorResponse<VaultDocument>>('/documents', params);
  }

  cancelPickup(recordId: string, reason: string): Observable<any> {
    // Mocked for now as requested
    console.log('Mocking cancellation for:', recordId, reason);
    return new Observable(obs => {
      setTimeout(() => {
        obs.next({ isSuccess: true, message: `Pickup ${recordId} cancelled.` });
        obs.complete();
      }, 500);
    });
  }

  getCancelledPickups(): Observable<CursorResponse<CancelledPickup>> {
    return this.api.get<CursorResponse<CancelledPickup>>('/vault/pickups/cancelled');
  }

  markAsVaulted(documentIds: string[], vaultingDate: string): Observable<any> {
    const body = {
      documentIds: documentIds,
      vaultingDate: vaultingDate
    };

    return this.api.post<any>(`/vault/document/mark-vaulted`, body);
  }

  acknowledgeLais(lais: string[]): Observable<any> {
    return this.api.post<any>(`/vault/lai/acknowledge`, { lais });
  }
}
