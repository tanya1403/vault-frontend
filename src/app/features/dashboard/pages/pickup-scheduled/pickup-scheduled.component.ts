import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-pickup-scheduled-page',
  templateUrl: './pickup-scheduled.component.html',
  styleUrls: ['./pickup-scheduled.component.scss']
})
export class PickupScheduledPageComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.apiService.get<any>('/pickup-requests?status=pickup-scheduled').subscribe({
      next: (res) => {
        const payload = res.data || res;
        this.data = Array.isArray(payload) ? payload : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load scheduled pickups.';
        this.loading = false;
      }
    });
  }
}
