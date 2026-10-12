import type {
  QualityStatus,
  SafetyCreditCheckExecutionItemVO,
  SafetyCreditCheckExecutionSubmitCommand,
  SafetyCreditCheckItemVO,
  SafetyCreditChecklistVO,
  SafetyCreditCheckExecutionVO,
  SafetyCreditCheckPhotoVO,
  SafetyCreditId,
} from "@ghcloud/cube-safety-credit-service";

import { EXECUTABLE_CHECKLIST_STATUS, isCheckExecutionReadonlyStatus } from "@/constants/safety-credit-enums";
import { displayText, formatDateTime, trimText } from "@/utils/format";

export interface PhotoState {
  fileId: string;
  fileName: string;
  captureTime: string;
  filePath?: string;
  qualityStatus?: QualityStatus;
  qualityReason?: string;
}

export interface CheckItemState {
  itemId: SafetyCreditId;
  itemName: string;
  checked: boolean;
  remark: string;
  photos: PhotoState[];
  required: boolean;
  photoRequired: boolean;
}

export interface NativeUploadedFile {
  id?: string | null;
  ossId?: string | null;
  name?: string | null;
  path?: string | null;
  endpointPath?: string | null;
}

export const checkExecutionPageSize = 20;
export const maxCheckPhotoCount = 9;

function readBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function readId(value: unknown, fallback: string): SafetyCreditId {
  if (typeof value === "number") {
    return value;
  }
  return trimText(value) ?? fallback;
}

function nowText(): string {
  return formatDateTime(new Date());
}

export function normalizePhotos(photos?: SafetyCreditCheckPhotoVO[]): PhotoState[] {
  return (photos ?? []).map((photo, index) => {
    const fileId = trimText(photo.fileId ?? photo.file?.id ?? photo.id) ?? `photo-${index + 1}`;
    const state: PhotoState = {
      fileId,
      fileName: trimText(photo.file?.name ?? fileId) ?? fileId,
      captureTime: trimText(photo.captureTime) ?? nowText(),
    };
    const filePath = trimText(photo.file?.path ?? photo.file?.endpointPath);
    if (filePath !== undefined) {
      state.filePath = filePath;
    }
    const qualityStatus = photo.qualityStatus;
    if (qualityStatus !== undefined) {
      state.qualityStatus = qualityStatus;
    }
    const qualityReason = trimText(photo.qualityReason);
    if (qualityReason !== undefined) {
      state.qualityReason = qualityReason;
    }
    return state;
  });
}

export function nativeFileToPhoto(file: NativeUploadedFile, index: number): PhotoState | null {
  const fileId = trimText(file.id ?? file.ossId);
  if (fileId === undefined) {
    return null;
  }
  const photo: PhotoState = {
    fileId,
    fileName: trimText(file.name) ?? `图片${index + 1}`,
    captureTime: nowText(),
  };
  const filePath = trimText(file.path ?? file.endpointPath);
  if (filePath !== undefined) {
    photo.filePath = filePath;
  }
  return photo;
}

export function compactPhotos(photos: Array<PhotoState | null>): PhotoState[] {
  return photos.filter((photo): photo is PhotoState => photo !== null);
}

export function normalizeExecutionItem(item: SafetyCreditCheckExecutionItemVO, index: number): CheckItemState {
  const fallbackId = `item-${index + 1}`;
  return {
    itemId: readId(item.itemId ?? item.id, fallbackId),
    itemName: trimText(item.itemName) ?? `检查项${index + 1}`,
    checked: readBoolean(item.checked),
    remark: trimText(item.remark) ?? "",
    photos: normalizePhotos(item.photos),
    required: item.required ?? true,
    photoRequired: item.photoRequired ?? false,
  };
}

export function normalizeChecklistItem(item: SafetyCreditCheckItemVO, index: number): CheckItemState {
  const fallbackId = `item-${index + 1}`;
  return {
    itemId: readId(item.id, fallbackId),
    itemName: trimText(item.itemName) ?? `检查项${index + 1}`,
    checked: false,
    remark: "",
    photos: [],
    required: item.required ?? true,
    photoRequired: item.photoRequired ?? false,
  };
}

export function executionTitle(detail?: SafetyCreditCheckExecutionVO | SafetyCreditChecklistVO | null): string {
  return displayText(detail?.checkName ?? "安全自查");
}

export function executionPeriod(detail?: SafetyCreditCheckExecutionVO | null): string {
  if (detail?.cycleBegin !== undefined || detail?.cycleEnd !== undefined) {
    return `${formatDateTime(detail?.cycleBegin)} - ${formatDateTime(detail?.cycleEnd)}`;
  }
  return "--";
}

export function uniqueChecklists(records: SafetyCreditChecklistVO[]): SafetyCreditChecklistVO[] {
  const seen = new Set<string>();
  const result: SafetyCreditChecklistVO[] = [];
  for (const record of records) {
    const id = String(record.id);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(record);
  }
  return result;
}

export function checklistItemTotal(record: SafetyCreditChecklistVO): number {
  return record.itemCount ?? record.items?.length ?? 0;
}

export function isSameChecklist(
  execution: SafetyCreditCheckExecutionVO | null,
  checklist: SafetyCreditChecklistVO,
): execution is SafetyCreditCheckExecutionVO {
  return execution !== null && String(execution.checklistId) === String(checklist.id);
}

export function isEditableChecklist(checklist: SafetyCreditChecklistVO | null): checklist is SafetyCreditChecklistVO {
  return (
    checklist !== null && checklist.status === EXECUTABLE_CHECKLIST_STATUS && !isCheckExecutionReadonlyStatus(checklist.executionStatus)
  );
}

export function buildCheckExecutionPayload(items: CheckItemState[]): SafetyCreditCheckExecutionSubmitCommand {
  return {
    items: items.map((item) => ({
      itemId: item.itemId,
      checked: item.checked,
      remark: item.remark.trim(),
      photos: item.photos.map((photo) => ({
        fileId: photo.fileId,
        captureTime: photo.captureTime,
      })),
    })),
  };
}
