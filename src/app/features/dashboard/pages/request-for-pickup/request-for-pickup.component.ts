import { Component, inject, computed, signal } from '@angular/core';
import { DataService } from '../../../../shared/services/data.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { PickupRequestKleeto } from '../../../../shared/models/models';

@Component({
  selector: 'app-request-for-pickup-page',
  templateUrl: './request-for-pickup.component.html',
  styleUrls: ['./request-for-pickup.component.scss']
})
export class RequestForPickupPageComponent {
  data  = inject(DataService);
  toast = inject(ToastService);

  pending   = computed(() => this.data.kleetoRequests().filter(r => r.state === 'pending'));
  scheduled = computed(() => this.data.kleetoRequests().filter(r => r.state === 'scheduled'));
  totalFiles = computed(() => this.pending().reduce((s, r) => s + r.files, 0));

  showModal       = signal(false);
  selectedRequest = signal<PickupRequestKleeto | null>(null);
  confirmDate     = signal('');
  confirmPOD      = signal('');
  formError       = signal(false);

  openConfirmModal(r: PickupRequestKleeto): void {
    this.selectedRequest.set(r);
    this.confirmDate.set('');
    this.confirmPOD.set('');
    this.formError.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitConfirm(): void {
    if (!this.confirmDate() || !this.confirmPOD().trim()) {
      this.formError.set(true);
      return;
    }
    const r = this.selectedRequest()!;
    const dateStr = new Date(this.confirmDate()).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    this.data.confirmPickup(r.id, this.confirmPOD().trim(), dateStr);
    this.closeModal();
    this.toast.show(`${r.branch} confirmed · POD: ${this.confirmPOD()} → moved to Pickup Scheduled`);
  }
}
