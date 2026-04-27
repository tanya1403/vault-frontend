import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-user-registration-page',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationPageComponent implements OnInit {
  registerForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  roleData: Record<string, { desc: string, chips: { label: string, ok: boolean }[] }> = {
    'CSM': {
      desc: 'Customer Success Manager role with visibility into branch pickups and document statuses.',
      chips: [
        { label: 'Pickup View', ok: true },
        { label: 'Vault View', ok: true },
        { label: 'Schedule Pickup', ok: false },
        { label: 'Create User', ok: false }
      ]
    },
    'BM': {
      desc: 'Manage branch-level pickup requests and scheduling.',
      chips: [
        { label: 'Pickup View', ok: true },
        { label: 'Schedule Pickup', ok: true },
        { label: 'Vault View', ok: true },
        { label: 'Create User', ok: false }
      ]
    },
    'ADMIN': {
      desc: 'Full system access including user management and global configurations.',
      chips: [
        { label: 'Pickup View', ok: true },
        { label: 'Schedule Pickup', ok: true },
        { label: 'Vault View', ok: true },
        { label: 'Create User', ok: true }
      ]
    },
    'OPS': {
      desc: 'Operational fulfillment, transit tracking and delivered status management.',
      chips: [
        { label: 'Pickup View', ok: true },
        { label: 'Transit Tracking', ok: true },
        { label: 'Vault View', ok: true },
        { label: 'Create User', ok: false }
      ]
    },
    'KLEETO': {
      desc: 'Kleeto internal administrative access for managing vault infrastructure and system-wide configurations.',
      chips: [
        { label: 'Pickup View', ok: true },
        { label: 'Schedule Pickup', ok: true },
        { label: 'Vault View', ok: true },
        { label: 'System Admin', ok: true }
      ]
    }
  };

  currentRoleInfo = signal(this.roleData['CSM']);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ui: UiStateService,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      username: ['', [Validators.required, Validators.maxLength(150)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      role: ['CSM', [Validators.required]]
    });

    // Watch for role changes
    this.registerForm.get('role')?.valueChanges.subscribe(r => {
      this.currentRoleInfo.set(this.roleData[r] || this.roleData['CSM']);
    });
  }

  ngOnInit(): void {
    this.ui.setPageTitle('Register New User', 'Admin · Control Panel');
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    const payload = {
      username: this.registerForm.value.username.trim(),
      password: this.registerForm.value.password,
      fullName: this.registerForm.value.fullName.trim(),
      role: this.registerForm.value.role
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.show('User account created successfully!', 'success');
        this.registerForm.reset({ role: 'CSM' });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
        this.toast.show(this.errorMessage(), 'error');
      }
    });
  }
}
