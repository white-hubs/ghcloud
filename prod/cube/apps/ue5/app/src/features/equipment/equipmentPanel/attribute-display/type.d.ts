export declare interface AttributeNode {
  attributeCode: string;
  attributeId: string;
  attributeName: string;
  attributeKeyValueVos: {
    keyName: string;
    value: string;
  }[];
  dataType: string;
  permission: string;
  valueMax: number | string;
  valueMin: number | string;
  attributeUnitName: string;
}
