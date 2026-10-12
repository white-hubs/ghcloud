import { CloseOutlined, DeleteOutlined, ExclamationCircleFilled, ReloadOutlined } from "@ant-design/icons-vue";
import { defineComponent, onBeforeUnmount, ref, shallowRef } from "vue";

import { HazardAiRecognitionCallResult, HazardSourceType } from "@ghcloud/cube-service-interface/hazard-governance";
import type { FileVO, HazardAiRecognitionResultVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { Button, Form, FormItem, Image, Input, Modal, Textarea, message } from "@ghcloud/cube-ui";

import type { DeviceInspectionTask } from "./device-inspection-data";
import { DroneHazardCategoryCascader, DroneRiskUnitObjectSelect } from "./drone-hazard-form-controls";
import {
  DroneHazardLocationPickerModal,
  type DroneHazardLocationPickerModalExpose,
  type DroneHazardLocationValue,
} from "./drone-hazard-location-picker-modal";
import type { DeviceInspectionTaskData } from "@/api/dashboard-service";
import {
  INSPECTION_COMMAND_SCREEN_SOURCE_SYSTEM,
  batchCreateHazardPendingConfirmation,
  recognizeHazardsByAi,
  uploadHazardSnapshot,
} from "@/api/hazard-report-service";

const AI_RECOGNITION_MIN_DESCRIPTION_LENGTH = 5;

type ModalContainerResolver = () => HTMLElement;
type DeviceHazardTask = DeviceInspectionTask | DeviceInspectionTaskData;
type DeviceHazardDefaultLocation = NonNullable<DeviceHazardTask["hazardDefaultLocation"]>;

interface HazardDraft {
  id: string;
  aiRecommendedCategoryId: string | number | undefined;
  categoryPath: string[];
  categoryNamePath: string[];
  description: string;
  disposalSuggestion: string;
  riskUnitId: string;
  riskUnitName: string;
  riskObjectId: string;
  riskObjectName: string;
  locationName: string;
  longitude: number | null;
  latitude: number | null;
}

interface OpenSnapshotOptions {
  file: File;
  previewUrl: string;
  task: DeviceHazardTask | null;
}

interface HazardCategorySelectedOption {
  label?: string;
  value?: string;
}

const readIdValue = (value: string | number | null | undefined): string => {
  return String(value ?? "").trim();
};

const readAiGeneratedDescription = (value: HazardAiRecognitionResultVO): string => {
  return String(value.hazardDescription ?? "").trim();
};

const readAiRecommendedCategoryId = (item: HazardAiRecognitionResultVO): string | number | undefined => {
  const record = item as HazardAiRecognitionResultVO & {
    aiRecommendCategoryId?: string | number;
    aiRecommendedHazardCategoryId?: string | number;
    aiRecommendedHazardTypeId?: string | number;
    categoryId?: string | number;
    hazardCategoryId?: string | number;
    recommendedCategoryId?: string | number;
    recommendedHazardCategoryId?: string | number;
    recommendedHazardTypeId?: string | number;
  };
  return (
    record.aiRecommendedCategoryId ??
    record.aiRecommendCategoryId ??
    record.aiRecommendedHazardCategoryId ??
    record.aiRecommendedHazardTypeId ??
    record.recommendedCategoryId ??
    record.recommendedHazardCategoryId ??
    record.recommendedHazardTypeId ??
    record.categoryId ??
    record.hazardCategoryId ??
    record.hazardTypeId
  );
};

const readAiRecommendedCategoryName = (item: HazardAiRecognitionResultVO): string => {
  const record = item as HazardAiRecognitionResultVO & {
    aiRecommendCategoryName?: string;
    aiRecommendedHazardCategoryName?: string;
    aiRecommendedHazardTypeName?: string;
    categoryName?: string;
    hazardCategoryName?: string;
    recommendedCategoryName?: string;
    recommendedHazardCategoryName?: string;
    recommendedHazardTypeName?: string;
  };
  return (
    record.aiRecommendedCategoryName ??
    record.aiRecommendCategoryName ??
    record.aiRecommendedHazardCategoryName ??
    record.aiRecommendedHazardTypeName ??
    record.recommendedCategoryName ??
    record.recommendedHazardCategoryName ??
    record.recommendedHazardTypeName ??
    record.categoryName ??
    record.hazardCategoryName ??
    record.hazardTypeName ??
    ""
  );
};

const readLastValue = (values: string[]): string | undefined => values.at(-1);

const readCategoryNamePath = (selectedOptions: HazardCategorySelectedOption[]): string[] =>
  selectedOptions.map((option) => option.label || "").filter(Boolean);

const createFallbackDraft = (description: string, defaultLocation: DeviceHazardDefaultLocation | null): HazardDraft => ({
  id: "hazard-0",
  aiRecommendedCategoryId: undefined,
  categoryPath: [],
  categoryNamePath: [],
  description,
  disposalSuggestion: "",
  riskUnitId: "",
  riskUnitName: "",
  riskObjectId: "",
  riskObjectName: "",
  locationName: defaultLocation?.locationName || "",
  longitude: defaultLocation?.longitude ?? null,
  latitude: defaultLocation?.latitude ?? null,
});

const buildDrafts = (
  hazards: HazardAiRecognitionResultVO[],
  fallbackDescription: string,
  defaultLocation: DeviceHazardDefaultLocation | null,
): HazardDraft[] => {
  return hazards.map((hazard, index) => {
    const aiRecommendedCategoryId = readAiRecommendedCategoryId(hazard);
    const aiRecommendedCategoryName = readAiRecommendedCategoryName(hazard);
    return {
      id: `ai-${aiRecommendedCategoryId ?? "unknown"}-${index}`,
      aiRecommendedCategoryId,
      categoryPath: aiRecommendedCategoryId === undefined ? [] : [String(aiRecommendedCategoryId)],
      categoryNamePath: aiRecommendedCategoryName ? [aiRecommendedCategoryName] : [],
      description: readAiGeneratedDescription(hazard) || fallbackDescription,
      disposalSuggestion: String(hazard.disposalSuggestion ?? "").trim(),
      riskUnitId: "",
      riskUnitName: "",
      riskObjectId: "",
      riskObjectName: "",
      locationName: defaultLocation?.locationName || "",
      longitude: defaultLocation?.longitude ?? null,
      latitude: defaultLocation?.latitude ?? null,
    };
  });
};

export const DroneHazardReportModal = defineComponent({
  name: "DroneHazardReportModal",
  props: {
    getContainer: {
      type: Function,
      required: false,
      default: undefined,
    },
  },
  setup(props, { expose }) {
    const open = shallowRef(false);
    const uploading = shallowRef(false);
    const recognizing = shallowRef(false);
    const submitting = shallowRef(false);
    const recognized = shallowRef(false);
    const snapshotPreviewUrl = shallowRef("");
    const uploadedFile = shallowRef<FileVO | null>(null);
    const currentTask = shallowRef<DeviceHazardTask | null>(null);
    const locationPickerModalRef = ref<DroneHazardLocationPickerModalExpose>();
    const pendingLocationDraft = shallowRef<HazardDraft>();
    const description = ref("");
    const drafts = ref<HazardDraft[]>([]);
    const uploadError = shallowRef("");
    const defaultLocation = shallowRef<DeviceHazardDefaultLocation | null>(null);

    async function openSnapshot(options: OpenSnapshotOptions): Promise<void> {
      revokePreview();
      snapshotPreviewUrl.value = options.previewUrl;
      currentTask.value = options.task;
      uploadedFile.value = null;
      uploadError.value = "";
      defaultLocation.value = null;
      description.value = "";
      drafts.value = [];
      recognized.value = false;
      open.value = true;
      uploading.value = true;
      try {
        uploadedFile.value = await uploadHazardSnapshot(options.file);
      } catch (error) {
        uploadError.value = error instanceof Error ? error.message : "现场照片上传失败";
        message.error(uploadError.value);
      } finally {
        uploading.value = false;
      }
    }

    const revokePreview = (): void => {
      if (snapshotPreviewUrl.value) {
        URL.revokeObjectURL(snapshotPreviewUrl.value);
      }
    };

    const close = (): void => {
      open.value = false;
      uploadedFile.value = null;
      currentTask.value = null;
      description.value = "";
      drafts.value = [];
      recognized.value = false;
      uploadError.value = "";
      defaultLocation.value = null;
      revokePreview();
      snapshotPreviewUrl.value = "";
    };

    const getUploadedFileId = (): string => {
      return readIdValue(uploadedFile.value?.id);
    };

    const validateAiRecognitionInput = (): string | undefined => {
      if (getUploadedFileId() || description.value.trim().length >= AI_RECOGNITION_MIN_DESCRIPTION_LENGTH) {
        return undefined;
      }
      if (!description.value.trim()) {
        return "请至少上传一张现场照片或填写隐患描述";
      }
      return `隐患描述至少填写${AI_RECOGNITION_MIN_DESCRIPTION_LENGTH}个字，或上传一张现场照片`;
    };

    const startRecognition = async (): Promise<void> => {
      if (uploading.value) {
        message.info("现场照片正在上传，请稍候");
        return;
      }
      if (uploadError.value) {
        message.error(uploadError.value);
        return;
      }
      const validationMessage = validateAiRecognitionInput();
      if (validationMessage) {
        message.warning(validationMessage);
        return;
      }
      recognizing.value = true;
      try {
        defaultLocation.value = resolveDefaultLocation();
        const fileId = getUploadedFileId();
        const desc = description.value.trim();
        const response = await recognizeHazardsByAi({
          ...(fileId ? { fileId } : {}),
          ...(desc ? { description: desc } : {}),
        });
        if (response.callResult === HazardAiRecognitionCallResult.FAILED) {
          throw new Error(response.failureReason || "AI识别失败");
        }
        const fallbackDescription = String(response.hazardDescription ?? "").trim() || desc;
        const nextDrafts = buildDrafts(response.hazards || [], fallbackDescription, defaultLocation.value);
        drafts.value =
          nextDrafts.length > 0 ? nextDrafts : fallbackDescription ? [createFallbackDraft(fallbackDescription, defaultLocation.value)] : [];
        recognized.value = true;
        if (drafts.value.length === 0) {
          message.warning("AI未识别出隐患，请补充描述后重新识别");
        }
      } catch (error) {
        message.error(error instanceof Error ? error.message : "AI识别失败");
      } finally {
        recognizing.value = false;
      }
    };

    const resolveDefaultLocation = (): DeviceHazardDefaultLocation | null => {
      if (defaultLocation.value) {
        return defaultLocation.value;
      }
      return currentTask.value?.hazardDefaultLocation || null;
    };

    const submit = async (): Promise<void> => {
      if (!recognized.value) {
        await startRecognition();
        return;
      }
      const fileId = getUploadedFileId();
      const validDrafts = drafts.value.filter((draft) => draft.description.trim());
      if (validDrafts.length === 0) {
        message.warning("请至少保留一条识别隐患");
        return;
      }
      if (validDrafts.some((draft) => !readLastValue(draft.categoryPath) || !draft.description.trim())) {
        message.warning("请补全识别隐患的三级品类和描述");
        return;
      }
      submitting.value = true;
      try {
        await batchCreateHazardPendingConfirmation(
          validDrafts.map((draft) => {
            const categoryId = readLastValue(draft.categoryPath) || "";
            return {
              description: draft.description.trim(),
              sourceType: HazardSourceType.MANUAL,
              applicationCode: INSPECTION_COMMAND_SCREEN_SOURCE_SYSTEM,
              categoryId,
              aiRecommendedCategoryId: draft.aiRecommendedCategoryId ?? categoryId,
              ...(fileId ? { sceneImages: fileId } : {}),
              ...(draft.riskUnitId ? { riskUnitId: draft.riskUnitId } : {}),
              ...(draft.riskObjectId ? { riskObjectId: draft.riskObjectId } : {}),
              ...(draft.locationName.trim() ? { locationName: draft.locationName.trim() } : {}),
              ...(draft.longitude !== undefined && draft.longitude !== null ? { longitude: draft.longitude } : {}),
              ...(draft.latitude !== undefined && draft.latitude !== null ? { latitude: draft.latitude } : {}),
            };
          }),
        );
        message.success("隐患已上报，等待治理确认");
        close();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "隐患上报失败");
      } finally {
        submitting.value = false;
      }
    };

    const updateDraftDescription = (draft: HazardDraft, value: string): void => {
      draft.description = value;
    };

    const updateDraftCategory = (draft: HazardDraft, value: unknown, selectedOptions: HazardCategorySelectedOption[]): void => {
      draft.categoryPath = Array.isArray(value) ? value.map(String) : [];
      draft.categoryNamePath = readCategoryNamePath(selectedOptions);
    };

    const updateDraftLocationName = (draft: HazardDraft, value: string): void => {
      draft.locationName = value;
    };

    const openLocationPicker = (draft: HazardDraft): void => {
      pendingLocationDraft.value = draft;
      locationPickerModalRef.value?.openModal({
        locationName: draft.locationName,
        longitude: draft.longitude,
        latitude: draft.latitude,
      });
    };

    const handleLocationSelected = (value: DroneHazardLocationValue): void => {
      if (!pendingLocationDraft.value) {
        return;
      }
      pendingLocationDraft.value.locationName = value.locationName;
      pendingLocationDraft.value.longitude = value.longitude;
      pendingLocationDraft.value.latitude = value.latitude;
      pendingLocationDraft.value = undefined;
    };

    const removeDraft = (draft: HazardDraft): void => {
      drafts.value = drafts.value.filter((item) => item.id !== draft.id);
    };

    const resolvePopupContainer = (): HTMLElement => {
      return (
        (document.querySelector(".drone-hazard-report-wrap .inspection-command-screen-modal-content") as HTMLElement | null) ||
        (document.querySelector(".drone-hazard-report-wrap .ant-modal-content") as HTMLElement | null) ||
        (props.getContainer as ModalContainerResolver | undefined)?.() ||
        document.body
      );
    };

    const getLocationPickerContainerProps = (): { getContainer?: ModalContainerResolver } => {
      return props.getContainer ? { getContainer: props.getContainer as ModalContainerResolver } : {};
    };

    onBeforeUnmount(() => {
      revokePreview();
    });

    expose({ openSnapshot });

    const renderFooter = () => (
      <div class="drone-hazard-footer">
        <Button onClick={close}>取消</Button>
        <Button
          type="primary"
          loading={uploading.value || recognizing.value || submitting.value}
          disabled={Boolean(uploadError.value) || uploading.value}
          onClick={submit}
        >
          {recognized.value ? "上报隐患" : "AI识别"}
        </Button>
      </div>
    );

    return () => (
      <Modal
        open={open.value}
        width={760}
        footer={renderFooter()}
        closable={false}
        maskClosable={false}
        wrapClassName="drone-hazard-report-wrap"
        class="drone-hazard-report-modal"
        getContainer={props.getContainer as ModalContainerResolver | undefined}
        title={
          <div class="drone-hazard-title">
            <span>
              <ExclamationCircleFilled />
              隐患上报
            </span>
            <button type="button" onClick={close}>
              <CloseOutlined />
            </button>
          </div>
        }
      >
        <div class="modal-content">
          <div class="drone-hazard-section">
            <div class="drone-hazard-label">现场照片</div>
            <div class="drone-hazard-photo-list">
              <div class="drone-hazard-photo-item">
                {snapshotPreviewUrl.value ? (
                  <Image src={snapshotPreviewUrl.value} alt="实时视频截帧" width={118} height={88} preview={{ mask: "预览" }} />
                ) : null}
                <span>{uploading.value ? "上传中" : uploadError.value ? "上传失败" : "已上传"}</span>
              </div>
            </div>
          </div>
          <div class="drone-hazard-section">
            <div class="drone-hazard-label">隐患描述（选填）</div>
            <Textarea
              v-model:value={description.value}
              rows={3}
              maxlength={1000}
              placeholder="请描述隐患情况，越详细AI识别越准确"
              disabled={recognized.value}
            />
          </div>
          {recognized.value ? (
            <div class="drone-hazard-section">
              <div class="drone-hazard-recognition-head">
                <div class="drone-hazard-label">AI识别结果</div>
                <Button size="small" onClick={startRecognition} disabled={recognizing.value}>
                  <ReloadOutlined />
                  重新识别
                </Button>
              </div>
              <div class="drone-hazard-draft-list">
                {drafts.value.length > 0 ? (
                  drafts.value.map((draft) => (
                    <div class="drone-hazard-draft" key={draft.id}>
                      <div class="drone-hazard-draft-head">
                        <span>{draft.categoryNamePath.at(-1) || "未识别分类"}</span>
                        <button type="button" onClick={() => removeDraft(draft)}>
                          <DeleteOutlined />
                          删除
                        </button>
                      </div>
                      <Form layout="vertical" model={draft}>
                        <FormItem label="隐患类型" required>
                          <DroneHazardCategoryCascader
                            v-model:value={draft.categoryPath}
                            placeholder="请选择一级 / 二级 / 三级类型"
                            getPopupContainer={resolvePopupContainer}
                            onChange={(value: unknown, selectedOptions: HazardCategorySelectedOption[]) =>
                              updateDraftCategory(draft, value, selectedOptions)
                            }
                          />
                        </FormItem>
                        <FormItem label="描述" required>
                          <Textarea
                            value={draft.description}
                            rows={2}
                            maxlength={1000}
                            placeholder="请输入隐患描述"
                            onUpdate:value={(value: string) => updateDraftDescription(draft, value)}
                          />
                        </FormItem>
                        <FormItem class="drone-risk-unit-object-form-item">
                          <DroneRiskUnitObjectSelect
                            v-model:unitValue={draft.riskUnitId}
                            v-model:unitName={draft.riskUnitName}
                            v-model:objectValue={draft.riskObjectId}
                            v-model:objectName={draft.riskObjectName}
                            getPopupContainer={resolvePopupContainer}
                          />
                        </FormItem>
                        <FormItem label="位置">
                          <div class="drone-hazard-location-row">
                            <Input
                              value={draft.locationName}
                              placeholder="请输入位置名称，或通过地图选择"
                              onUpdate:value={(value: string) => updateDraftLocationName(draft, value)}
                            />
                            <Button onClick={() => openLocationPicker(draft)}>选择位置</Button>
                          </div>
                        </FormItem>
                        {draft.disposalSuggestion ? <p>{draft.disposalSuggestion}</p> : null}
                      </Form>
                    </div>
                  ))
                ) : (
                  <div class="drone-hazard-empty">暂无识别结果</div>
                )}
              </div>
              {drafts.value.length > 0 ? (
                <div class="drone-hazard-levels">
                  {drafts.value.map((draft) => (
                    <span key={draft.id}>{draft.categoryNamePath.join(" / ") || "未选择品类"}</span>
                  ))}
                </div>
              ) : null}
              <DroneHazardLocationPickerModal
                ref={locationPickerModalRef}
                {...getLocationPickerContainerProps()}
                onSelected={handleLocationSelected}
              />
            </div>
          ) : null}
        </div>
      </Modal>
    );
  },
});
