// src/app/pages/request-for-pickup/request-for-pickup.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { ToastService } from '../../shared/services/toast.service';
import { PickupRequestKleeto } from '../../shared/models/models';

@Component({
  selector: 'app-request-for-pickup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stats stats-3">
      <div class="stat-card">
        <div class="stat-label">New Requests</div>
        <div class="stat-value">{{ pending().length }}</div>
        <div class="stat-delta pe">awaiting confirmation</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Scheduled Today</div>
        <div class="stat-value">{{ scheduled().length }}</div>
        <div class="stat-delta up">confirmed by Kleeto</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Files</div>
        <div class="stat-value">{{ totalFiles() }}</div>
        <div class="stat-delta">pending requests</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Incoming Pickup Requests</div>
          <div class="card-sub">Requests from HomeFirst branches awaiting Kleeto confirmation</div>
        </div>
        <span class="badge badge-pending" style="font-size:12px;padding:4px 12px;">{{ pending().length }} pending</span>
      </div>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Branch</th><th>Branch Address</th><th>CSM / BM</th><th>Mobile</th>
              <th>No. of Files</th><th>No. of Boxes</th><th>Pickup Date</th><th>Remarks</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (r of pending(); track r.id) {
              <tr>
                <td style="font-weight:600;">{{ r.branch }}</td>
                <td style="font-size:12px;color:var(--text2);max-width:180px;line-height:1.4;">{{ r.addr }}</td>
                <td>{{ r.csm }}</td>
                <td class="mono">{{ r.mob }}</td>
                <td class="mono">{{ r.files }}</td>
                <td class="mono">{{ r.boxes }}</td>
                <td class="mono">{{ r.date }}</td>
                <td style="font-size:12px;color:var(--text2);">{{ r.remarks }}</td>
                <td>
                  <button class="btn sm pri" (click)="openConfirmModal(r)">✓ Confirm Pickup</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="9" style="text-align:center;color:var(--text3);padding:32px;">No pending requests.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Pickup Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">Confirm Pickup</span>
            <button class="close-btn" (click)="closeModal()">×</button>
          </div>
          <div class="modal-body">
            <div style="background:var(--surface2);border-radius:8px;padding:12px 14px;margin-bottom:18px;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:4px;">Pickup Request</div>
              <div style="font-size:14px;font-weight:600;">{{ selectedRequest()?.branch }}</div>
              <div style="font-size:12px;color:var(--text2);margin-top:2px;">
                {{ selectedRequest()?.csm }} · {{ selectedRequest()?.files }} files · {{ selectedRequest()?.boxes }} box · Requested: {{ selectedRequest()?.date }}
              </div>
            </div>
            <div class="form-row form-row-2">
              <div class="form-group">
                <label class="form-label">Expected Pickup Date</label>
                <input class="form-control" type="date" [(ngModel)]="confirmDate" />
              </div>
              <div class="form-group">
                <label class="form-label">POD / Consignment No.</label>
                <input class="form-control" type="text" [(ngModel)]="confirmPOD" placeholder="e.g. 421012960" />
              </div>
            </div>
            @if (formError()) {
              <div style="font-size:12px;color:var(--red);margin-top:6px;">Please fill in both fields before confirming.</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn" (click)="closeModal()">Cancel</button>
            <button class="btn pri" (click)="submitConfirm()">✓ Confirm Pickup</button>
          </div>
        </div>
      </div>
    }
  `
})
export class RequestForPickupComponent {
  data  = inject(DataService);
  toast = inject(ToastService);

  pending   = computed(() => this.data.kleetoRequests().filter(r => r.state === 'pending'));
  scheduled = computed(() => this.data.kleetoRequests().filter(r => r.state === 'scheduled'));
  totalFiles = computed(() => this.pending().reduce((s, r) => s + r.files, 0));

  showModal     = signal(false);
  selectedRequest = signal<PickupRequestKleeto | null>(null);
  confirmDate   = signal('');
  confirmPOD    = signal('');
  formError     = signal(false);

  openConfirmModal(r: PickupRequestKleeto): void {
    this.selectedRequest.set(r);
    this.confirmDate.set('');
    this.confirmPOD.set('');
    this.formError.set(false);
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  submitConfirm(): void {
    if (!this.confirmDate() || !this.confirmPOD().trim()) {
      this.formError.set(true);
      return;
    }
    const r = this.selectedRequest()!;
    const dateStr = new Date(this.confirmDate()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    this.data.confirmPickup(r.id, this.confirmPOD().trim(), dateStr);
    this.closeModal();
    this.toast.show(`${r.branch} confirmed · POD: ${this.confirmPOD()} → moved to Pickup Scheduled`);
  }
}
