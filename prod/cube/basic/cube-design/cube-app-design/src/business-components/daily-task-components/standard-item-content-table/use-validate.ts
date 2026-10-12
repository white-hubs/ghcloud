import type { StandardItemContent } from "./type";
import { ref, type Ref } from "vue";

interface UseValidate {
  isValid: Ref<boolean>;
  standardItemContent: Ref<StandardItemContent[]>;
  itemNameChange: (value: string, record: StandardItemContent) => void;
  contentChange: (value: string, record: StandardItemContent) => void;
  resultIdChange: (value: string, record: StandardItemContent) => void;
  defaultResultItemChange: (value: string, record: StandardItemContent) => void;
  mustTakePhotoResultChange: (value: string[], record: StandardItemContent) => void;
  mustRemarkResultChange: (value: string[], record: StandardItemContent) => void;
  tagChange: (value: string, record: StandardItemContent) => void;
  validate: (showItemName?: boolean) => Promise<boolean>;
}

// ==================== 验证辅助函数 ====================
/** 检查字符串是否为空（支持 trim） */
const isEmptyString = (value: string | undefined | null, trim = false): boolean => {
  if (value === undefined || value === null) {
    return true;
  }
  return trim ? value.trim().length === 0 : value.length === 0;
};

/** 检查数组是否为空 */
const isEmptyArray = (value: string[] | undefined | null): boolean => value === undefined || value === null || value.length === 0;

/** 设置验证错误状态 */
const setValidationError = (
  record: StandardItemContent,
  errorKey: keyof StandardItemContent,
  errorMsgKey: keyof StandardItemContent,
  errorMsg: string,
): void => {
  (record[errorKey] as boolean) = true;
  (record[errorMsgKey] as string) = errorMsg;
  record.isEdit = true;
};

/** 清除验证错误状态 */
const clearValidationError = (
  record: StandardItemContent,
  errorKey: keyof StandardItemContent,
  errorMsgKey: keyof StandardItemContent,
): void => {
  (record[errorKey] as boolean) = false;
  (record[errorMsgKey] as string) = "";
};

/** 创建字符串验证函数 */
const createStringValidator =
  (errorKey: keyof StandardItemContent, errorMsgKey: keyof StandardItemContent, errorMsg: string, trim = false) =>
  (value: string | undefined, record: StandardItemContent): void => {
    if (isEmptyString(value, trim)) {
      setValidationError(record, errorKey, errorMsgKey, errorMsg);
    } else {
      clearValidationError(record, errorKey, errorMsgKey);
    }
  };

/** 创建数组验证函数 */
const createArrayValidator =
  (errorKey: keyof StandardItemContent, errorMsgKey: keyof StandardItemContent, errorMsg: string) =>
  (value: string[] | undefined, record: StandardItemContent): void => {
    if (isEmptyArray(value)) {
      setValidationError(record, errorKey, errorMsgKey, errorMsg);
    } else {
      clearValidationError(record, errorKey, errorMsgKey);
    }
  };

export const useValidate = (): UseValidate => {
  const isValid = ref(false);
  const standardItemContent = ref<StandardItemContent[]>([]);

  // ==================== 验证函数 ====================
  const itemNameChange = createStringValidator("itemNameError", "itemNameErrorMsg", "请输入标准名称", true);
  const contentChange = createStringValidator("itemContentError", "itemContentErrorMsg", "请输入内容描述", true);
  const resultIdChange = createStringValidator("resultIdError", "resultIdErrorMsg", "请选择巡检结果", false);
  const defaultResultItemChange = createStringValidator("defaultResultItemError", "defaultResultItemErrorMsg", "请选择默认结果", false);
  const mustTakePhotoResultChange = createArrayValidator(
    "mustTakePhotoResultItemsError",
    "mustTakePhotoResultItemsErrorMsg",
    "请选择以下巡检结果必须拍照",
  );
  const mustRemarkResultChange = createArrayValidator(
    "mustRemarkResultItemsError",
    "mustRemarkResultItemsErrorMsg",
    "请选择以下巡检结果必须备注",
  );
  const tagChange = createStringValidator("tagError", "tagErrorMsg", "请选择标签", false);

  // ==================== 验证工具函数 ====================
  /** 检查记录是否有错误 */
  const hasErrors = (item: StandardItemContent): boolean =>
    Object.keys(item).some((key) => key.endsWith("Error") && item[key as keyof StandardItemContent] === true);

  /** 执行验证 */
  const validate = async (showItemName = false): Promise<boolean> => {
    try {
      standardItemContent.value.forEach((e) => {
        if (showItemName) {
          itemNameChange(e.itemName, e);
        }
        contentChange(e.itemContent, e);
        resultIdChange(e.resultId, e);
        defaultResultItemChange(e.defaultResultItem, e);
        mustTakePhotoResultChange(e.mustTakePhotoResultItems, e);
        mustRemarkResultChange(e.mustRemarkResultItems, e);
      });
      const containsErrors = standardItemContent.value.some(hasErrors);
      isValid.value = !containsErrors;
      return isValid.value;
    } catch {
      isValid.value = false;
      return false;
    }
  };

  return {
    isValid,
    standardItemContent,
    itemNameChange,
    contentChange,
    resultIdChange,
    defaultResultItemChange,
    mustTakePhotoResultChange,
    mustRemarkResultChange,
    tagChange,
    validate,
  };
};
