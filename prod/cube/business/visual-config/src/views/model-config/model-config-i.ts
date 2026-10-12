import type { DataNode, EventDataNode } from 'ant-design-vue/es/tree'
import type { VNode } from 'vue'
interface DefaultFileds {
  title?: string;
  key?: string;
  children?: string;
}
interface PanelConfigModifyParams {
  panelPosition: PanelPosition;
  panelConfig: string | null;
}
export interface TabsListType {
  label: string;
  key: number;
  dom: VNode;
}

export const defaultFileds: DefaultFileds = {
  title: 'name',
  key: 'id',
  children: 'children'
}

export interface SelectType {
  event: 'select';
  selected: boolean;
  node: EventDataNode;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}

export interface PanelConfigType {
  areaId: string | number;
  sceneType: string;
  panelConfigModifyParams: PanelConfigModifyParams[];
}
