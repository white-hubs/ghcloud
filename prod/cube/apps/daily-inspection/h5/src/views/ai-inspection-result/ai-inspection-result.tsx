import dayjs from "dayjs";
import { Button, Field, Icon, Image as VanImage, Loading, Popup, Radio, RadioGroup, showNotify } from "vant";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type {
  InspectionImageAnalyzeGroup,
  InspectionImageAnalyzeResponse,
  InspectionImageAnalyzeResultItem,
  InspectRecordResultSource,
} from "@ghcloud/cube-daily-inspection-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { inspectionAiClient } from "@ghcloud/cube-services-client";

import {
  buildCommandModelsFromAnalyzeResult,
  buildStandardItemConfigMap,
  buildSubmitCommand,
  resolveSubmitTarget,
} from "./ai-inspection-submit";
import type { AiInspectionFile, AiInspectionResultOption } from "./mock";
import { cubeDailyInspectionService, cubeFileService } from "@/api/server";
import { Bar } from "@/components/bar/bar";
import { useAuthRequest } from "@/hooks/use-auth-request";

import styles from "./ai-inspection-result.module.less";

type Stage = "takingPhoto" | "recognizing" | "recognizeFailed" | "ready" | "failed";
type ResultType = "abnormal" | "normal" | "unknown";

interface PageInspectionItem {
  id: string;
  itemName: string;
  standardId: string;
  standardName: string;
  areaName: string;
  resultValue: string;
  problemDesc: string;
  evidence: string;
  suggestion: string;
  recognized: boolean;
  attachments: AiInspectionFile[];
  options: AiInspectionResultOption[];
  sourceType: ResultType;
  imageResult?: string | string[];
  remarkResult?: string | string[];
  manualCompleted: boolean;
}

type MutableAnalyzeItem = InspectionImageAnalyzeResultItem & { attachments?: AiInspectionFile[]; manualCompleted?: boolean };

interface AnalyzeItemSource {
  type: ResultType;
  groupIndex: number;
  itemIndex: number;
  group: InspectionImageAnalyzeGroup;
  item: MutableAnalyzeItem;
}

