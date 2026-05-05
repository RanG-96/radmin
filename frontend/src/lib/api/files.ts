import http from '../http';
import type { FileRecord, ListFilesParams, PaginatedFiles } from '../types/file';

export const filesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post<FileRecord>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (params?: ListFilesParams) =>
    http.get<PaginatedFiles>('/files', { params }),
  download: (id: string) => http.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => http.delete(`/files/${id}`),
};
