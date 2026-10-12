export interface StandardLeveTab {
  tabIndex: string;
  id?: string;
  name: string;
  properties: StandardItem[];
  isEditName: boolean;
}

export interface StandardItem {
  id?: string;
  productId: string;
  productName: string;
  propertyCode: string;
  propertyName: string;
  maxVal: number;
  minVal: number;
  tenantId: string;
  propertyUnit: string;
  minValOrigin: number;
  maxValOrigin: number;
  maxValError?: boolean | undefined;
  maxValErrorMsg?: string | undefined;
  minValError?: boolean | undefined;
  minValErrorMsg?: string | undefined;
  isEdit: boolean;
}