export interface CorrectNorm {
  tenant?: string | undefined;
  tenantName?: string | undefined;
  productId?: string | undefined;
  productName?: string | undefined;
  normCode?: string | undefined;
  normName?: string | undefined;
  unit?: string | undefined;
  correctValue?: number | undefined;
  device?: {
    productId?: string | undefined;
    productName?: string | undefined;
    deviceList?: Device[];
    department?: { id: string;name: string; }[] | undefined;
  };
  handleTime?: string | number | undefined;
  handleUser?: unknown;
  cancelHandleTime?: string | number | undefined;
  cancelUser?: unknown;
  deptId?: string | undefined;
  deptName?: string | undefined;
  state?: CorrectState;
}

export enum CorrectState {
  INVAILD = 'INVAILD', // 无效
  VAILD = 'VAILD', // 有效
}

export interface Device {
  id?: string | undefined;
  name?: string | undefined;
}

export interface PropNorm {
  name: string;
  code: string;
  unit: string;
}
