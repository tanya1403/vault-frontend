import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
    console.log(`[Toast][${type}]`, msg);
    alert(msg);
  }
}
