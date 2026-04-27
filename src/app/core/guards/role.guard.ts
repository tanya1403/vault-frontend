import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['role'] as Array<string>;
    const userRole = this.authService.getCurrentUser()?.roles?.[0];

    if (!userRole || !requiredRoles.includes(userRole)) {
      this.toast.show('Access Denied: You do not have permission to view this page.', 'error');
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
