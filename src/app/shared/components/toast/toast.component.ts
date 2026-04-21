import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  toastService = inject(ToastService);

  get toasts() {
    return this.toastService.toasts;
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
