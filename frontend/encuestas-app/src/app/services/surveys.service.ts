import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SurveysService {
  constructor(private http: HttpClient) {}

  list(params?: Record<string, string | number | boolean | undefined>): Observable<any[]> {
    let p = new HttpParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) p = p.set(k, String(v));
    });
    return this.http.get<any[]>('/surveys', { params: p });
  }

  create(payload: { title: string; description?: string }): Observable<any> {
    return this.http.post<any>('/surveys', payload);
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(`/surveys/${id}`);
  }

  patchStatus(id: string, status: 'PUBLISHED' | 'DRAFT'): Observable<any> {
    return this.http.patch<any>(`/surveys/${id}`, { status });
  }
}
