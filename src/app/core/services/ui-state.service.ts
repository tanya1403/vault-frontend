import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  pageTitle = signal('Dashboard');
  pageSubtitle = signal('');
  breadcrumb = signal<string[]>(['Courier Services', 'Dashboard']);

  setPageTitle(title: string,) {
    this.pageTitle.set(title);
    
  }
}
