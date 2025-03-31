import { Component, OnInit } from '@angular/core';
import { QuoteService, Quote } from '../../core/services/quote.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss'
})
export class QuoteComponent implements OnInit {
  quote: Quote | null = null;
  loading = false;
  error = false;

  constructor(private quoteService: QuoteService) {}

  ngOnInit() {
    this.fetchQuote();
  }

  fetchQuote() {
    this.loading = true;
    this.error = false;
    
    this.quoteService.getQuote().subscribe({
      next: (quote) => {
        this.quote = quote;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }
} 