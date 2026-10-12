import type { FileVO, HazardAttachmentVO, HazardDetailVO } from "@ghcloud/cube-service-interface/hazard-governance";

export type UploadedPlanAttachment = FileVO & {
  fileId?: string | number;
  fileName?: string;
  url?: string;
};

type DetailWithPlanAttachments = Partial<HazardDetailVO> & {
  plan?: {
    attachments?: FileVO[];
  };
  planAttachments?: HazardAttachmentVO[];
};

export const normalizePlanAttachmentFiles = (files?: Array<FileVO | HazardAttachmentVO>): UploadedPlanAttachment[] =>
  (files ?? [])
    .map((file) => {
      if ("fileId" in file || "fileName" in file) {
        const source = file as HazardAttachmentVO & Partial<FileVO> & { url?: string };
        const id = source.fileId ?? source.id;
        if (id == null || String(id).trim() === "") {
          return undefined;
        }
        return {
          id,
          fileId: source.fileId,
          fileName: source.fileName,
          name: source.fileName ?? source.name ?? String(id),
          path: source.path,
          endpointPath: source.endpointPath,
          suffix: source.suffix,
          type: source.type,
          size: source.size,
          url: source.url,
        } satisfies UploadedPlanAttachment;
      }
      return file as UploadedPlanAttachment;
    })
    .filter((file): file is UploadedPlanAttachment => file != null);

export const getPlanAttachments = (detail?: DetailWithPlanAttachments | null): Array<FileVO | HazardAttachmentVO> | undefined => {
  if (!detail) {
    return undefined;
  }
  return detail.processInfo?.currentPlan?.attachments ?? detail.plan?.attachments ?? detail.planAttachments;
};
