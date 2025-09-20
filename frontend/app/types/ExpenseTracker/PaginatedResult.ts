import { TransactionShape } from './Transaction';

export interface PaginatedResult {
  items: TransactionShape[];
  metadata: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

