declare namespace propertyManagement {
  interface InventoryDetailFormState {
    class: string;
    assetCode: string;
    assetName: string;
    purchaseDate: string;
    model: string;
    timeLimit: string;
    unit: string;
    num: string;
    source: string;
    initValue: string;
    time: string;
    administrators: string;
    equipmentCode: string;
    area: string;
    site: string;
    pic: string[];
    remark: string;
    supplier: string;
    contact: string;
    contactWay: string;
    maintenancePeriod: string;
    maintenanceExplain: string;
    file: any[];
  }
  interface CustomUploadState {
    onProgress: (event: { percent: number; }) => void;
    onError: (event: Error, body?: Record<string, unknown>) => void;
    onSuccess: (body: Record<string, unknown>) => void;
    data: Record<string, unknown>;
    filename: string;
    file: File;
    withCredentials: boolean;
    action: string;
    headers: Record<string, unknown>;
  }
}
