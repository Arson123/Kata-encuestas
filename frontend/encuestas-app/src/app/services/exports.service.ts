import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportsService {
  constructor(private http: HttpClient) {}

  responsesCsv(surveyId: string): Observable<Blob> {
    const url = `/exports/surveys/${surveyId}/responses.csv`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
