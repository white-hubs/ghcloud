import {
  Button,
  Cascader,
  Cell,
  CellGroup,
  Field,
  Icon,
  Loading,
  Popup,
  Tab,
  Tabs,
  showDialog,
  showToast,
  type CascaderOption,
} from "vant";
import {
  Transition,
  TransitionGroup,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  shallowRef,
  type VNode,
} from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService, type CubeAppLocation } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { HazardAiRecognitionCallResult, HazardSourceType } from "@ghcloud/cube-service-interface/hazard-governance";
import type {
  FileVO,
  HazardAiRecognitionResultVO,
  HazardAiRecognitionVO,
  HazardCategoryTreeVO,
  HazardPendingConfirmationCreateCommand,
} from "@ghcloud/cube-service-interface/hazard-governance";
import type { RiskObjectVO, RiskUnitVO } from "@ghcloud/cube-service-interface/risk-graded-control";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  batchCreateHazardPendingConfirmation,
  createHazardPendingConfirmation,
  getHazardCategoryTree,
  recognizeHazardsByAi,
} from "@ghcloud/cube-services-client/hazard-governance.client";
import { pageRiskObjects, pageUnits } from "@ghcloud/cube-services-client/risk-graded-control.client";
import { SpeechInputController, type SpeechInputStatus } from "@ghcloud/cube-speech-assistant";

import { HazardImageUploader } from "@/components/hazard-image-uploader";
import { SearchSelectPopup, type SearchSelectOption } from "@/components/search-select-popup";
import { useHazardImageUpload } from "@/hooks/use-hazard-image-upload";
import { HAZARD_H5_FIELD_LIMITS, limitTextLength } from "@/utils/field-limits";

import styles from "./index.module.less";

interface AiResult {
  id: string;
  aiRecognitionRecordId?: string | number;
  description: string;
  type: string;
  level: string;
  location: string;
  unit: string;
  unitLabel: string;
  object: string;
  objectLabel: string;
  categoryId?: string;
  aiRecommendedCategoryId?: string;
  disposalSuggestion?: string;
  locationCoordinate: string;
}

type SearchField = "unit" | "object";
type PickerOption = SearchSelectOption;

interface RemoteOptionCache {
  options: PickerOption[];
  pageNumber: number;
  finished: boolean;
}

const MAX_RESULT_REVEAL_MS = 800;
const MAX_RESULT_REVEAL_DELAY_MS = 300;
const AI_RESULT_SCROLL_OFFSET = 8;
const RISK_OPTION_PAGE_SIZE = 10;
const AI_DESCRIPTION_MIN_LENGTH = 5;

