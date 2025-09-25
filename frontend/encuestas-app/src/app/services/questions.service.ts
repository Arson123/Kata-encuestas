import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  constructor(private http: HttpClient) {}

  listBySurvey(surveyId: string): Observable<any[]> {
    return this.http.get<any[]>(`/surveys/${surveyId}/questions`);
  }

  create(surveyId: string, payload: any): Observable<any> {
    return this.http.post<any>(`/surveys/${surveyId}/questions`, payload);
  }
}
