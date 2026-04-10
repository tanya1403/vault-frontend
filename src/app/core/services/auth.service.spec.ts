import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['post']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: rSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear localStorage before tests
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token and update state on successful login', () => {
    const mockResponse = { token: 'mock-jwt-token' };
    apiServiceSpy.post.and.returnValue(of(mockResponse));

    service.login({ username: 'user', password: 'pw' }).subscribe(() => {
      expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
      expect(service.hasToken()).toBeTrue();
    });
  });

  it('should clear token and navigate to login on logout', () => {
    localStorage.setItem('auth-token', 'some-token');
    service.logout();
    expect(localStorage.getItem('auth-token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
