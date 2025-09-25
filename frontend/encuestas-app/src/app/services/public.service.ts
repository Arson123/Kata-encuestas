import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PublicService {
  constructor(private http: HttpClient) {}

  meta(publicId: string): Observable<any> {
    return this.http.get<any>(`/public/s/${publicId}`);
  }

  tree(publicId: string): Observable<any[]> {
    return this.http.get<any[]>(`/public/s/${publicId}/questions`);
  }

  submit(payload: any): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`/public/responses`, payload);
  }
}
