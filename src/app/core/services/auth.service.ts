import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
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
        const token = response.data?.accessToken || response.accessToken;
        const refreshToken = response.data?.refreshToken || response.refreshToken;
        if (token) {
          this.setToken(token);
          if (refreshToken) {
            localStorage.setItem('refresh-token', refreshToken);
          }
          if (response.data?.user || response.user) {
            localStorage.setItem('user-data', JSON.stringify(response.data?.user || response.user));
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  getCurrentUser() {
    const data = localStorage.getItem('user-data');
    return data ? JSON.parse(data) : null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    return user.roles.some((r: string) => r.toUpperCase() === role.toUpperCase());
  }

  isCSM(): boolean {
    return this.hasRole('CSM');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isManagement(): boolean {
    return this.hasRole('MANAGEMENT');
  }

  isKleeto(): boolean {
    return this.hasRole('KLEETO');
  }

  register(userData: { username: string; password: string; fullName: string; role: string }): Observable<any> {
    return this.apiService.post<any>('/register', userData);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.apiService.post<any>('/refresh', { refreshToken }).pipe(
      tap(response => {
        const newAccessToken = response.data?.accessToken || response.accessToken;
        if (newAccessToken) {
          this.setToken(newAccessToken);
        }
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    this.apiService.post('/logout', { refreshToken }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('refresh-token');
    localStorage.removeItem('user-data');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh-token');
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
