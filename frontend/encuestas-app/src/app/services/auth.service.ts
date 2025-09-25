import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  loading = signal(false);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    this.loading.set(true);
    return this.http.post<any>('/auth/login', { email, password }).pipe(
      tap((r) => {
        this.loading.set(false);
        localStorage.setItem('token', r.token);
        localStorage.setItem('role', r.user?.role ?? '');
        localStorage.setItem('email', r.user?.email ?? '');
      })
    );
  }

  register(email: string, password: string, role: string = 'ADMIN'): Observable<any> {
    this.loading.set(true);
    return this.http.post<any>('/auth/register', { email, password, role }).pipe(
      tap((r) => {
        this.loading.set(false);
        localStorage.setItem('token', r.token);
        localStorage.setItem('role', r.user?.role ?? '');
        localStorage.setItem('email', r.user?.email ?? '');
      })
    );
  }

  me(): Observable<any> {
    return this.http.get<any>('/auth/me');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
