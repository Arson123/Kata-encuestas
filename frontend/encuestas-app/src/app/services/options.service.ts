import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OptionsService {
  constructor(private http: HttpClient) {}

  list(questionId: string): Observable<any[]> {
    return this.http.get<any[]>(`/questions/${questionId}/options`);
  }

  create(
    questionId: string,
    payload: { order: number; label: string; value: string }
  ): Observable<any> {
    return this.http.post<any>(`/questions/${questionId}/options`, payload);
  }
}
