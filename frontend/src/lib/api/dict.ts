import http from '../http';
import type {
  CreateDictItemInput,
  CreateDictTypeInput,
  DictItem,
  DictItemsByType,
  DictType,
  PaginatedDictTypes,
  UpdateDictItemInput,
  UpdateDictTypeInput,
} from '../types/dict';

export const dictApi = {
  listTypes: (params?: { page?: number; per_page?: number; q?: string }) =>
    http.get<PaginatedDictTypes>('/admin/dict-types', { params }),
  getType: (id: string) => http.get<DictType>(`/admin/dict-types/${id}`),
  createType: (data: CreateDictTypeInput) => http.post<DictType>('/admin/dict-types', data),
  updateType: (id: string, data: UpdateDictTypeInput) =>
    http.put<DictType>(`/admin/dict-types/${id}`, data),
  deleteType: (id: string) => http.delete(`/admin/dict-types/${id}`),
  listItems: (dict_type_id: string) =>
    http.get<DictItem[]>('/admin/dict-items', { params: { dict_type_id } }),
  createItem: (data: CreateDictItemInput) => http.post<DictItem>('/admin/dict-items', data),
  updateItem: (id: string, data: UpdateDictItemInput) =>
    http.put<DictItem>(`/admin/dict-items/${id}`, data),
  deleteItem: (id: string) => http.delete(`/admin/dict-items/${id}`),
  getByTypeCode: (typeCode: string) => http.get<DictItemsByType>(`/dict/${typeCode}`),
};
