export interface SpecialNorm {
  tenant?: string | undefined;
  tenantName?: string | undefined;
  productId?: string | undefined;
  productName?: string | undefined;
  normCode?: string | undefined;
  normName?: string | undefined;
  unit?: string | undefined;
  unitName?: string | undefined;
  upperLimit?: number | undefined;
  lowerLimit?: number | undefined;
  upperLimitError?: boolean | undefined;
  lowerLimitError?: boolean | undefined;
  handleTime?: string | number | undefined;
}

export interface PropNorm {
  name: string;
  code: string;
  unit: string;
}
