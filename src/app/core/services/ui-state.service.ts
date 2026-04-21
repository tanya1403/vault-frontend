import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  pageTitle = signal('Dashboard');
  pageSubtitle = signal('');
  breadcrumb = signal<string[]>(['Operations', 'Dashboard']);

  setPageTitle(title: string, subtitle: string = '', breadcrumb: string[] = []) {
    this.pageTitle.set(title);
    this.pageSubtitle.set(subtitle);
    if (breadcrumb.length > 0) {
      this.breadcrumb.set(breadcrumb);
    }
  }
}
