import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VaultManagementService, VaultDocument, VaultBranch, VaultLai } from '../../../../core/services/vault-management.service';
import { ToastService } from '../../../../shared/services/toast.service';

type Panel = 'branches' | 'lais' | 'items';


@Component({
  selector: 'app-vault-management-page',
  templateUrl: './vault-management.component.html',
  styleUrls: ['./vault-management.component.scss']
})
export class VaultManagementPageComponent implements OnInit, OnDestroy {
  panel: Panel = 'branches';
  
  private searchSubject = new Subject<string>();
  private searchLaiSubject = new Subject<string>();
  private branchSub?: Subscription;
  private laiSub?: Subscription;
  private searchSub?: Subscription;
  private searchLaiSub?: Subscription;
  

  // State
  branches: VaultBranch[] = [];
  lais: VaultLai[] = [];
  documents: VaultDocument[] = [];

  selectedBranch: VaultBranch | null = null;
  selectedLai: VaultLai | null = null;

  // Multi-select state
  selectedLaisForAck = new Set<string>();
  showAckConfirmModal = false;
  isAcknowledging = false;
  isSelectionMode = false;

  // Document Multi-select state
  selectedDocsForVaulting = new Set<string>();
  showVaultConfirmModal = false;
  isVaulting = false;
  isDocSelectionMode = false;

  // Pagination / Load More states (Cursors)
  branchCursor: string | null = null;
  hasMoreBranches = false;

  laiCursor: string | null = null;
  hasMoreLais = false;

  docCursor: string | null = null;
  hasMoreDocs = false;

  // Loading flags
  loadingBranches = false;
  loadingLais = false;
  loadingDocs = false;

  searchBranchTerm = '';
  searchLaiTerm = '';

  // Custom Toast State
  customToast = {
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  };

