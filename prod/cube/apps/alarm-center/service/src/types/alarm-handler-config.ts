export enum ALarmHanderFileUploadType {
  CAMERA = 'camera',
  ALBUM = 'album',
}

export enum ALarmHanderWatermarkType {
  LOCATION = 'location',
  TIMESTAMP = 'timestamp',
}

export interface AlarmHandlerConfigVO {
  requirePic?: boolean;
  uploadMethod?: ALarmHanderFileUploadType[] | null;
  watermark?: ALarmHanderWatermarkType[] | null;
}