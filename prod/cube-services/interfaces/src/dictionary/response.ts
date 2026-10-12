export interface DataDictionaryItem {
  id: string;
  code: string;
  remarks?: string;
  changeNotice?: string;
}

export interface DataDictionary {
  id: string;
  itemCode: string;
  name: string;
  code: string;
  status?: string;
  variable?: string;
  version?: string;
  remarks?: string;
}

/** 级联字典树节点（风险源分类等） */
export interface CascadeDictionaryItem {
  id?: string | number;
  code?: string;
  name?: string;
  itemCode?: string;
  remarks?: string;
  variable?: string;
  version?: string;
  nextList?: CascadeDictionaryItem[];
}
