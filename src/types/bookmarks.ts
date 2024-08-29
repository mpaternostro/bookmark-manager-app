export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentTabData {
  title: string;
  url: string;
  description?: string;
}