const mergeUniqueOptions = (options: PickerOption[], current?: PickerOption): PickerOption[] => {
  const merged = current?.value ? [current, ...options] : options;
  const seen = new Set<string>();
  return merged.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

export const HazardReportPage = defineComponent({
  name: "HazardReportPage",
  setup: () => {
    document.title = "智能上报";
    const router = useRouter();
    const route = useRoute();
    const inspectionSourceEventId = computed(() => {
      const value = route.query.sourceEventId;
      return typeof value === "string" && value.trim() ? value.trim() : undefined;
    });
    const isInspectionSource = computed(() => route.query.sourceType === HazardSourceType.INSPECTION);
    const inspectionTargetName = computed(() => {
      const value = route.query.targetName;
      return typeof value === "string" && value.trim() ? value.trim() : "";
    });
    const inspectionReturnPath = computed(() => {
      const value = route.query.returnPath;
      return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;
    });
    const inspectionBackPath = computed(() => {
      const value = route.query.backPath;
      return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : undefined;
    });
    const sourceFields = (
      sourceEventId?: string,
    ): Pick<HazardPendingConfirmationCreateCommand, "sourceType" | "applicationCode" | "sourceEventId"> => {
      if (!isInspectionSource.value) {
        return {
          sourceType: HazardSourceType.MANUAL,
          applicationCode: __ENV__.applicationCode,
        };
      }
      const resolvedSourceEventId = sourceEventId ?? inspectionSourceEventId.value;
      return {
        sourceType: HazardSourceType.INSPECTION,
        applicationCode: "INSPECTION",
        ...(resolvedSourceEventId ? { sourceEventId: resolvedSourceEventId } : {}),
      };
    };
    const tab = shallowRef("ai");
    const aiImageUpload = useHazardImageUpload();
    const manualImageUpload = useHazardImageUpload();
    const aiPhotos = aiImageUpload.files;
    const manualPhotos = manualImageUpload.files;
    const aiResults = shallowRef<AiResult[]>([]);
    const visibleAiResults = shallowRef<AiResult[]>([]);
    const recognizing = shallowRef(false);
    const submitting = shallowRef(false);
    const locating = shallowRef(false);
    const categoryTree = shallowRef<HazardCategoryTreeVO[]>([]);
    const showCategory = shallowRef(false);
    const categoryTargetId = shallowRef("");
    const voiceStatus = shallowRef<SpeechInputStatus>("idle");
    const voiceMode = shallowRef(false);
    const voiceDraftText = shallowRef("");
    const searchPicker = reactive({
      show: false,
      field: "unit" as SearchField,
      title: "",
      placeholder: "",
      keyword: "",
      targetId: "",
      options: [] as PickerOption[],
      loading: false,
      finished: true,
      pageNumber: 0,
    });
    const remoteOptionCache = new Map<string, RemoteOptionCache>();
    const form = reactive({
      aiDesc: "",
      type: "",
      typeLabel: "",
      categoryId: "",
      desc: "",
      unit: "",
      unitLabel: "",
      object: "",
      objectLabel: "",
      location: inspectionTargetName.value,
      locationCoordinate: "",
    });

    const voiceText = computed(() => {
      if (voiceStatus.value === "starting") {
        return "准备录音...";
      }
      if (voiceStatus.value === "recording") {
        return "松开识别";
      }
      if (voiceStatus.value === "transcribing") {
        return "正在识别...";
      }
      return "按住说话";
    });
    const voiceDisabled = computed(() => recognizing.value || voiceStatus.value === "transcribing");
    const speechInputController = new SpeechInputController({
      onStateChange: (state) => {
        voiceStatus.value = state.status;
        if (state.status === "starting") {
          voiceDraftText.value = "";
        }
      },
      onTranscribing: (_chunk, text) => {
        voiceDraftText.value = text;
      },
      onTranscribed: (text) => {
        const normalized = text.trim();
        if (!normalized) {
          showToast("没有识别到有效内容，请重试");
          return;
        }
        form.aiDesc = limitTextLength(
          form.aiDesc.trim() ? `${form.aiDesc.trim()}\n${normalized}` : normalized,
          HAZARD_H5_FIELD_LIMITS.longText,
        );
        voiceMode.value = false;
        voiceDraftText.value = "";
      },
      onError: (error) => {
        showToast(error instanceof Error ? error.message : "语音识别失败");
      },
    });
    let voicePermissionPrepared = false;
    let searchRequestVersion = 0;
    const activeVoicePointerIds = new Set<number>();
    const resultRevealTimers: number[] = [];
    let mainContentElement: HTMLElement | null = null;
    let aiResultHeaderElement: HTMLElement | null = null;
    const readOptionText = (...values: Array<string | number | undefined | null>): string => {
      const value = values.find((item) => item !== undefined && item !== null && item !== "");
      return value === undefined || value === null ? "" : String(value);
    };

    const toRiskUnitOption = (unit: RiskUnitVO): PickerOption | undefined => {
      const value = readOptionText(unit.unitId, unit.id);
      const name = readOptionText(unit.unitName, unit.name, unit.code, value);
      if (!value || !name) return undefined;
      return {
        text: name,
        value,
      };
    };

    const toRiskObjectOption = (object: RiskObjectVO): PickerOption | undefined => {
      const value = readOptionText(object.objectId, object.id);
      const name = readOptionText(object.objectName, object.name, object.objectCode, object.code, value);
      if (!value || !name) return undefined;
      return {
        text: name,
        value,
      };
    };

    const unwrapCategoryTree = (response: unknown): HazardCategoryTreeVO[] => {
      if (Array.isArray(response)) return response as HazardCategoryTreeVO[];
      if (response && typeof response === "object") {
        const record = response as Record<string, unknown>;
        const candidate = record.data ?? record.result ?? record.records;
        if (Array.isArray(candidate)) return candidate as HazardCategoryTreeVO[];
      }
      return [];
    };

    const sortCategoryNodes = (nodes: HazardCategoryTreeVO[]): HazardCategoryTreeVO[] =>
      [...nodes].sort((left, right) => (left.sortNo ?? 0) - (right.sortNo ?? 0));

    const toCategoryPickerOptions = (nodes: HazardCategoryTreeVO[]): CascaderOption[] =>
      sortCategoryNodes(nodes).map((node) => ({
        text: node.name,
        value: String(node.id),
        children: node.children?.length ? toCategoryPickerOptions(node.children) : undefined,
      }));

    const findCategoryPath = (
      nodes: HazardCategoryTreeVO[],
      categoryId: string,
      parentPath: HazardCategoryTreeVO[] = [],
    ): HazardCategoryTreeVO[] => {
      for (const node of nodes) {
        const currentPath = [...parentPath, node];
        if (String(node.id) === categoryId) return currentPath;
        if (node.children?.length) {
          const childPath = findCategoryPath(node.children, categoryId, currentPath);
          if (childPath.length > 0) return childPath;
        }
      }
      return [];
    };

    const getCategoryPathLabel = (categoryId: string | undefined, fallback = ""): string => {
      if (!categoryId) return fallback;
      const path = findCategoryPath(categoryTree.value, categoryId);
      return path.length > 0 ? path.map((node) => node.name).join(" / ") : fallback;
    };

    const categoryOptions = computed<CascaderOption[]>(() => toCategoryPickerOptions(categoryTree.value));
    const selectedSearchValue = computed(() => {
      const target = getSearchTarget();
      return searchPicker.field === "unit" ? target.unit : target.object;
    });
    const displayedSearchOptions = computed(() => {
      if (searchPicker.keyword.trim()) return searchPicker.options;
      const target = getSearchTarget();
      const current =
        searchPicker.field === "unit"
          ? target.unit
            ? { value: target.unit, text: target.unitLabel || target.unit }
            : undefined
          : target.object
            ? { value: target.object, text: target.objectLabel || target.object }
            : undefined;
      return mergeUniqueOptions(searchPicker.options, current);
    });

    const loadCategories = async (): Promise<void> => {
      try {
        categoryTree.value = unwrapCategoryTree(await useAuthRequest(() => getHazardCategoryTree()));
        let changed = false;
        aiResults.value.forEach((item) => {
          const fullLabel = getCategoryPathLabel(item.categoryId, item.type);
          if (fullLabel !== item.type) {
            item.type = fullLabel;
            changed = true;
          }
        });
        if (changed) refreshAiResults();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "隐患类型加载失败，请稍后重试");
      }
    };

    const unwrapRecognitionResult = (response: unknown): HazardAiRecognitionVO => {
      if (response && typeof response === "object") {
        const record = response as Record<string, unknown>;
        if (record.data && typeof record.data === "object") return record.data as HazardAiRecognitionVO;
        if (record.result && typeof record.result === "object") return record.result as HazardAiRecognitionVO;
      }
      return response as HazardAiRecognitionVO;
    };

    const createAiResult = (
      item: HazardAiRecognitionResultVO,
      index: number,
      fallbackDescription: string,
      analysisRecordId?: string | number,
    ): AiResult => {
      const categoryId = item.hazardTypeId == null ? undefined : String(item.hazardTypeId);
      const categoryName = item.hazardTypeName ?? "AI识别隐患";
      const description = item.description?.trim() || item.hazardDescription?.trim() || fallbackDescription;
      return {
        id: `AI-${analysisRecordId ?? "RESULT"}-${categoryId ?? "unknown"}-${index}`,
        aiRecognitionRecordId: analysisRecordId,
        description,
        type: getCategoryPathLabel(categoryId, categoryName),
        level: "待确认",
        location: inspectionTargetName.value,
        unit: "",
        unitLabel: "",
        object: "",
        objectLabel: "",
        categoryId,
        aiRecommendedCategoryId: categoryId,
        disposalSuggestion: item.disposalSuggestion,
        locationCoordinate: "",
      };
    };

    const findAiResult = (id: string): AiResult | undefined => aiResults.value.find((item) => item.id === id);

    const getSearchTarget = (): {
      unit: string;
      unitLabel: string;
      object: string;
      objectLabel: string;
    } => {
      const aiResult = searchPicker.targetId ? findAiResult(searchPicker.targetId) : undefined;
      if (aiResult) {
        return {
          unit: aiResult.unit,
          unitLabel: aiResult.unitLabel,
          object: aiResult.object,
          objectLabel: aiResult.objectLabel,
        };
      }
      return form;
    };

    const refreshAiResults = (): void => {
      aiResults.value = [...aiResults.value];
      visibleAiResults.value = [...visibleAiResults.value];
    };

    const updateAiResultField = (id: string, field: "description" | "location", value: string): void => {
      const target = findAiResult(id);
      if (!target) return;
      target[field] = limitTextLength(value, field === "description" ? HAZARD_H5_FIELD_LIMITS.longText : HAZARD_H5_FIELD_LIMITS.shortText);
      refreshAiResults();
    };

    const openCategoryPicker = (targetId = ""): void => {
      if (categoryOptions.value.length === 0) {
        showToast("暂无可用隐患类型");
        return;
      }
      categoryTargetId.value = targetId;
      showCategory.value = true;
    };

    const scrollToAiResults = (): void => {
      void nextTick(() => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!mainContentElement || !aiResultHeaderElement) return;
            const containerRect = mainContentElement.getBoundingClientRect();
            const headerRect = aiResultHeaderElement.getBoundingClientRect();
            const targetTop = mainContentElement.scrollTop + headerRect.top - containerRect.top - AI_RESULT_SCROLL_OFFSET;
            mainContentElement.scrollTo({
              top: Math.max(0, targetTop),
              behavior: "smooth",
            });
          });
        });
      });
    };

    const getRemoteOptionCacheKey = (): string => {
      const keyword = searchPicker.keyword.trim();
      const target = getSearchTarget();
      const parentId = searchPicker.field === "object" ? target.unit : "";
      return `${searchPicker.field}:${parentId}:${keyword}`;
    };

    const restoreRemoteOptionCache = (): boolean => {
      const cached = remoteOptionCache.get(getRemoteOptionCacheKey());
      if (!cached) return false;
      searchPicker.options = [...cached.options];
      searchPicker.pageNumber = cached.pageNumber;
      searchPicker.finished = cached.finished;
      searchPicker.loading = false;
      return true;
    };

    const saveRemoteOptionCache = (): void => {
      remoteOptionCache.set(getRemoteOptionCacheKey(), {
        options: [...searchPicker.options],
        pageNumber: searchPicker.pageNumber,
        finished: searchPicker.finished,
      });
    };

    const loadRemoteOptions = async (replace = false): Promise<void> => {
      if (searchPicker.field !== "unit" && searchPicker.field !== "object") {
        return;
      }
      const target = getSearchTarget();
      if (searchPicker.field === "object" && !target.unit) return;

      if (replace) {
        searchRequestVersion += 1;
        searchPicker.pageNumber = 0;
        searchPicker.options = [];
        searchPicker.loading = false;
        searchPicker.finished = false;
      }
      if (searchPicker.loading || searchPicker.finished) return;
      const version = searchRequestVersion;
      const pageNumber = searchPicker.pageNumber + 1;
      searchPicker.loading = true;
      try {
        const page =
          searchPicker.field === "unit"
            ? await useAuthRequest(() =>
                pageUnits({
                  pageNumber,
                  pageSize: RISK_OPTION_PAGE_SIZE,
                  keyword: searchPicker.keyword.trim() || undefined,
                  view: "option",
                }),
              )
            : await useAuthRequest(() =>
                pageRiskObjects({
                  unitId: target.unit,
                  pageNumber,
                  pageSize: RISK_OPTION_PAGE_SIZE,
                  keyword: searchPicker.keyword.trim() || undefined,
                  view: "option",
                }),
              );
        if (version !== searchRequestVersion) return;
        const options = (page.records ?? [])
          .map(searchPicker.field === "unit" ? toRiskUnitOption : toRiskObjectOption)
          .filter((item): item is PickerOption => item != null);
        searchPicker.options = mergeUniqueOptions([...searchPicker.options, ...options]);
        searchPicker.pageNumber = pageNumber;
        searchPicker.finished =
          searchPicker.options.length >= page.total || pageNumber >= page.pages || options.length < RISK_OPTION_PAGE_SIZE;
        saveRemoteOptionCache();
      } catch (error) {
        if (version === searchRequestVersion) {
          searchPicker.finished = true;
          const fallbackMessage = searchPicker.field === "unit" ? "风险单元加载失败，请稍后重试" : "风险对象加载失败，请稍后重试";
          showToast(error instanceof Error ? error.message : fallbackMessage);
        }
      } finally {
        if (version === searchRequestVersion) searchPicker.loading = false;
      }
    };

    const openSearchPicker = (field: SearchField, targetId = ""): void => {
      if (searchPicker.show && searchPicker.field === field && searchPicker.targetId === targetId) return;
      const target = targetId ? findAiResult(targetId) : form;
      if (!target) return;
      if (field === "object" && !target.unit) {
        showToast("请先选择风险单元");
        return;
      }
      searchRequestVersion += 1;
      searchPicker.field = field;
      searchPicker.targetId = targetId;
      searchPicker.title = field === "unit" ? "选择风险单元" : "选择风险对象";
      searchPicker.placeholder = "请输入名称或编码";
      searchPicker.keyword = "";
      searchPicker.options = [];
      searchPicker.loading = false;
      searchPicker.finished = false;
      searchPicker.pageNumber = 0;
      searchPicker.show = true;
      restoreRemoteOptionCache();
    };

    const searchOptions = (keyword: string): void => {
      searchPicker.keyword = keyword;
      void loadRemoteOptions(true);
    };

    const selectSearchOption = (option: PickerOption): void => {
      const aiResult = searchPicker.targetId ? findAiResult(searchPicker.targetId) : undefined;
      const target = aiResult ?? form;
      if (searchPicker.field === "unit") {
        if (target.unit !== option.value) {
          target.object = "";
          target.objectLabel = "";
          searchRequestVersion += 1;
        }
        target.unit = option.value;
        target.unitLabel = option.text;
      } else {
        target.object = option.value;
        target.objectLabel = option.text;
      }
      if (aiResult) refreshAiResults();
      searchPicker.show = false;
    };

    const isValidCoordinate = (value: number | undefined): value is number => {
      return typeof value === "number" && Number.isFinite(value);
    };

    const formatLocationAddress = (location: CubeAppLocation): string => {
      const address = location.address?.trim();
      if (address) {
        return address;
      }
      return [location.province, location.city, location.district, location.street]
        .map((item) => item?.trim())
        .filter(Boolean)
        .join("");
    };

    const showGpsDisabledDialog = async (): Promise<void> => {
      await showDialog({
        message: "手机GPS定位未开启",
        confirmButtonText: "确认",
      });
    };

    const locateCurrentPosition = async (targetId = ""): Promise<void> => {
      if (locating.value) {
        return;
      }
      if (getEnvironment() !== "cubeApp") {
        showToast("请在移动端App内使用GPS定位");
        return;
      }
      const target = targetId ? findAiResult(targetId) : form;
      if (!target) {
        return;
      }
      locating.value = true;
      try {
        const location = await cubeAppService.getLocation();
        if (!location || !isValidCoordinate(location.longitude) || !isValidCoordinate(location.latitude)) {
          await showGpsDisabledDialog();
          return;
        }
        const address = formatLocationAddress(location);
        target.locationCoordinate = `${location.longitude},${location.latitude}`;
        target.location = address || target.locationCoordinate;
        if (targetId) refreshAiResults();
        showToast("定位成功");
      } catch {
        await showGpsDisabledDialog();
      } finally {
        locating.value = false;
      }
    };

    const clearResultRevealTimers = (): void => {
      while (resultRevealTimers.length > 0) {
        const timer = resultRevealTimers.pop();
        if (timer != null) {
          window.clearTimeout(timer);
        }
      }
    };

    const revealAiResults = (results: AiResult[]): void => {
      clearResultRevealTimers();
      visibleAiResults.value = [];
      if (results.length === 0) {
        return;
      }

      const delay =
        results.length === 1 ? 0 : Math.min(MAX_RESULT_REVEAL_DELAY_MS, Math.floor(MAX_RESULT_REVEAL_MS / (results.length - 1)));

      results.forEach((item, index) => {
        const timer = window.setTimeout(() => {
          visibleAiResults.value = [...visibleAiResults.value, item];
          if (index === results.length - 1) {
            scrollToAiResults();
          }
        }, index * delay);
        resultRevealTimers.push(timer);
      });
    };

    const prepareVoiceInputPermission = async (): Promise<void> => {
      if (voicePermissionPrepared) {
        return;
      }
      const permission = await speechInputController.requestRecordPermission();
      if (!permission.granted) {
        throw new Error(permission.message ?? "未获取录音权限");
      }
      voicePermissionPrepared = true;
    };

    const handleVoicePressStart = (pointerId: number): void => {
      if (voiceDisabled.value) {
        return;
      }
      activeVoicePointerIds.add(pointerId);
      prepareVoiceInputPermission()
        .then(() => (activeVoicePointerIds.has(pointerId) ? speechInputController.handlePressStart(pointerId) : undefined))
        .catch((error: unknown) => {
          voicePermissionPrepared = false;
          activeVoicePointerIds.delete(pointerId);
          voiceStatus.value = "idle";
          showToast(error instanceof Error ? error.message : "语音录入启动失败");
        });
    };

    const handleVoicePressEnd = (pointerId: number): void => {
      activeVoicePointerIds.delete(pointerId);
      speechInputController.handlePressEnd(pointerId).catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入结束失败");
      });
    };

    const openVoiceMode = (): void => {
      if (recognizing.value || voiceStatus.value !== "idle") {
        return;
      }
      voiceMode.value = true;
    };

    const closeVoiceMode = (): void => {
      if (voiceStatus.value !== "idle") {
        return;
      }
      voiceMode.value = false;
    };

    const captureVoicePointer = (event: PointerEvent): void => {
      if (voiceDisabled.value) {
        return;
      }
      const target = event.currentTarget as HTMLElement | null;
      target?.setPointerCapture?.(event.pointerId);
      handleVoicePressStart(event.pointerId);
    };

    const releaseVoicePointer = (event: PointerEvent): void => {
      const target = event.currentTarget as HTMLElement | null;
      if (target?.hasPointerCapture?.(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      handleVoicePressEnd(event.pointerId);
    };

    const cancelVoicePointer = (event: PointerEvent): void => {
      const target = event.currentTarget as HTMLElement | null;
      if (target?.hasPointerCapture?.(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      handleVoicePressCancel(event.pointerId);
    };

    const renderVoiceInput = (): VNode => (
      <div class={styles.voiceComposer}>
        <button
          class={[
            styles.holdToTalkButton,
            voiceStatus.value === "starting" ? styles.voiceStarting : "",
            voiceStatus.value === "recording" ? styles.voiceRecording : "",
            voiceStatus.value === "transcribing" ? styles.voiceTranscribing : "",
          ]}
          type="button"
          disabled={voiceDisabled.value}
          onContextmenu={(event: Event) => event.preventDefault()}
          onPointerdown={captureVoicePointer}
          onPointerup={releaseVoicePointer}
          onPointercancel={cancelVoicePointer}
          onTouchstart={
            typeof window !== "undefined" && "PointerEvent" in window
              ? undefined
              : (event: TouchEvent) => {
                  event.preventDefault();
                  handleVoicePressStart(-1);
                }
          }
          onTouchend={
            typeof window !== "undefined" && "PointerEvent" in window
              ? undefined
              : (event: TouchEvent) => {
                  event.preventDefault();
                  handleVoicePressEnd(-1);
                }
          }
          onTouchcancel={
            typeof window !== "undefined" && "PointerEvent" in window
              ? undefined
              : (event: TouchEvent) => {
                  event.preventDefault();
                  handleVoicePressCancel(-1);
                }
          }
        >
          {voiceStatus.value === "starting" || voiceStatus.value === "transcribing" ? (
            <Loading size="20px" color="currentColor" />
          ) : voiceStatus.value === "recording" ? (
            <span class={styles.voiceWave} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          ) : (
            <Icon name="volume-o" size="20" />
          )}
          <span>{voiceText.value}</span>
        </button>
        <div class={styles.voiceComposerHint}>
          {voiceStatus.value === "recording"
            ? "正在录音，松开后自动识别文字"
            : voiceStatus.value === "transcribing"
              ? "语音识别中，请稍候"
              : "按住开始，松开结束"}
        </div>
      </div>
    );

    const handleVoicePressCancel = (pointerId: number): void => {
      activeVoicePointerIds.delete(pointerId);
      speechInputController.handlePressCancel(pointerId).catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入取消失败");
      });
    };

    const recognize = async (): Promise<void> => {
      if (recognizing.value) {
        return;
      }
      const fileId = readSceneImageIds(aiPhotos.value)?.split(",")[0];
      const description = form.aiDesc.trim();
      if (!fileId && description.length === 0) {
        showToast("请至少上传一张现场照片或填写隐患描述");
        return;
      }
      if (!fileId && description.length < AI_DESCRIPTION_MIN_LENGTH) {
        showToast(`隐患描述至少填写${AI_DESCRIPTION_MIN_LENGTH}个字，或上传一张现场照片`);
        return;
      }
      recognizing.value = true;
      aiResults.value = [];
      clearResultRevealTimers();
      visibleAiResults.value = [];
      try {
        const result = unwrapRecognitionResult(
          await useAuthRequest(() =>
            recognizeHazardsByAi({
              ...(fileId ? { fileId } : {}),
              ...(description ? { description } : {}),
            }),
          ),
        );
        if (result.callResult === HazardAiRecognitionCallResult.FAILED) {
          showToast(result.failureReason || "AI识别失败，请稍后重试");
          return;
        }
        aiResults.value = (result.hazards ?? []).map((item, index) => createAiResult(item, index, description, result.analysisRecordId));
        revealAiResults(aiResults.value);
        showToast(aiResults.value.length > 0 ? "AI识别完成" : "未识别到隐患，请更换照片或补充描述后重试");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "AI识别失败，请稍后重试");
      } finally {
        recognizing.value = false;
      }
    };

    const readSceneImageIds = (files: FileVO[]): string | undefined => {
      const ids = files
        .map((file) => file.id)
        .filter((value): value is string | number => value != null && String(value).trim() !== "")
        .map(String);
      return ids.length > 0 ? ids.join(",") : undefined;
    };

    const readCoordinates = (locationCoordinate: string): { longitude?: number; latitude?: number } => {
      const [longitude, latitude] = locationCoordinate.split(",").map(Number);
      return Number.isFinite(longitude) && Number.isFinite(latitude) ? { longitude, latitude } : {};
    };

    const goAfterCreated = async (): Promise<void> => {
      if (isInspectionSource.value) {
        const returnPath = inspectionReturnPath.value ?? "/my-inspection";
        window.location.replace(`/apps/daily-inspection/h5/#${returnPath}`);
        return;
      }
      try {
        await router.replace({ name: "hazards" });
      } catch {
        showToast("隐患已创建，请前往隐患台账查看");
      }
    };

    const goBack = (): void => {
      if (isInspectionSource.value && inspectionBackPath.value) {
        window.location.replace(`/apps/daily-inspection/h5/#${inspectionBackPath.value}`);
        return;
      }
      router.back();
    };

    const submitManual = async (): Promise<void> => {
      const sceneImages = readSceneImageIds(manualPhotos.value);
      if (!sceneImages || !form.categoryId || !form.desc.trim()) {
        showToast("请补充必填项");
        return;
      }
      if (submitting.value) return;
      submitting.value = true;
      const payload: HazardPendingConfirmationCreateCommand = {
        categoryId: form.categoryId,
        description: form.desc.trim(),
        ...(form.location.trim() ? { locationName: form.location.trim() } : {}),
        ...readCoordinates(form.locationCoordinate),
        ...(form.unit ? { riskUnitId: form.unit } : {}),
        ...(form.object ? { riskObjectId: form.object } : {}),
        ...sourceFields(),
      };
      payload.sceneImages = sceneImages;
      try {
        const result = await useAuthRequest(() => createHazardPendingConfirmation(payload));
        showToast(result.code ? `隐患已创建：${result.code}` : "隐患已创建，待确认");
        await goAfterCreated();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "隐患创建失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    const submitAiResults = async (): Promise<void> => {
      if (aiResults.value.length === 0 || submitting.value) return;
      const sceneImages = readSceneImageIds(aiPhotos.value);
      const unmatched = aiResults.value.filter((item) => !item.categoryId);
      if (unmatched.length > 0) {
        showToast(`有 ${unmatched.length} 条识别结果未匹配到隐患类型，暂不能提交`);
        return;
      }
      const missingDescription = aiResults.value.filter((item) => !item.description.trim());
      if (missingDescription.length > 0) {
        showToast("请先填写隐患描述");
        return;
      }
      submitting.value = true;
      try {
        const payloads: HazardPendingConfirmationCreateCommand[] = aiResults.value.map((item, index) => ({
          categoryId: item.categoryId!,
          description: item.description.trim(),
          ...sourceFields(
            isInspectionSource.value && inspectionSourceEventId.value && aiResults.value.length > 1
              ? `${inspectionSourceEventId.value}:${index + 1}`
              : undefined,
          ),
          sceneImages,
          ...(item.aiRecognitionRecordId ? { aiRecognitionRecordId: item.aiRecognitionRecordId } : {}),
          ...(item.aiRecommendedCategoryId ? { aiRecommendedCategoryId: item.aiRecommendedCategoryId } : {}),
          ...(item.unit ? { riskUnitId: item.unit } : {}),
          ...(item.object ? { riskObjectId: item.object } : {}),
          ...(item.location.trim() ? { locationName: item.location.trim() } : {}),
          ...readCoordinates(item.locationCoordinate),
        }));
        await useAuthRequest(() => batchCreateHazardPendingConfirmation(payloads));
        showToast(`已创建 ${aiResults.value.length} 条待确认隐患`);
        await goAfterCreated();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "批量创建隐患失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      void loadCategories();
    });

    onBeforeUnmount(() => {
      clearResultRevealTimers();
      speechInputController.dispose().catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : "语音录入资源释放失败");
      });
    });

    return (): VNode => (
      <>
        <CubeNavBar
          showBack
          onlyBack={Boolean(isInspectionSource.value && inspectionBackPath.value)}
          title="智能上报"
          onClickLeft={goBack}
        />
        <div class={styles.container}>
          <Tabs v-model:active={tab.value}>
            <Tab title="AI识别" name="ai" />
            <Tab title="创建隐患" name="manual" />
          </Tabs>
          <div
            class={styles.mainContent}
            ref={(element: unknown) => {
              mainContentElement = element instanceof HTMLElement ? element : null;
            }}
          >
            {tab.value === "ai" ? (
              <>
                <CellGroup inset>
                  <Field label="现场照片" label-align="top">
                    {{
                      input: () => (
                        <HazardImageUploader
                          files={aiPhotos.value}
                          loading={aiImageUpload.uploading.value}
                          disabled={recognizing.value}
                          maxCount={aiImageUpload.maxCount}
                          onUpload={() => {
                            void aiImageUpload.upload();
                          }}
                          onRemove={aiImageUpload.removeAt}
                        />
                      ),
                    }}
                  </Field>
                  <Field label-align="top">
                    {{
                      label: () => (
                        <div class={styles.descLabel}>
                          <span>隐患描述</span>

                          <Button
                            class={styles.voiceButton}
                            icon={voiceMode.value ? "edit" : "volume-o"}
                            size="small"
                            type="primary"
                            plain
                            disabled={recognizing.value}
                            onClick={() => {
                              voiceMode.value ? closeVoiceMode() : openVoiceMode();
                            }}
                          >
                            {voiceMode.value ? "键盘输入" : "语音输入"}
                          </Button>
                        </div>
                      ),

                      input: () => (
                        <div class={styles.descInputBox} style={{ width: "100%" }}>
                          <Transition name="voice-input" mode="out-in">
                            {voiceMode.value ? (
                              <div key="voice" class={styles.voiceInput}>
                                {renderVoiceInput()}
                              </div>
                            ) : (
                              <Field
                                key="text"
                                v-model={form.aiDesc}
                                type="textarea"
                                autosize
                                rows={3}
                                placeholder="请描述隐患情况，越详细AI识别越准确"
                                border={false}
                                disabled={recognizing.value}
                                maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                                showWordLimit
                              />
                            )}
                          </Transition>
                        </div>
                      ),
                    }}
                  </Field>
                </CellGroup>
                {recognizing.value ? (
                  <div class={styles.recognizing}>
                    <div class={styles.recognizingPanel}>
                      <div class={styles.aiThinkingIcon}>AI</div>
                      <div class={styles.recognizingInfo}>
                        <div class={styles.recognizingText}>AI 正在识别中</div>
                        <div class={styles.recognizingSubText}>正在分析现场图片与隐患描述</div>
                      </div>
                      <div class={styles.aiThinkingDots} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div class={styles.progressTrack}>
                      <span class={styles.progressBar} />
                    </div>
                  </div>
                ) : aiResults.value.length === 0 ? (
                  <div class={styles.actions}>
                    <Button
                      block
                      type="primary"
                      disabled={voiceStatus.value !== "idle"}
                      onClick={() => {
                        void recognize();
                      }}
                    >
                      开始识别
                    </Button>
                  </div>
                ) : null}
                <div>
                  {visibleAiResults.value.length > 0 ? (
                    <div
                      class={styles.aiResultHeader}
                      ref={(element: unknown) => {
                        aiResultHeaderElement = element instanceof HTMLElement ? element : null;
                      }}
                    >
                      <span class={styles.aiResultDot} />
                      <span>AI 识别结果</span>
                    </div>
                  ) : null}
                  <TransitionGroup name="ai-result" tag="div">
                    {visibleAiResults.value.map((item, index) => (
                      <CellGroup inset class={styles.result} key={item.id}>
                        <Cell class={styles.resultCell} border={false}>
                          <div class={styles.resultTitle}>
                            <span>隐患{index + 1}</span>
                            <Button
                              class={styles.deleteResultButton}
                              icon="delete-o"
                              size="small"
                              type="danger"
                              plain
                              aria-label={`删除隐患${index + 1}`}
                              onClick={() => {
                                aiResults.value = aiResults.value.filter((result) => result.id !== item.id);
                                visibleAiResults.value = visibleAiResults.value.filter((result) => result.id !== item.id);
                              }}
                            />
                          </div>
                        </Cell>
                        <Field
                          modelValue={item.type}
                          label="隐患类型"
                          placeholder="请选择"
                          readonly
                          clickable
                          isLink
                          required
                          onClick={() => openCategoryPicker(item.id)}
                          onClickInput={() => openCategoryPicker(item.id)}
                          onClickRightIcon={() => openCategoryPicker(item.id)}
                        />
                        <Field
                          modelValue={item.description}
                          label="描述"
                          label-align="top"
                          type="textarea"
                          rows={2}
                          autosize
                          required
                          maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                          showWordLimit
                          onUpdate:modelValue={(value: unknown) => {
                            updateAiResultField(item.id, "description", String(value ?? ""));
                          }}
                        />
                        {item.disposalSuggestion ? (
                          <Field
                            modelValue={item.disposalSuggestion}
                            label="AI处置建议"
                            label-align="top"
                            type="textarea"
                            rows={2}
                            autosize
                            readonly
                          />
                        ) : null}
                        <Field
                          modelValue={item.unitLabel}
                          label="风险单元"
                          placeholder="请选择"
                          readonly
                          clickable
                          isLink
                          onClick={() => openSearchPicker("unit", item.id)}
                          onClickInput={() => openSearchPicker("unit", item.id)}
                          onClickRightIcon={() => openSearchPicker("unit", item.id)}
                        />
                        <Field
                          modelValue={item.objectLabel}
                          label="风险对象"
                          placeholder={item.unit ? "请选择" : "请先选择风险单元"}
                          readonly
                          clickable
                          isLink
                          onClick={() => openSearchPicker("object", item.id)}
                          onClickInput={() => openSearchPicker("object", item.id)}
                          onClickRightIcon={() => openSearchPicker("object", item.id)}
                        />
                        <Field
                          modelValue={item.location}
                          label="位置"
                          placeholder="如：B区2F东侧走廊"
                          clearable
                          maxlength={HAZARD_H5_FIELD_LIMITS.shortText}
                          onUpdate:modelValue={(value: unknown) => {
                            updateAiResultField(item.id, "location", String(value ?? ""));
                          }}
                        >
                          {{
                            button: () => (
                              <Button
                                size="small"
                                type="primary"
                                plain
                                loading={locating.value}
                                disabled={locating.value}
                                onClick={() => {
                                  void locateCurrentPosition(item.id);
                                }}
                              >
                                GPS定位
                              </Button>
                            ),
                          }}
                        </Field>
                      </CellGroup>
                    ))}
                  </TransitionGroup>
                </div>
              </>
            ) : (
              <>
                <CellGroup inset>
                  <Field label="现场照片" label-align="top" required>
                    {{
                      input: () => (
                        <HazardImageUploader
                          files={manualPhotos.value}
                          loading={manualImageUpload.uploading.value}
                          maxCount={manualImageUpload.maxCount}
                          onUpload={() => {
                            void manualImageUpload.upload();
                          }}
                          onRemove={manualImageUpload.removeAt}
                        />
                      ),
                    }}
                  </Field>
                  <Field
                    modelValue={form.typeLabel}
                    label="隐患类型"
                    placeholder="请选择"
                    required
                    readonly
                    clickable
                    isLink
                    onClick={() => openCategoryPicker()}
                    onClickInput={() => openCategoryPicker()}
                    onClickRightIcon={() => openCategoryPicker()}
                  />
                  <Field
                    v-model={form.desc}
                    label="风险描述"
                    label-align="top"
                    type="textarea"
                    autosize
                    rows={3}
                    placeholder="请描述隐患具体情况"
                    required
                    maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                    showWordLimit
                  />
                  <Field
                    modelValue={form.unitLabel}
                    label="风险单元"
                    placeholder="请选择"
                    readonly
                    clickable
                    isLink
                    onClick={() => openSearchPicker("unit")}
                    onClickInput={() => openSearchPicker("unit")}
                    onClickRightIcon={() => openSearchPicker("unit")}
                  />
                  <Field
                    modelValue={form.objectLabel}
                    label="风险对象"
                    placeholder={form.unit ? "请选择" : "请先选择风险单元"}
                    readonly
                    clickable
                    isLink
                    onClick={() => openSearchPicker("object")}
                    onClickInput={() => openSearchPicker("object")}
                    onClickRightIcon={() => openSearchPicker("object")}
                  />
                  <Field
                    v-model={form.location}
                    label="位置"
                    placeholder="如：B区2F东侧走廊"
                    clearable
                    maxlength={HAZARD_H5_FIELD_LIMITS.shortText}
                  >
                    {{
                      button: () => (
                        <Button
                          size="small"
                          type="primary"
                          plain
                          loading={locating.value}
                          disabled={locating.value}
                          onClick={() => {
                            void locateCurrentPosition();
                          }}
                        >
                          GPS定位
                        </Button>
                      ),
                    }}
                  </Field>
                </CellGroup>
                <div class={styles.actions}>
                  <Button
                    block
                    type="primary"
                    loading={submitting.value}
                    onClick={() => {
                      void submitManual();
                    }}
                  >
                    提交
                  </Button>
                </div>
              </>
            )}
          </div>
          {tab.value === "ai" && aiResults.value.length > 0 ? (
            <div class={[styles.bottomActions, styles.splitActions]}>
              <Button
                block
                disabled={voiceStatus.value !== "idle" || submitting.value}
                loading={recognizing.value}
                onClick={() => {
                  void recognize();
                }}
              >
                重新识别
              </Button>
              <Button
                block
                type="primary"
                loading={submitting.value}
                disabled={recognizing.value}
                onClick={() => {
                  void submitAiResults();
                }}
              >
                确认提交
              </Button>
            </div>
          ) : null}
        </div>
        <Popup
          show={showCategory.value}
          position="bottom"
          round
          onUpdate:show={(show: boolean) => {
            showCategory.value = show;
            if (!show) categoryTargetId.value = "";
          }}
        >
          <Cascader
            modelValue={categoryTargetId.value ? findAiResult(categoryTargetId.value)?.categoryId : form.categoryId}
            title="选择隐患类型"
            options={categoryOptions.value}
            onClose={() => {
              showCategory.value = false;
              categoryTargetId.value = "";
            }}
            onFinish={(event: { value?: unknown; selectedOptions?: Array<{ text?: unknown; value?: unknown }> }) => {
              const selectedOptions = event.selectedOptions ?? [];
              const lastOption = selectedOptions[selectedOptions.length - 1];
              const categoryId = String(event.value ?? lastOption?.value ?? "");
              const categoryLabel = selectedOptions
                .map((item) => String(item.text ?? ""))
                .filter(Boolean)
                .join(" / ");
              const aiResult = categoryTargetId.value ? findAiResult(categoryTargetId.value) : undefined;
              if (aiResult) {
                aiResult.categoryId = categoryId;
                aiResult.type = categoryLabel;
                refreshAiResults();
              } else {
                form.categoryId = categoryId;
                form.type = categoryId;
                form.typeLabel = categoryLabel;
              }
              showCategory.value = false;
              categoryTargetId.value = "";
            }}
          />
        </Popup>
        <SearchSelectPopup
          show={searchPicker.show}
          title={searchPicker.title}
          placeholder={searchPicker.placeholder}
          options={displayedSearchOptions.value}
          selectedValue={selectedSearchValue.value}
          loading={searchPicker.loading}
          finished={searchPicker.finished}
          onUpdate:show={(show: boolean) => {
            searchPicker.show = show;
            if (!show) searchRequestVersion += 1;
          }}
          onSearch={searchOptions}
          onLoad={() => {
            void loadRemoteOptions();
          }}
          onSelect={selectSearchOption}
        />
      </>
    );
  },
});
