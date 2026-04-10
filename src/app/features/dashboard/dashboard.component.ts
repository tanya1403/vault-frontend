import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  viewMode: 'HomeFirst' | 'Kleeto' = 'Kleeto';

  counts: Record<string, number> = {
    'request-for-pickup': 0,
    'pickup-scheduled': 0,
    'intransit': 0,
    'delivered': 0
  };

  private statusMap: Record<string, string> = {
    'request-for-pickup': 'created',
    'pickup-scheduled': 'pickup-scheduled',
    'intransit': 'Intransit',
    'delivered': 'Acknowledged'
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Only fetch the initial tab's count on login as requested
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
        this.counts[tab] = Array.isArray(payload) ? payload.length : 0;
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
