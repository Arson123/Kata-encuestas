import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  constructor(private http: HttpClient) {}

  summary(surveyId: string): Observable<any> {
    return this.http.get<any>(`/results/surveys/${surveyId}/summary`);
  }

  timeseries(surveyId: string, granularity: 'minute' | 'hour' | 'day' = 'hour'): Observable<any[]> {
    return this.http.get<any[]>(
      `/results/surveys/${surveyId}/timeseries?granularity=${granularity}`
    );
  }
}
