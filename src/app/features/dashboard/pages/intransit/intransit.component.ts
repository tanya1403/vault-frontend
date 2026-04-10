import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-intransit-page',
  templateUrl: './intransit.component.html',
  styleUrls: ['./intransit.component.scss']
})
export class IntransitPageComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.apiService.get<any>('/pickup-requests?status=Intransit').subscribe({
      next: (res) => {
        const payload = res.data || res;
        this.data = Array.isArray(payload) ? payload : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load intransit shipments.';
        this.loading = false;
      }
    });
  }
}
