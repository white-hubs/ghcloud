import type { EventDataNode, DataNode } from '@ghcloud/cube-ui'

export interface GenreList {
  id: string;
  name: string;
}
export interface SearchType {
  name: string;
  type?: string;
  range?: string;
  pageNumber: number;
  pageSize: number;
}
export interface TableData {
  name: string;
  id: string;
  code: string;
  areaName: string;
}
export interface ModalTableData {
  name: string;
  code: string;
  id: string;
  level: number;
  parentId: string | null;
}
interface DefaultFileds {
  title?: string;
  key?: string;
  children?: string;
}
export interface SelectType {
  event: 'select';
  selected: boolean;
  node: EventDataNode;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}
export const defaultFileds: DefaultFileds = {
  title: 'name',
  key: 'id',
  children: 'children'
}
