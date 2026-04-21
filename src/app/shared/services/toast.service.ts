import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastList = signal<ToastMessage[]>([]);
  readonly toasts = this.toastList.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = Date.now();
    const newToast: ToastMessage = { id, message, type };
    
    this.toastList.update(all => [...all, newToast]);

    // Auto-remove after 5 seconds
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: number): void {
    this.toastList.update(all => all.filter(t => t.id !== id));
  }
}

