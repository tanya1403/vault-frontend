import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { DataService } from '../../shared/services/data.service';
import { UiStateService } from '../../core/services/ui-state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  viewMode: 'HomeFirst' | 'Kleeto' = 'Kleeto';
  showRoleDropdown = signal(false);

  counts: Record<string, number> = {
    'request-for-pickup': 0,
    'pickup-scheduled': 0,
    'intransit': 0,
    'delivered': 0
  };

  private statusMap: Record<string, string> = {
    'request-for-pickup': 'Requested',
    'pickup-scheduled': 'Scheduled',
    'intransit': 'Intransit',
    'delivered': 'Delivered'
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private dataService: DataService,
    public ui: UiStateService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.fetchCountForTab('request-for-pickup');
  }

  onNavClick(tab: string): void {
    this.fetchCountForTab(tab);
  }

  private fetchCountForTab(tab: string): void {
    const status = this.statusMap[tab];
    if (!status) return;

    this.apiService.get<any>(`/pickup-requests?status=${status}`).subscribe({
      next: (res) => {
        const payload = res.data || res;
        const dataArray = Array.isArray(payload) ? payload : [];
        this.counts[tab] = dataArray.length;
        
        if (tab === 'request-for-pickup') {
          this.dataService.updateKleetoFromBackend(dataArray);
        }
      },
      error: () => {
        this.counts[tab] = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
