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
  private branchSub?: Subscription;
  private searchSub?: Subscription;
  

  // State
  branches: VaultBranch[] = [];
  lais: VaultLai[] = [];
  documents: VaultDocument[] = [];

  // Current selections
  selectedBranch: VaultBranch | null = null;
  selectedLai: VaultLai | null = null;

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
  }

  ngOnDestroy(): void {
    this.branchSub?.unsubscribe();
    this.searchSub?.unsubscribe();
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
    }
    this.loadingLais = true;
    this.vaultService.getLais(this.selectedBranch.branchName, undefined, this.laiCursor || undefined).subscribe({
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
    this.vaultService.markAsVaulted(doc.id).subscribe({
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

  // ---- Navigation ----
  goPanel(p: Panel): void {
    this.panel = p;
    if (p === 'branches') {
      this.selectedBranch = null;
      this.selectedLai = null;
    }
    if (p === 'lais') {
      this.selectedLai = null;
    }
  }

  // Safe checks for badge
  getVaultStatusBadge(status: string): string {
    if (status === 'Vaulted') return 'badge-acked';
    return 'badge-vault-pending';
  }
}