export const AiInspectionResult = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stage = ref<Stage>("takingPhoto");
    const started = ref(false);
    const activeTab = ref<ResultType>("abnormal");
    const result = ref<InspectionImageAnalyzeResponse>();
    const photo = ref<AiInspectionFile>();
    const location = ref("--");
    const safetyTipsSource = ref<unknown>();
    const takenAt = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    const optionPopup = ref(false);
    const currentItemId = ref("");
    const selectedResultValue = ref("");
    const resultVersion = ref(0);
    const manualPopup = ref(false);
    const manualItem = ref<PageInspectionItem>();
    const manualResultValue = ref("");
    const manualDesc = ref("");
    const submitLoading = ref(false);
    const hasManualIntervention = ref(false);
    const photoInputRef = ref<HTMLInputElement>();
    const attachmentInputRef = ref<HTMLInputElement>();
    const attachmentTargetId = ref("");

    const isImage = (file: AiInspectionFile): boolean => ["jpg", "jpeg", "png", "gif", "webp"].includes(file.type.toLowerCase());

    const getSelectedOption = (item: PageInspectionItem) => item.options.find((option) => option.itemValue === item.resultValue);

    const resultValueInConfig = (config: string | string[] | undefined, resultValue: string): boolean => {
      if (!resultValue) {
        return false;
      }
      if (Array.isArray(config)) {
        return config.includes(resultValue);
      }
      return config?.includes(resultValue) ?? false;
    };

    const requiresRemark = (item: PageInspectionItem, resultValue = item.resultValue): boolean =>
      resultValueInConfig(item.remarkResult, resultValue);

    const requiresImage = (item: PageInspectionItem, resultValue = item.resultValue): boolean =>
      resultValueInConfig(item.imageResult, resultValue);

    const getResultType = (item: PageInspectionItem): ResultType => {
      if (!item.recognized) {
        return "unknown";
      }
      return getSelectedOption(item)?.errorFlag ? "abnormal" : "normal";
    };

    const getGroups = (type: ResultType): InspectionImageAnalyzeGroup[] => {
      if (!result.value) {
        return [];
      }
      if (type === "normal") {
        return result.value.normalItems ?? [];
      }
      if (type === "abnormal") {
        return result.value.abnormalItems ?? [];
      }
      return result.value.unrecognizedItems ?? [];
    };

    const setGroups = (target: InspectionImageAnalyzeResponse, type: ResultType, groups: InspectionImageAnalyzeGroup[]): void => {
      if (type === "normal") {
        target.normalItems = groups;
      } else if (type === "abnormal") {
        target.abnormalItems = groups;
      } else {
        target.unrecognizedItems = groups;
      }
    };

    const getItemOptions = (item: InspectionImageAnalyzeResultItem): AiInspectionResultOption[] =>
      item.resultVO?.options?.map((option) => ({
        itemName: option.itemName,
        itemValue: option.itemValue,
        errorFlag: option.errorFlag,
      })) ?? [];

    const buildInspectionImageAnalyzeRequest = (imageId: string): Parameters<typeof inspectionAiClient.analyzeInspectionImage>[0] => ({
      images: imageId,
      id: (route.query.taskId as string) ?? "",
      objId: (route.query.targetId as string) ?? "",
    });

    const cloneGroups = (groups: InspectionImageAnalyzeGroup[] = []): InspectionImageAnalyzeGroup[] =>
      groups.map((group) => ({
        ...group,
        standardItems: (group.standardItems ?? []).map((item) => ({
          ...item,
          ...(item.result ? { result: { ...item.result } } : {}),
          ...(item.resultVO
            ? {
                resultVO: {
                  ...item.resultVO,
                  options: [...item.resultVO.options],
                },
              }
            : {}),
          attachments: [...((item as MutableAnalyzeItem).attachments ?? [])],
        })),
      }));

    const updateAnalyzeResult = (updater: (draft: InspectionImageAnalyzeResponse) => void): void => {
      if (!result.value) {
        return;
      }
      const draft: InspectionImageAnalyzeResponse = {
        ...result.value,
        normalItems: cloneGroups(result.value.normalItems),
        abnormalItems: cloneGroups(result.value.abnormalItems),
        unrecognizedItems: cloneGroups(result.value.unrecognizedItems),
      };
      updater(draft);
      result.value = draft;
      resultVersion.value += 1;
    };

    const findAnalyzeItemSource = (target: InspectionImageAnalyzeResponse, id: string): AnalyzeItemSource | undefined => {
      const types: ResultType[] = ["abnormal", "normal", "unknown"];
      for (const type of types) {
        const groups =
          type === "normal"
            ? (target.normalItems ?? [])
            : type === "abnormal"
              ? (target.abnormalItems ?? [])
              : (target.unrecognizedItems ?? []);
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
          const group = groups[groupIndex];
          const items = group.standardItems ?? [];
          const itemIndex = items.findIndex((item) => (item.itemId ?? item.itemName ?? "") === id);
          if (itemIndex >= 0) {
            return { type, groupIndex, itemIndex, group, item: items[itemIndex] as MutableAnalyzeItem };
          }
        }
      }
      return undefined;
    };

    const removeAnalyzeItem = (target: InspectionImageAnalyzeResponse, source: AnalyzeItemSource): void => {
      const groups = [...getGroupsFromResponse(target, source.type)];
      const group = { ...groups[source.groupIndex], standardItems: [...(groups[source.groupIndex].standardItems ?? [])] };
      group.standardItems.splice(source.itemIndex, 1);
      groups[source.groupIndex] = group;
      setGroups(
        target,
        source.type,
        groups.filter((item) => (item.standardItems ?? []).length > 0),
      );
    };

    const appendAnalyzeItem = (
      target: InspectionImageAnalyzeResponse,
      type: ResultType,
      group: InspectionImageAnalyzeGroup,
      item: InspectionImageAnalyzeResultItem,
    ): void => {
      const groups = [...getGroupsFromResponse(target, type)];
      const groupIndex = groups.findIndex(
        (current) => current.standardId === group.standardId && current.standardName === group.standardName,
      );
      if (groupIndex >= 0) {
        const current = groups[groupIndex];
        groups[groupIndex] = {
          ...current,
          standardItems: [...(current.standardItems ?? []), item],
        };
      } else {
        groups.push({
          ...group,
          standardItems: [item],
        });
      }
      setGroups(target, type, groups);
    };

    const getGroupsFromResponse = (target: InspectionImageAnalyzeResponse, type: ResultType): InspectionImageAnalyzeGroup[] => {
      if (type === "normal") {
        return target.normalItems ?? [];
      }
      if (type === "abnormal") {
        return target.abnormalItems ?? [];
      }
      return target.unrecognizedItems ?? [];
    };

    const getAnalyzeItemId = (item: InspectionImageAnalyzeResultItem): string => item.itemId ?? item.itemName ?? "";

    const mergeInspectionResults = (
      current: InspectionImageAnalyzeResponse,
      incoming: InspectionImageAnalyzeResponse,
    ): InspectionImageAnalyzeResponse => {
      const merged: InspectionImageAnalyzeResponse = {
        ...current,
        targetName: incoming.targetName || current.targetName,
        images: [...(current.images ?? []), ...(incoming.images ?? [])],
        normalItems: cloneGroups(current.normalItems),
        abnormalItems: cloneGroups(current.abnormalItems),
        unrecognizedItems: cloneGroups(current.unrecognizedItems),
      };

      const incomingCategories: Array<{ type: ResultType; groups: InspectionImageAnalyzeGroup[] }> = [
        { type: "normal", groups: incoming.normalItems ?? [] },
        { type: "abnormal", groups: incoming.abnormalItems ?? [] },
        { type: "unknown", groups: incoming.unrecognizedItems ?? [] },
      ];

      for (const { type: incomingType, groups } of incomingCategories) {
        for (const group of groups) {
          for (const incomingItem of group.standardItems ?? []) {
            const itemId = getAnalyzeItemId(incomingItem);
            if (!itemId) {
              continue;
            }

            const existing = findAnalyzeItemSource(merged, itemId);
            if (existing && existing.type !== "unknown") {
              continue;
            }

            const preservedAttachments = (existing?.item as MutableAnalyzeItem | undefined)?.attachments ?? [];
            const nextItem: MutableAnalyzeItem = {
              ...(incomingItem as MutableAnalyzeItem),
              attachments:
                preservedAttachments.length > 0 ? preservedAttachments : ((incomingItem as MutableAnalyzeItem).attachments ?? []),
            };

            if (existing) {
              removeAnalyzeItem(merged, existing);
            }
            appendAnalyzeItem(merged, incomingType, group, nextItem);
          }
        }
      }

      return merged;
    };

    const moveAnalyzeItem = (id: string, option: AiInspectionResultOption, problemDesc?: string): void => {
      updateAnalyzeResult((draft) => {
        const source = findAnalyzeItemSource(draft, id);
        if (!source) {
          return;
        }
        const targetType: ResultType = option.errorFlag ? "abnormal" : "normal";
        const updatedItem: MutableAnalyzeItem = {
          ...source.item,
          ...(problemDesc !== undefined
            ? {
                problemDesc,
                description: undefined,
                reason: undefined,
              }
            : {}),
          result: {
            id: source.item.resultVO?.id ?? source.item.result?.id,
            name: source.item.resultVO?.name ?? source.item.result?.name,
            itemName: option.itemName,
            itemValue: option.itemValue,
            errorFlag: option.errorFlag,
          },
        };
        const nextGroup = {
          ...source.group,
          problemDescription: problemDesc ?? source.group.problemDescription,
          standardItems: [],
        };
        removeAnalyzeItem(draft, source);
        appendAnalyzeItem(draft, targetType, nextGroup, updatedItem);
      });
    };

    const updateAnalyzeItem = (id: string, patch: Partial<MutableAnalyzeItem>): void => {
      updateAnalyzeResult((draft) => {
        const source = findAnalyzeItemSource(draft, id);
        if (!source) {
          return;
        }
        source.group.standardItems = [...(source.group.standardItems ?? [])];
        source.group.standardItems[source.itemIndex] = { ...source.item, ...patch };
      });
    };

    const updateGroupProblemDescription = (id: string, problemDescription: string): void => {
      updateAnalyzeResult((draft) => {
        const source = findAnalyzeItemSource(draft, id);
        if (!source) {
          return;
        }
        source.group.problemDescription = problemDescription;
      });
    };

    const markManualIntervention = (): void => {
      hasManualIntervention.value = true;
    };

    const changeGroupProblemDescription = (id: string, problemDescription: string): void => {
      markManualIntervention();
      updateGroupProblemDescription(id, problemDescription);
    };

    const getPageItems = (type: ResultType): PageInspectionItem[] =>
      getGroups(type).flatMap((group) =>
        (group.standardItems ?? []).map((sourceItem) => {
          const item = sourceItem as MutableAnalyzeItem;
          return {
            id: item.itemId ?? item.itemName ?? "",
            itemName: item.itemName ?? item.itemId ?? "",
            standardId: item.standardId ?? group.standardId ?? "",
            standardName: item.standardName ?? group.standardName ?? "",
            areaName: location.value,
            resultValue: item.result?.itemValue ?? item.resultItemValue ?? "",
            problemDesc: item.problemDesc || item.description || item.reason || group.problemDescription || "",
            evidence: item.evidence || group.evidence || "",
            suggestion: item.suggestion || item.handlingSuggestion || item.disposalSuggestion || "",
            recognized: type !== "unknown",
            attachments: item.attachments ?? [],
            options: getItemOptions(item),
            sourceType: type,
            imageResult: item.imageResult,
            remarkResult: item.remarkResult,
            manualCompleted: item.manualCompleted === true,
          };
        }),
      );

    const stats = computed(() => {
      const normalItems = getPageItems("normal");
      const abnormalItems = getPageItems("abnormal");
      const unknownItems = getPageItems("unknown");
      return {
        total: normalItems.length + abnormalItems.length + unknownItems.length,
        abnormalItems,
        normalItems,
        unknownItems,
        abnormalCount: abnormalItems.length,
        normalCount: normalItems.length,
        unknownCount: unknownItems.length,
      };
    });
    const normalizeSafetyTips = (tips: unknown): string[] => {
      if (Array.isArray(tips)) {
        return tips.map((item) => String(item).trim()).filter(Boolean);
      }
      if (typeof tips === "string") {
        return tips
          .split(/[\n。；;]/)
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    };
    const safetyTips = computed(() => normalizeSafetyTips(safetyTipsSource.value));
    const currentItems = computed(() => {
      if (activeTab.value === "abnormal") {
        return stats.value.abnormalItems;
      }
      if (activeTab.value === "normal") {
        return stats.value.normalItems;
      }
      return stats.value.unknownItems;
    });
    const currentOptionItem = computed(() =>
      [...stats.value.normalItems, ...stats.value.abnormalItems, ...stats.value.unknownItems].find(
        (item) => item.id === currentItemId.value,
      ),
    );
    const manualHasResultOptions = computed(() => (manualItem.value?.options.length ?? 0) > 0);
    const manualRequiresRemark = computed(() =>
      manualItem.value ? !manualHasResultOptions.value || requiresRemark(manualItem.value, manualResultValue.value) : false,
    );
    const manualRequiresImage = computed(() =>
      manualItem.value ? !manualHasResultOptions.value || requiresImage(manualItem.value, manualResultValue.value) : false,
    );

    const normalizeFiles = (files: unknown[]): AiInspectionFile[] =>
      files.map((file, index) => {
        const item = file as { id?: string; name?: string; path?: string; url?: string; type?: string; suffix?: string };
        const path = item.path ?? item.url ?? "";
        const type = (item.type ?? item.suffix ?? path.split(".").pop() ?? "jpg").replace(".", "");
        return {
          id: item.id ?? `native-file-${Date.now()}-${index}`,
          name: item.name ?? `附件${index + 1}.${type}`,
          path,
          type,
        };
      });

    const takeNativePhoto = async (): Promise<AiInspectionFile> => {
      const file = await cubeAppService.takePhoto({ sceneCode: GLOBAL_SCENE_CODE.inspectionRecord });
      const [photo] = normalizeFiles(file ? [file] : []);
      if (!photo) {
        throw new Error("未获取到拍照结果");
      }
      return photo;
    };

    const recognizeInspectionImage = async (capturedPhoto: AiInspectionFile): Promise<InspectionImageAnalyzeResponse> => {
      const request = buildInspectionImageAnalyzeRequest(capturedPhoto.id);
      if (!request.id || !request.objId) {
        throw new Error("缺少任务或巡检对象参数");
      }
      const response = (await useAuthRequest(() =>
        inspectionAiClient.analyzeInspectionImage(request),
      )) as unknown as InspectionImageAnalyzeResponse;
      location.value = response.targetName || "--";
      safetyTipsSource.value = response.safetyTips;
      return response;
    };

    const recognizeCapturedPhoto = async (capturedPhoto: AiInspectionFile): Promise<void> => {
      const shouldMerge = Boolean(result.value);
      try {
        photo.value = capturedPhoto;
        takenAt.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
        stage.value = "recognizing";
        const incoming = await recognizeInspectionImage(capturedPhoto);
        result.value = shouldMerge ? mergeInspectionResults(result.value!, incoming) : incoming;
        resultVersion.value += 1;
        stage.value = "ready";
      } catch (error) {
        if (error instanceof inspectionAiClient.InspectionAiRequestError && error.code === "AI_ANALYZE_TIMEOUT") {
          stage.value = "recognizeFailed";
          showNotify({ type: "warning", message: error.message });
          return;
        }
        if (shouldMerge) {
          stage.value = "ready";
          showNotify({ type: "warning", message: "已取消拍照或AI识别失败" });
          return;
        }
        stage.value = "failed";
        showNotify({ type: "warning", message: "已取消智能巡检、拍照失败或AI识别失败" });
      }
    };

    const retryRecognition = async (): Promise<void> => {
      if (!photo.value) {
        stage.value = "failed";
        return;
      }
      await recognizeCapturedPhoto(photo.value);
    };

    const retakePhoto = async (): Promise<void> => {
      if (getEnvironment() !== "cubeApp") {
        photoInputRef.value?.click();
        return;
      }
      try {
        stage.value = "takingPhoto";
        await recognizeCapturedPhoto(await takeNativePhoto());
      } catch (error) {
        stage.value = result.value ? "ready" : "failed";
        const message = error instanceof Error ? error.message : "已取消拍照或拍照失败";
        showNotify({ type: "warning", message });
      }
    };

    const uploadBrowserFile = async (file: File): Promise<AiInspectionFile> => {
      const uploaded = await cubeFileService.uploadFile({ businessKey: "mdata", file });
      const [normalized] = normalizeFiles([uploaded]);
      if (!normalized?.id) {
        throw new Error("照片上传后未返回文件 ID");
      }
      return normalized;
    };

    const handlePhotoSelected = async (event: Event): Promise<void> => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      try {
        stage.value = "takingPhoto";
        await recognizeCapturedPhoto(await uploadBrowserFile(file));
      } catch (error) {
        stage.value = result.value ? "ready" : "failed";
        const message = error instanceof Error ? error.message : "照片上传失败";
        showNotify({ type: "warning", message });
      }
    };

    const getInspectionItem = (id: string): PageInspectionItem | undefined =>
      [...stats.value.normalItems, ...stats.value.abnormalItems, ...stats.value.unknownItems].find((item) => item.id === id);

    const uploadAttachment = async (item: PageInspectionItem): Promise<void> => {
      if (getEnvironment() !== "cubeApp") {
        attachmentTargetId.value = item.id;
        attachmentInputRef.value?.click();
        return;
      }
      try {
        const files = await cubeAppService.uploadFile("6", { sceneCode: GLOBAL_SCENE_CODE.inspectionRecord });
        const current = getInspectionItem(item.id) ?? item;
        const nextAttachments = [...current.attachments, ...normalizeFiles(files as unknown[])];
        markManualIntervention();
        updateAnalyzeItem(item.id, {
          attachments: nextAttachments,
        });
        if (manualItem.value?.id === item.id) {
          manualItem.value = { ...manualItem.value, attachments: nextAttachments };
        }
      } catch {
        showNotify({ type: "warning", message: "附件上传失败" });
      }
    };

    const handleAttachmentSelected = async (event: Event): Promise<void> => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      const item = getInspectionItem(attachmentTargetId.value);
      if (!item) return;
      try {
        const uploaded = await uploadBrowserFile(file);
        const nextAttachments = [...item.attachments, uploaded];
        markManualIntervention();
        updateAnalyzeItem(item.id, { attachments: nextAttachments });
        if (manualItem.value?.id === item.id) {
          manualItem.value = { ...manualItem.value, attachments: nextAttachments };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "附件上传失败";
        showNotify({ type: "warning", message });
      }
    };

    const deleteAttachment = (item: PageInspectionItem, fileId: string): void => {
      const current = getInspectionItem(item.id) ?? item;
      const nextAttachments = current.attachments.filter((file) => file.id !== fileId);
      markManualIntervention();
      updateAnalyzeItem(item.id, {
        attachments: nextAttachments,
      });
      if (manualItem.value?.id === item.id) {
        manualItem.value = { ...manualItem.value, attachments: nextAttachments };
      }
    };

    const openOptionPopup = (item: PageInspectionItem): void => {
      currentItemId.value = item.id;
      selectedResultValue.value = item.resultValue;
      optionPopup.value = true;
    };

    const changeSelectedResultValue = (value: string): void => {
      selectedResultValue.value = value;
    };

    const submitOptionChange = (): void => {
      const item = currentOptionItem.value;
      const option = item?.options.find((current) => current.itemValue === selectedResultValue.value);
      if (item && option) {
        markManualIntervention();
        moveAnalyzeItem(item.id, option, item.problemDesc);
      }
      optionPopup.value = false;
      currentItemId.value = "";
    };

    const openManualPopup = (item: PageInspectionItem): void => {
      manualItem.value = item;
      manualResultValue.value = item.resultValue;
      manualDesc.value = item.options.length > 0 || item.manualCompleted ? item.problemDesc : "";
      manualPopup.value = true;
    };

    const scrollFocusedFieldIntoView = (event: FocusEvent): void => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      window.setTimeout(() => {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    };

    const submitManualResult = (): void => {
      if (!manualItem.value) {
        return;
      }
      if (!manualItem.value.options.length) {
        if (!manualDesc.value.trim()) {
          showNotify({ type: "warning", message: "请输入备注" });
          return;
        }
        if (!manualItem.value.attachments.length) {
          showNotify({ type: "warning", message: "请上传图片" });
          return;
        }
        markManualIntervention();
        updateAnalyzeItem(manualItem.value.id, {
          problemDesc: manualDesc.value.trim(),
          problemDescription: manualDesc.value.trim(),
          manualCompleted: true,
        });
        manualPopup.value = false;
        manualItem.value = undefined;
        showNotify({ type: "success", message: "手动巡检内容已保存" });
        return;
      }
      const option = manualItem.value.options.find((item) => item.itemValue === manualResultValue.value);
      if (!option) {
        showNotify({ type: "warning", message: "请选择巡检结果" });
        return;
      }
      if (requiresRemark(manualItem.value, option.itemValue) && !manualDesc.value.trim()) {
        showNotify({ type: "warning", message: "请输入问题描述" });
        return;
      }
      if (requiresImage(manualItem.value, option.itemValue) && !manualItem.value.attachments.length) {
        showNotify({ type: "warning", message: "请上传图片" });
        return;
      }
      markManualIntervention();
      moveAnalyzeItem(manualItem.value.id, option, manualDesc.value);
      manualPopup.value = false;
      manualItem.value = undefined;
      showNotify({ type: "success", message: "巡检结果已提交" });
    };

    const validateRequiredContent = (): boolean => {
      const items = [...stats.value.normalItems, ...stats.value.abnormalItems];
      const missingRemark = items.find((item) => requiresRemark(item) && !item.problemDesc.trim());
      if (missingRemark) {
        showNotify({ type: "warning", message: `请填写${missingRemark.itemName || missingRemark.id}的问题描述` });
        return false;
      }
      const missingImage = items.find((item) => requiresImage(item) && !item.attachments.length);
      if (missingImage) {
        showNotify({ type: "warning", message: `请上传${missingImage.itemName || missingImage.id}的图片` });
        return false;
      }
      return true;
    };

    const returnTask = (): void => {
      const returnPagePath = (route.query.returnPagePath as string) || "/inspection-detail";
      router.replace({
        path: returnPagePath,
        query: {
          id: route.query.taskId as string,
        },
      });
    };

    const validateBeforeSubmit = (): boolean => {
      if (!result.value) {
        showNotify({ type: "warning", message: "暂无巡检结果，无法提交" });
        return false;
      }
      const incompleteUnknownItems = stats.value.unknownItems.filter((item) => item.options.length > 0 || !item.manualCompleted);
      if (incompleteUnknownItems.length > 0) {
        showNotify({ type: "warning", message: "请先完成未识别项的手动巡检" });
        return false;
      }
      return validateRequiredContent();
    };

    const submitResult = async (): Promise<void> => {
      if (!validateBeforeSubmit()) {
        return;
      }

      const taskId = (route.query.taskId as string) ?? "";
      const targetId = (route.query.targetId as string) ?? "";
      const targetCategory = (route.query.targetCategory as string) ?? "";
      const isTemporary = route.query.isTemporary === "true";
      const returnPagePath = (route.query.returnPagePath as string) || "/inspection-detail";

      try {
        submitLoading.value = true;
        const detail = isTemporary
          ? await cubeDailyInspectionService.InspectTemporaryExecuteDetail(targetId, targetCategory)
          : await cubeDailyInspectionService.InspectExecuteDetail({ id: taskId, objId: targetId });

        const target = resolveSubmitTarget(
          {
            taskId,
            targetId,
            targetCategory,
            recordId: route.query.recordId as string,
            areaId: route.query.areaId as string,
            areaName: route.query.areaName as string,
            targetName: route.query.targetName as string,
            isTemporary: String(isTemporary),
          },
          detail,
          result.value?.targetName,
        );

        if (!target.recordId) {
          showNotify({ type: "warning", message: "缺少巡检记录信息，无法提交" });
          return;
        }

        const itemConfigMap = buildStandardItemConfigMap(detail);
        const commandModels = buildCommandModelsFromAnalyzeResult(result.value!, itemConfigMap);
        if (commandModels.length === 0) {
          showNotify({ type: "warning", message: "没有可提交的巡检项" });
          return;
        }

        const resultSource: InspectRecordResultSource = hasManualIntervention.value ? "MANUAL" : "AI";
        const command = buildSubmitCommand(target, commandModels, resultSource);
        if (isTemporary) {
          const submitResponse = await cubeDailyInspectionService.taskTempSubmitList({
            commandList: [command],
            resultSource,
          });
          showNotify({ type: "success", message: "提交成功" });
          router.replace({
            path: "/temporary-inspection-complete",
            query: {
              returnPagePath,
              inspectionId: String((submitResponse as { recordId?: string }).recordId || command.recordId || detail.recordId || ""),
              targetId: command.targetId,
              targetCategory: command.targetCategory,
              targetName: command.targetName,
            },
          });
          return;
        }

        await cubeDailyInspectionService.taskSubmitList({
          commandList: [command],
          resultSource,
        });
        showNotify({ type: "success", message: "提交成功" });
        returnTask();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "提交失败" });
      } finally {
        submitLoading.value = false;
      }
    };

    const renderState = (): VNode => (
      <div class={styles.state}>
        <div class={styles.stateCard}>
          {stage.value === "recognizeFailed" ? (
            <>
              <Icon name="warning-o" size="34" color="#ffaa26" />
              <div class={styles.stateTitle}>AI识别超时</div>
              <div class={styles.stateText}>本次识别响应超时，请使用当前照片重新发起识别。</div>
              <Button type="primary" block style={{ marginTop: "16px" }} onClick={() => void retryRecognition()}>
                重新识别
              </Button>
            </>
          ) : stage.value === "failed" ? (
            <>
              <Icon name="warning-o" size="34" color="#ffaa26" />
              <div class={styles.stateTitle}>未完成拍照</div>
              <div class={styles.stateText}>请重新发起拍照，完成后系统会自动开始AI识别。</div>
              <Button type="primary" block style={{ marginTop: "16px" }} onClick={retakePhoto}>
                重新拍照
              </Button>
            </>
          ) : (
            <>
              <Loading color="#1677ff" size="32" />
              <div class={styles.stateTitle}>{stage.value === "takingPhoto" ? "正在打开相机" : "AI 正在识别巡检对象..."}</div>
              <div class={styles.stateText}>
                {stage.value === "takingPhoto" ? "请在原生拍照页面完成拍摄并确认" : "识别完成后将自动展示智能巡检结果"}
              </div>
            </>
          )}
        </div>
      </div>
    );

    const renderSummary = (): VNode => (
      <div class={styles.overview}>
        <div class={styles.overviewTitle}>巡检总览</div>
        <div class={styles.summary} key={`summary-${resultVersion.value}`}>
          <div class={styles.summaryItem}>
            <div class={[styles.summaryValue, styles.blue]} key={`total-${stats.value.total}`}>
              {stats.value.total}
            </div>
            <div class={styles.summaryLabel}>巡检项</div>
          </div>
          <div class={styles.summaryItem}>
            <div class={[styles.summaryValue, styles.red]} key={`abnormal-${stats.value.abnormalCount}`}>
              {stats.value.abnormalCount}
            </div>
            <div class={styles.summaryLabel}>异常</div>
          </div>
          <div class={styles.summaryItem}>
            <div class={[styles.summaryValue, styles.green]} key={`normal-${stats.value.normalCount}`}>
              {stats.value.normalCount}
            </div>
            <div class={styles.summaryLabel}>正常</div>
          </div>
          <div class={styles.summaryItem}>
            <div class={[styles.summaryValue, styles.gray]} key={`unknown-${stats.value.unknownCount}`}>
              {stats.value.unknownCount}
            </div>
            <div class={styles.summaryLabel}>未识别</div>
          </div>
        </div>
      </div>
    );

    const renderSafetyTips = (): VNode => (
      <div class={styles.safetyCard}>
        <div class={styles.safetyHeader}>
          <div class={styles.safetyIcon}>
            <Icon name="shield-o" size="18" />
          </div>
          <div class={styles.safetyTitle}>安全提示</div>
        </div>
        <div class={styles.safetyList}>
          {(safetyTips.value.length > 0 ? safetyTips.value : ["请按巡检规范做好现场防护，发现异常及时上报。"]).map((tip, index) => (
            <div class={styles.safetyItem} key={`${tip}-${index}`}>
              <div class={styles.tipDot}></div>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    );

    const renderTabs = (): VNode => {
      const tabs: { name: ResultType; text: string; count: number; icon: string; activeClass: string }[] = [
        { name: "abnormal", text: "异常", count: stats.value.abnormalCount, icon: "warning-o", activeClass: styles.tabAbnormal },
        { name: "normal", text: "正常", count: stats.value.normalCount, icon: "passed", activeClass: styles.tabNormal },
        { name: "unknown", text: "未识别", count: stats.value.unknownCount, icon: "info-o", activeClass: styles.tabUnknown },
      ];
      return (
        <div class={styles.tabs} key={`tabs-${resultVersion.value}`}>
          {tabs.map((tab) => (
            <button
              class={[styles.tab, activeTab.value === tab.name ? tab.activeClass : ""]}
              type="button"
              key={tab.name}
              onClick={() => {
                activeTab.value = tab.name;
              }}
            >
              <Icon class={styles.tabIcon} name={tab.icon} />
              {tab.text}
              <span class={styles.tabCount} key={`${tab.name}-${tab.count}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      );
    };

    const renderAttachment = (item: PageInspectionItem): VNode => (
      <div class={styles.uploadList}>
        {item.attachments.map((file) => (
          <div class={styles.fileItem} key={file.id}>
            {isImage(file) ? (
              <VanImage src={file.path} width="100%" height="100%" fit="cover" />
            ) : (
              <div class={styles.fileName}>{file.name}</div>
            )}
            <div class={styles.delete} onClick={() => deleteAttachment(item, file.id)}>
              ×
            </div>
          </div>
        ))}
        <div class={styles.uploadButton} onClick={() => uploadAttachment(item)}>
          <Icon name="plus" size="22" color="#98a2ad" />
        </div>
      </div>
    );

    const renderRequiredMark = (): VNode => <span class={styles.requiredMark}>*</span>;

    const renderResultSelector = (item: PageInspectionItem): VNode => (
      <div class={styles.fieldBlock}>
        <div class={styles.fieldLabel}>结果更改</div>
        <div class={styles.select} onClick={() => openOptionPopup(item)}>
          <span>{getSelectedOption(item)?.itemName || "请选择"}</span>
          <Icon name="arrow-down" color="#98a2ad" />
        </div>
      </div>
    );

    const renderResultCard = (item: PageInspectionItem): VNode => {
      const type = getResultType(item);
      const tagClass = type === "abnormal" ? styles.tagDanger : type === "normal" ? styles.tagSuccess : styles.tagUnknown;
      const cardClass = type === "abnormal" ? styles.danger : type === "normal" ? styles.success : styles.unknown;
      const option = getSelectedOption(item);
      const showRemark = requiresRemark(item);
      const showImage = requiresImage(item);
      return (
        <div class={[styles.resultCard, cardClass]} key={item.id}>
          <div class={styles.cardHeader}>
            <div class={styles.itemInfo}>
              <div class={styles.itemName}>{item.itemName || item.id}</div>
              <div class={styles.itemArea}>
                <Icon name="location-o" size="12" />
                {item.areaName}
              </div>
            </div>
            <div class={[styles.tag, tagClass]}>{type === "unknown" ? "未识别" : option?.itemName}</div>
          </div>
          <div class={styles.cardBody}>
            {type !== "unknown" && renderResultSelector(item)}
            {type === "abnormal" && (
              <>
                {showRemark && (
                  <div class={styles.fieldBlock}>
                    <div class={styles.fieldLabel}>
                      {renderRequiredMark()}
                      <Icon name="warning-o" color="#e74c3c" />
                      问题描述
                    </div>
                    <div class={styles.textarea}>
                      <Field
                        modelValue={item.problemDesc}
                        rows="2"
                        autosize
                        type="textarea"
                        placeholder="请输入问题描述"
                        onUpdate:modelValue={(value: string) => changeGroupProblemDescription(item.id, value)}
                      />
                    </div>
                  </div>
                )}
                {showImage && (
                  <div class={styles.fieldBlock}>
                    <div class={styles.fieldLabel}>
                      {renderRequiredMark()}
                      <Icon name="paperclip-o" />
                      上传附件
                    </div>
                    {renderAttachment(item)}
                  </div>
                )}
                <div class={styles.fieldBlock}>
                  <div class={styles.fieldLabel}>
                    <Icon name="passed" color="#409eff" />
                    处置建议
                  </div>
                  <div class={styles.suggestion}>{item.suggestion || "暂无处置建议"}</div>
                </div>
              </>
            )}
            {type === "normal" && (
              <>
                {showRemark && (
                  <div class={styles.fieldBlock}>
                    <div class={styles.fieldLabel}>
                      {renderRequiredMark()}
                      <Icon name="warning-o" color="#e74c3c" />
                      问题描述
                    </div>
                    <div class={styles.textarea}>
                      <Field
                        modelValue={item.problemDesc}
                        rows="2"
                        autosize
                        type="textarea"
                        placeholder="请输入问题描述"
                        onUpdate:modelValue={(value: string) => changeGroupProblemDescription(item.id, value)}
                      />
                    </div>
                  </div>
                )}
                {showImage && (
                  <div class={styles.fieldBlock}>
                    <div class={styles.fieldLabel}>
                      {renderRequiredMark()}
                      <Icon name="paperclip-o" />
                      上传附件
                    </div>
                    {renderAttachment(item)}
                  </div>
                )}
                <div class={styles.fieldBlock}>
                  <div class={styles.normalInfo}>
                    <Icon name="checked" size="18" />
                    <div>
                      <div class={styles.normalTitle}>未发现安全隐患</div>
                      <div class={styles.normalSub}>各项巡检指标均在正常范围内</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {type === "unknown" && (
              <>
                <div class={styles.fieldBlock}>
                  <div class={styles.unknownInfo}>
                    <Icon name="info-o" size="18" />
                    <div>
                      <div class={styles.unknownTitle}>AI 未能识别该对象</div>
                      <div class={styles.unknownSub}>{item.problemDesc || "拍摄内容未能匹配到该巡检点，需手动录入巡检结果"}</div>
                      <div class={styles.unknownReason}>
                        {item.evidence ? `未识别原因：${item.evidence}` : "可能原因：拍摄角度不佳、光线不足、对象不在拍摄范围内等。"}
                      </div>
                    </div>
                  </div>
                </div>
                <div class={styles.unknownActions}>
                  <Button class={[styles.actionButton, styles.primaryButton]} type="primary" block onClick={() => openManualPopup(item)}>
                    <Icon name="passed" />
                    手动巡检
                  </Button>
                  <Button class={[styles.actionButton, styles.secondaryButton]} plain block onClick={retakePhoto}>
                    <Icon name="photograph" />
                    重新拍照
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    };

    const renderSectionLabel = (): VNode => {
      if (activeTab.value === "abnormal") {
        return (
          <div class={styles.sectionLabel}>
            <Icon name="warning-o" color="#e74c3c" />
            发现隐患的巡检项
          </div>
        );
      }
      if (activeTab.value === "normal") {
        return (
          <div class={styles.sectionLabel}>
            <Icon name="passed" color="#67c23a" />
            未发现隐患的巡检项
          </div>
        );
      }
      return (
        <div class={styles.sectionLabel}>
          <Icon name="info-o" color="#909399" />
          未识别的巡检项（需手动录入）
        </div>
      );
    };

    const renderResultContent = (): VNode => (
      <>
        <div class={styles.content}>
          <div class={styles.photoCard}>
            <div class={styles.photo}>
              <VanImage src={photo.value?.path} width="100%" height="100%" fit="cover" />
            </div>
            <div class={styles.photoInfo}>
              <div class={styles.meta}>
                <Icon name="location-o" size="14" />
                {location.value || "--"}
              </div>
              <div class={styles.time}>{takenAt.value}</div>
            </div>
          </div>
          {renderSafetyTips()}
          {renderSummary()}
          {renderTabs()}
          <div class={styles.resultList}>
            {renderSectionLabel()}
            {currentItems.value.map(renderResultCard)}
          </div>
          <div class={styles.footer}>
            <Button class={styles.footerButton} plain block onClick={returnTask}>
              返回任务
            </Button>
            <Button
              class={[styles.footerButton, styles.primaryButton]}
              type="primary"
              block
              loading={submitLoading.value}
              onClick={submitResult}
            >
              <Icon name="passed" />
              提交
            </Button>
          </div>
        </div>
      </>
    );

    onMounted(() => {
      if (started.value) return;
      started.value = true;
      const imageId = (route.query.imageId as string) ?? "";
      if (!imageId) {
        stage.value = "failed";
        return;
      }
      void recognizeCapturedPhoto({
        id: imageId,
        path: (route.query.imagePath as string) ?? "",
        name: (route.query.imageName as string) || "巡检照片.jpg",
        type: (route.query.imageType as string) || "jpg",
      });
    });

    return (): VNode => (
      <div class={styles.page}>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(event: Event) => void handlePhotoSelected(event)}
        />
        <input
          ref={attachmentInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(event: Event) => void handleAttachmentSelected(event)}
        />
        <Bar name={stage.value === "ready" ? "智能巡检结果" : "智能巡检"} isShowRight={false} />
        {stage.value === "ready" ? renderResultContent() : renderState()}
        <Popup v-model:show={optionPopup.value} position="bottom" round>
          <div class={styles.popup}>
            <div class={styles.sheetHandle}></div>
            <div class={styles.popupHeader}>
              <div class={styles.popupTitle}>结果更改</div>
              <button class={styles.closeButton} type="button" onClick={() => (optionPopup.value = false)}>
                ×
              </button>
            </div>
            <div class={styles.popupBody}>
              <RadioGroup v-model={selectedResultValue.value}>
                {currentOptionItem.value?.options.map((option) => (
                  <Radio
                    name={option.itemValue}
                    key={option.itemValue}
                    style={{ marginBottom: "12px" }}
                    onClick={() => changeSelectedResultValue(option.itemValue)}
                  >
                    {option.itemName}
                  </Radio>
                ))}
              </RadioGroup>
              <div class={styles.popupActions}>
                <Button class={styles.primaryButton} type="primary" block onClick={submitOptionChange}>
                  确定
                </Button>
              </div>
            </div>
          </div>
        </Popup>
        <Popup v-model:show={manualPopup.value} class={styles.manualPopup} position="bottom" round teleport="body" safeAreaInsetBottom>
          <div class={styles.popup}>
            <div class={styles.sheetHandle}></div>
            <div class={styles.popupHeader}>
              <div class={styles.popupTitle}>手动巡检</div>
              <button class={styles.closeButton} type="button" onClick={() => (manualPopup.value = false)}>
                ×
              </button>
            </div>
            <div class={styles.popupBody}>
              <Field label="巡检项" modelValue={manualItem.value?.itemName || manualItem.value?.id} readonly />
              <Field label="巡检对象" modelValue={manualItem.value?.areaName} readonly />
              {manualHasResultOptions.value ? (
                <div class={styles.fieldBlock}>
                  <div class={styles.fieldLabel}>巡检结果</div>
                  <RadioGroup v-model={manualResultValue.value} direction="horizontal">
                    {manualItem.value?.options.map((option) => (
                      <Radio name={option.itemValue} key={option.itemValue}>
                        {option.itemName}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div class={styles.fieldBlock}>
                  <div class={styles.fieldLabel}>该巡检项未配置结果项，请直接填写备注并上传图片</div>
                </div>
              )}
              {manualRequiresRemark.value && (
                <div class={styles.fieldBlock}>
                  <div class={styles.fieldLabel}>
                    {renderRequiredMark()}
                    {manualHasResultOptions.value ? "问题描述" : "备注"}
                  </div>
                  <div class={styles.textarea}>
                    <Field
                      v-model={manualDesc.value}
                      rows="2"
                      autosize
                      type="textarea"
                      placeholder={manualHasResultOptions.value ? "请输入问题描述" : "请输入备注"}
                      onFocus={scrollFocusedFieldIntoView}
                    />
                  </div>
                </div>
              )}
              {manualItem.value && manualRequiresImage.value && (
                <div class={styles.fieldBlock}>
                  <div class={styles.fieldLabel}>
                    {renderRequiredMark()}
                    <Icon name="paperclip-o" />
                    上传附件
                  </div>
                  {renderAttachment(manualItem.value)}
                </div>
              )}
              <div class={styles.popupActions}>
                <Button class={styles.primaryButton} type="primary" block onClick={submitManualResult}>
                  提交巡检结果
                </Button>
              </div>
            </div>
          </div>
        </Popup>
      </div>
    );
  },
});
