export interface FilterOption {
  title: string;
  isDefault?: boolean;
  value: string | null;
}

export type FilterSearchParams = string;

export interface FilterSection<S extends FilterSearchParams> {
  title?: string;
  searchParam: S;
  displayHint: 'pill' | 'list';
  options: FilterOption[];
  enableCondition?: {
    searchParam: S;
    condition: 'is' | 'not';
    value: string;
  };
}

export type PostFilterSearchParams =
  'post_types' |
  'is_viewable' |
  'tier_ids' |
  'sort_by' |
  'date_published' |
  'search';

export type ProductFilterSearchParams =
  'is_viewable' |
  'sort_by' |
  'date_published' |
  'search';

export type MediaFilterSearchParams = 
  'source_type' |
  'is_viewable' |
  'tier_ids' |
  'sort_by' |
  'date_published';

export interface FilterData<S extends FilterSearchParams> {
  sections: FilterSection<S>[];
  external?: {
    searchParam: S;
  }[]
};

export interface Filter<S extends FilterSearchParams> {
  options: {
    searchParam: S;
    value: string | null;
  }[];
}