export interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploader_id: string | null;
  uploader_name: string | null;
  created_at: string;
}

export interface PaginatedFiles {
  data: FileRecord[];
  total: number;
  page: number;
  per_page: number;
}

export interface ListFilesParams {
  page?: number;
  per_page?: number;
  keyword?: string;
  mime_type?: string;
}
