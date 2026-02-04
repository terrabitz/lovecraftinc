export interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: 'employee' | 'anomaly' | 'organization';
  content: string;
}
