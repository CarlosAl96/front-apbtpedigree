export interface QueryPagination {
  page: number;
  size: number;
  search?: string;
  orderBy?: string;
  order?: string;
  active?: number;
  previous?: string;
}
