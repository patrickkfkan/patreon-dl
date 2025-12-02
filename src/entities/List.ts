export interface List<T> {
  url: string; // API URL
  items: T[];
  total: number | null;
  nextURL: string | null;
}
