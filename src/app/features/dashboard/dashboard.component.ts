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
  currentUser: any;

  counts: Record<string, number> = {
    'request-for-pickup': 0,
    'pickup-scheduled': 0,
    'intransit': 0,
    'delivered': 0,
    'cancelled-pickup': 0
  };

  private statusMap: Record<string, string> = {
    'request-for-pickup': 'Requested',
    'pickup-scheduled': 'Scheduled',
    'intransit': 'Intransit',
    'delivered': 'Delivered',
    'cancelled-pickup': 'Cancelled'
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private dataService: DataService,
    public ui: UiStateService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.checkRoles();
    
    // Fetch count for the current active tab only
    const currentTab = this.router.url.split('/').pop() || 'request-for-pickup';
    this.fetchCountForTab(currentTab);
  }

  isAdminFlag = false;
  isManagementFlag = false;
  isKleetoFlag = false;

  private checkRoles(): void {
    this.isAdminFlag = this.authService.isAdmin();
    this.isManagementFlag = this.authService.isManagement();
    this.isKleetoFlag = this.authService.isKleeto();
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

        // Sync with global DataService stats
        if (tab === 'request-for-pickup') {
          const totalFiles = dataArray.reduce((sum: number, r: any) => sum + (r.noOfFiles || r.No_Of_Files__c || 0), 0);
          this.dataService.updateCounts({ pending: dataArray.length, totalFiles: totalFiles });
          this.dataService.updateKleetoFromBackend(dataArray);
        } else if (tab === 'pickup-scheduled') {
          this.dataService.updateCounts({ scheduled: dataArray.length });
        } else if (tab === 'intransit') {
          this.dataService.updateCounts({ intransit: dataArray.length });
        } else if (tab === 'delivered') {
          this.dataService.updateCounts({ delivered: dataArray.length });
        } else if (tab === 'cancelled-pickup') {
          this.dataService.updateCounts({ cancelled: dataArray.length });
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isManagement(): boolean {
    return this.authService.isManagement();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
