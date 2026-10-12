import type { AlarmUploadFilePayload } from "@ghcloud/cube-service-interface/alarm-center";

export type AlarmUploadedFile = AlarmUploadFilePayload;

export const toAlarmUploadFiles = (files: AlarmUploadedFile[]): AlarmUploadFilePayload[] =>
  files
    .filter((file) => file.id)
    .map((file) => ({
      ...file,
      id: String(file.id),
    }));

export const toAlarmFileIds = (files: AlarmUploadedFile[]): string[] => files.map((file) => String(file.id ?? "")).filter(Boolean);
