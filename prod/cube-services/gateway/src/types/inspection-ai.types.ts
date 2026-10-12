import type { InspectionResultOptionVO } from "@ghcloud/cube-service-interface/inspection-ai";

export interface InternalInspectionStandardItem {
  standardId: string;
  standardName: string;
  standard: Record<string, unknown>;
  itemId: string;
  itemName: string;
  item: Record<string, unknown>;
  resultId: string;
  resultName: string;
  options: InspectionResultOptionVO[];
}

export interface InspectionValidationResult {
  valid: boolean;
  errors: {
    code: string;
    message: string;
  }[];
}
