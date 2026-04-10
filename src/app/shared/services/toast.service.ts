import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(msg: string): void {
    console.log('[Toast]', msg);
    alert(msg);
  }
}
