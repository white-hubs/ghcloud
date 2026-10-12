import type { TaskResultItemModel } from "@ghcloud/cube-daily-task-service";

export interface StandardItemContent {
  itemId: string | undefined;
  itemName: string | undefined;
  itemContent: string | undefined;
  operationGuide?: string | undefined;
  resultId: string | undefined;
  resultName: string | undefined;
  defaultResultItem: string | undefined;
  mustTakePhotoResultItems: string[] | undefined;
  mustRemarkResultItems: string[] | undefined;
  tag: string | undefined;
  source: "new" | "called";
  isEdit?: boolean;
  itemNameError?: boolean | undefined;
  itemNameErrorMsg?: string | undefined;
  itemContentError?: boolean | undefined;
  itemContentErrorMsg?: string | undefined;
  resultIdError?: boolean | undefined;
  resultIdErrorMsg?: string | undefined;
  defaultResultItemError?: boolean | undefined;
  defaultResultItemErrorMsg?: string | undefined;
  mustRemarkResultItemsError?: boolean | undefined;
  mustRemarkResultItemsErrorMsg?: string | undefined;
  mustTakePhotoResultItemsError?: boolean | undefined;
  mustTakePhotoResultItemsErrorMsg?: string | undefined;
  tagError?: boolean | undefined;
  tagErrorMsg?: string | undefined;
  resultLabelList?: TaskResultItemModel[] | undefined;
  errResultLabelList?: TaskResultItemModel[] | undefined;
}
