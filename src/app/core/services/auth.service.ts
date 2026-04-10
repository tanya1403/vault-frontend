import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.apiService.post<any>('/login', credentials).pipe(
      tap(response => {
        // Handle Kotlin ApiResponse structure
        const token = response.data?.accessToken || response.accessToken;
        const refreshToken = response.data?.refreshToken || response.refreshToken;
        if (token) {
          this.setToken(token);
          if (refreshToken) {
            localStorage.setItem('refresh-token', refreshToken);
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh-token'); // Assuming we store this, or just pass empty if not.
    // Call the backend to invalidate tokens
    this.apiService.post('/logout', { refreshToken }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession() // Clear session even if backend fails
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('refresh-token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
