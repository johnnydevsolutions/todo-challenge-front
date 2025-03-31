import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Quote {
  quote: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private readonly apiUrl = `${environment.apiUrl}/api/quote`;

  constructor(private http: HttpClient) {}

  getQuote(): Observable<Quote> {
    return this.http.get<Quote>(this.apiUrl);
  }
} 