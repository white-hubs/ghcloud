import { SelectProps } from 'ant-design-vue'
import Keymaster from 'keymaster'

interface TableDataItem {
  controlType?: string;
  title: string;
  businessField: string | null;
  controlId: string;
  children?:TableDataItem[]
}
export const mapIdsToBusinessFields=(table:TableDataItem[], list: SelectProps["options"] | undefined)=> {
  // 创建一个映射表，将 controlId 映射到对应的 id
  const controlIdToIdMap:{[key:string]:key} = {};
  // 遍历 list 数组，填充映射表(业务流程ID：表单字段ID)
  list&&list.forEach((item) => {
      if (item.formItemId) {
        let ids= item.formItemId.split(',')
        controlIdToIdMap[ids[ids.length-1]] = item.id;
      }
  });

  // 遍历 table 数组，根据映射表更新 businessField
  table.forEach((item:TableDataItem) => {
      if (item.children) {
        item.controlType='RECEPTACLE'
        if (controlIdToIdMap[item.controlId]) {
            item.businessField = controlIdToIdMap[item.controlId] as unknown as string;
        }
          // 如果当前项有 children，递归处理 children
          // 更新 businessField
            mapIdsToBusinessFields(item.children, list);
      } else {
          // 更新 businessField
          if (controlIdToIdMap[item.controlId]) {
              item.businessField = controlIdToIdMap[item.controlId] as unknown as string;
          }
      }
  });
}
export const mapControlIdsToList=(list: SelectProps["options"] | undefined, table:TableDataItem[])=> {
  // 创建一个映射表，将 businessField 映射到对应的 table 对象的 controlId
  const businessFieldToControlIdMap :{[key:string]:key} = {};
  // 遍历 table 数组，填充映射表
  table.forEach((item: TableDataItem) => {
      if (item.businessField) {
          businessFieldToControlIdMap[item.businessField] = item.controlId as unknown as Keymaster;
      }
      if (item.children) {
          // 如果当前项有 children，递归处理 children
          item.children.forEach((child: TableDataItem) => {
              if (child.businessField) {
                  businessFieldToControlIdMap[child.businessField] = [item.controlId,child.controlId] as unknown as Keymaster;
              }
          });
      }
  });

// 遍历 list 数组，根据映射表更新 formItemId
  list&&list.forEach((item) => {
      if (businessFieldToControlIdMap[item.id]) {
          // 如果找到匹配的 businessField，则更新 formItemId
          item.formItemId = businessFieldToControlIdMap[item.id];
      }
  });
}