  constructor(
    private vaultService: VaultManagementService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    
    this.searchSub = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadBranches(true);
    });

    this.searchLaiSub = this.searchLaiSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadLais(true);
    });
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
    this.laiSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.searchLaiSub?.unsubscribe();
  }

  // ---- Branches ----
  loadBranches(reset = true): void {
    if (reset) {
      this.branches = [];
      this.branchCursor = null;
      this.branchSub?.unsubscribe();
    }
    this.loadingBranches = true;
    this.branchSub = this.vaultService.getBranches(this.searchBranchTerm, this.branchCursor || undefined).subscribe({
      next: (res) => {
        this.branches = [...this.branches, ...res.content];
        this.branchCursor = res.nextCursor;
        this.hasMoreBranches = res.hasMore;
        this.loadingBranches = false;
      },
      error: () => {
        this.showCustomToast('Error loading branches', 'error');
        this.loadingBranches = false;
      }
    });
  }

  onSearchBranchChange(): void {
    this.searchSubject.next(this.searchBranchTerm);
  }

  openBranch(branch: VaultBranch): void {
    this.selectedBranch = branch;
    this.panel = 'lais';
    this.loadLais(true);
  }

  // ---- LAIs ----
  loadLais(reset = true): void {
    if (!this.selectedBranch) return;
    if (reset) {
      this.lais = [];
      this.laiCursor = null;
      this.selectedLaisForAck.clear();
      this.laiSub?.unsubscribe();
    }
    this.loadingLais = true;
    this.laiSub = this.vaultService.getLais(this.selectedBranch.branchName, this.searchLaiTerm || undefined, this.laiCursor || undefined).subscribe({
      next: (res) => {
        this.lais = [...this.lais, ...res.content];
        this.laiCursor = res.nextCursor;
        this.hasMoreLais = res.hasMore;
        this.loadingLais = false;
      },
      error: () => {
        this.showCustomToast('Error loading LAIs', 'error');
        this.loadingLais = false;
      }
    });
  }

  onSearchLaiChange(): void {
    this.searchLaiSubject.next(this.searchLaiTerm);
  }

  openLAI(lai: VaultLai): void {
    this.selectedLai = lai;
    this.panel = 'items';
    this.loadDocuments(true);
  }

  // ---- Documents ----
  loadDocuments(reset = true): void {
    if (!this.selectedLai) return;
    if (reset) {
      this.documents = [];
      this.docCursor = null;
    }
    this.loadingDocs = true;
    this.vaultService.getDocuments(this.selectedLai.lai, this.docCursor || undefined).subscribe({
      next: (res) => {
        this.documents = [...this.documents, ...res.content];
        this.docCursor = res.nextCursor;
        this.hasMoreDocs = res.hasMore;
        this.loadingDocs = false;
        console.log('Loaded documents:', res.content);
      },
      error: () => {
        this.showCustomToast('Error loading documents', 'error');
        this.loadingDocs = false;
      }
    });
  }

  showCustomToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.customToast = { show: true, type, message };
    setTimeout(() => {
      this.customToast.show = false;
    }, 4000); // auto-hide after 4 seconds
  }

  markAsVaulted(doc: VaultDocument): void {
    const today = new Date().toISOString().split('T')[0];
    this.vaultService.markAsVaulted([doc.id], today).subscribe({
      next: (res) => {
        if (res && (res.isSuccess || res.success || res.status === 'success')) {
          doc.status = 'Vaulted'; // Assume client side update for immediate feedback
          doc.vaultingDate = new Date().toISOString(); // Trigger button hide
          this.showCustomToast(res.message || `Document vaulted successfully.`, 'success');
        } else {
          this.showCustomToast(res?.message || 'Failed to mark document as vaulted.', 'error');
        }
      },
      error: (err) => {
        this.showCustomToast(err?.error?.message || 'Error communicating with server.', 'error');
      }
    });
  }

  // ---- Document Vaulting Multi-select ----
  toggleDocSelection(docId: string, event: Event): void {
    event.stopPropagation();
    if (this.selectedDocsForVaulting.has(docId)) {
      this.selectedDocsForVaulting.delete(docId);
    } else {
      this.selectedDocsForVaulting.add(docId);
    }
  }

  toggleAllDocsSelection(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.documents.forEach(doc => {
        if (!doc.vaultingDate) {
          this.selectedDocsForVaulting.add(doc.id);
        }
      });
    } else {
      this.selectedDocsForVaulting.clear();
    }
  }

  isAllDocsSelected(): boolean {
    const availableDocs = this.documents.filter(doc => !doc.vaultingDate);
    return availableDocs.length > 0 && this.selectedDocsForVaulting.size === availableDocs.length;
  }

  toggleDocSelectionMode(): void {
    this.isDocSelectionMode = !this.isDocSelectionMode;
    if (!this.isDocSelectionMode) {
      this.selectedDocsForVaulting.clear();
    }
  }

  getSelectedDocsList(): VaultDocument[] {
    return this.documents.filter(doc => this.selectedDocsForVaulting.has(doc.id));
  }

  openVaultModal(): void {
    if (this.selectedDocsForVaulting.size > 0) {
      this.showVaultConfirmModal = true;
    }
  }

  closeVaultModal(): void {
    this.showVaultConfirmModal = false;
  }

  confirmVaultDocs(): void {
    if (this.selectedDocsForVaulting.size === 0) return;
    
    this.isVaulting = true;
    const docIdsToVault = Array.from(this.selectedDocsForVaulting);
    const today = new Date().toISOString().split('T')[0];
    
    this.vaultService.markAsVaulted(docIdsToVault, today).subscribe({
      next: (res: any) => {
        this.isVaulting = false;
        
        const isActuallyError = res && (res.isSuccess === false || res.status === 'error' || res.success === false);

        if (!isActuallyError) {
          this.showVaultConfirmModal = false;
          
          // Update UI state for each vaulted document
          this.documents.forEach(doc => {
            if (this.selectedDocsForVaulting.has(doc.id)) {
              doc.status = 'Vaulted';
              doc.vaultingDate = new Date().toISOString();
            }
          });

          this.selectedDocsForVaulting.clear();
          this.isDocSelectionMode = false;
          this.showCustomToast(res?.message || 'Successfully vaulted selected documents', 'success');
        } else {
          this.showCustomToast(res?.message || 'Failed to vault documents.', 'error');
        }
      },
      error: (err) => {
        this.isVaulting = false;
        this.showCustomToast(err?.error?.message || 'Error vaulting documents. Please try again.', 'error');
      }
    });
  }

  formatVaultingDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return dateStr.split('T')[0];
  }

  // ---- LAI Acknowledgement ----
  toggleLaiSelection(laiId: string, event: Event): void {
    event.stopPropagation();
    if (this.selectedLaisForAck.has(laiId)) {
      this.selectedLaisForAck.delete(laiId);
    } else {
      this.selectedLaisForAck.add(laiId);
    }
  }

  toggleAllLaisSelection(event: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.lais.forEach(l => this.selectedLaisForAck.add(l.lai));
    } else {
      this.selectedLaisForAck.clear();
    }
  }

  isAllLaisSelected(): boolean {
    return this.lais.length > 0 && this.selectedLaisForAck.size === this.lais.length;
  }

  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedLaisForAck.clear();
    }
  }

  getSelectedLaisList(): string[] {
    return Array.from(this.selectedLaisForAck);
  }

  openAckModal(): void {
    if (this.selectedLaisForAck.size > 0) {
      this.showAckConfirmModal = true;
    }
  }

  closeAckModal(): void {
    this.showAckConfirmModal = false;
  }

  confirmAcknowledge(): void {
    if (this.selectedLaisForAck.size === 0) return;
    
    this.isAcknowledging = true;
    const laisToSave = Array.from(this.selectedLaisForAck);
    
    this.vaultService.acknowledgeLais(laisToSave).subscribe({
      next: (res: any) => {
        this.isAcknowledging = false;
        
        // Very permissive success check
        const isActuallyError = res && (res.isSuccess === false || res.status === 'error' || res.success === false);

        if (!isActuallyError) {
          this.showAckConfirmModal = false;
          this.selectedLaisForAck.clear();
          this.isSelectionMode = false;
          this.showCustomToast('Successfully acknowledged selected LAIs', 'success');
        } else {
          this.showCustomToast(res?.message || 'Failed to acknowledge LAIs.', 'error');
        }
      },
      error: (err) => {
        this.isAcknowledging = false;
        // Don't close modal on error so user can try again
        this.showCustomToast(err?.error?.message || 'Error acknowledging LAIs. Please try again.', 'error');
      }
    });
  }

  // ---- Navigation ----
  goPanel(p: Panel): void {
    this.panel = p;
    if (p === 'branches') {
      this.selectedBranch = null;
      this.selectedLai = null;
      this.selectedLaisForAck.clear();
      this.isSelectionMode = false;
    }
    if (p === 'lais') {
      this.selectedLai = null;
      this.isSelectionMode = false;
    }
    if (p === 'items') {
      this.isDocSelectionMode = false;
      this.selectedDocsForVaulting.clear();
    }
  }

  // Safe checks for badge
  getVaultStatusBadge(status: string): string {
    if (status === 'Vaulted') return 'badge-acked';
    return 'badge-vault-pending';
  }
}
