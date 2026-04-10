import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-delivered-page',
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.scss']
})
export class DeliveredPageComponent implements OnInit {
  data: any[] = [];
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.apiService.get<any>('/pickup-requests?status=Acknowledged').subscribe({
      next: (res) => {
        const payload = res.data || res;
        this.data = Array.isArray(payload) ? payload : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load delivered shipments.';
        this.loading = false;
      }
    });
  }
}
