export interface StandardVOS {
  itemVOS?: {
    itemId: string;
    itemName: string;
    itemImageFlag: true;
    itemResultId: string | number;
    itemResultName: string;
    itemResultValue: string;
    errorDesc: string;
    errorValueFlag: boolean;
    fileVOS: {
      businessKey: string;
      id: string;
      name: string;
      path: string;
      refCount: number;
      size: number;
      suffix: string;
      type: string;
    }[];
  }[];
  standardId: string | number;
  standardName: string;
  tempAddFlag: boolean;
  defaultStandard: boolean;
  code: string;
  name: string;
  id: string;
  enable: boolean;
  describe: string;
  standardItems: StandardItemType[];
}
export interface StandardItemType {
  alias?: string;
  content?: string;
  id?: string;
  imageFlag: false;
  isRawItem?: 0;
  name?: string;
  referType?: string;
  resultId?: string;
  resultItemValue: string;
  imageResult?: string;
  defaultStandard?: boolean;
  itemTag?: string | null;
  fileIds: string[];
  isEditMore?: boolean;
  isUploadImage?: boolean;
  tempAddFlag?: boolean;
  standardId?: string;
  standardName?: string;
  itemId?: string;
  itemName?: string;
  itemImageResult?: string;
  itemResultId?: string;
  itemResultValue?: string;
  itemResultName?: string;
  errorValueFlag?: boolean;
  errorDesc?: string;
  remarkResult?: string;
  fileVOS?: {
    businessKey: string;
    ossId: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[];
  resultVO?: {
    code: string;
    createBy: string;
    createTime: number;
    deleted: boolean;
    enable: boolean;
    id: string;
    itemNames: string;
    name: string;
    options: {
      errorFlag: boolean;
      itemName: string;
      itemValue: string;
    }[];
  };
}
