export interface DictType {
  id: string;
  name: string;
  type_code: string;
  remark: string | null;
  status: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDictTypeInput {
  name: string;
  type_code: string;
  remark?: string;
  status?: boolean;
}

export interface UpdateDictTypeInput {
  name?: string;
  type_code?: string;
  remark?: string;
  status?: boolean;
}

export interface PaginatedDictTypes {
  data: DictType[];
  total: number;
  page: number;
  per_page: number;
}

export interface DictItem {
  id: string;
  dict_type_id: string;
  label: string;
  value: string;
  sort_order: number;
  status: boolean;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDictItemInput {
  dict_type_id: string;
  label: string;
  value: string;
  sort_order?: number;
  remark?: string;
  status?: boolean;
}

export interface UpdateDictItemInput {
  label?: string;
  value?: string;
  sort_order?: number;
  status?: boolean;
  remark?: string;
}

export interface DictItemsByType {
  type_code: string;
  items: DictItem[];
}
