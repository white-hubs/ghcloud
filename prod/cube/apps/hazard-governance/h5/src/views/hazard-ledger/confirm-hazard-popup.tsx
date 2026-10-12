import {
  Button,
  Cascader,
  CellGroup,
  Field,
  Form,
  Loading,
  Overlay,
  Picker,
  Popup,
  showDialog,
  showToast,
  type CascaderOption,
  type FormInstance,
} from "vant";
import { computed, defineComponent, reactive, ref, shallowRef, watch, type PropType } from "vue";

import { cubeAppService, type CubeAppLocation } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type {
  FileVO,
  HazardCategoryTreeVO,
  HazardConfirmCommand,
  HazardDetailBasicInfoVO,
  HazardDetailVO,
  HazardLedgerRecordVO,
} from "@ghcloud/cube-service-interface/hazard-governance";
import { HazardLevel } from "@ghcloud/cube-service-interface/hazard-governance";
import type { User } from "@ghcloud/cube-service-interface/ouaa";
import type { RiskObjectVO, RiskUnitVO } from "@ghcloud/cube-service-interface/risk-graded-control";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { confirmHazard, getHazardCategoryTree, getHazardDetail } from "@ghcloud/cube-services-client/hazard-governance.client";
import { listUsers } from "@ghcloud/cube-services-client/ouaa.client";
import { pageRiskObjects, pageUnits } from "@ghcloud/cube-services-client/risk-graded-control.client";

import { HazardImageUploader } from "@/components/hazard-image-uploader";
import { SearchSelectPopup, type SearchSelectOption } from "@/components/search-select-popup";
import { useHazardImageUpload } from "@/hooks/use-hazard-image-upload";
import { authStore } from "@/stores/auth";
import { HAZARD_H5_FIELD_LIMITS } from "@/utils/field-limits";

import styles from "./index.module.less";

type PickerField = "level" | "deadline";
type SearchField = "riskUnitId" | "riskObjectId" | "responsibleUserId" | "acceptanceUserId";

type PickerOption = SearchSelectOption;

interface RemoteOptionCache {
  options: PickerOption[];
  pageNumber: number;
  finished: boolean;
}

type LedgerRecordWithCategory = HazardLedgerRecordVO & {
  categoryId?: string | number;
  categoryIds?: Array<string | number>;
  categoryIdPath?: Array<string | number>;
  categoryPath?: Array<string | number>;
  hazardCategoryId?: string | number;
  categoryName?: string;
  categoryNamePath?: string[];
  hazardCategoryName?: string;
  category?: {
    id?: string | number;
    categoryId?: string | number;
    path?: Array<string | number>;
    ids?: Array<string | number>;
  };
};

interface OptionalRef {
  id?: string | number;
  userId?: string;
  name?: string;
  userName?: string;
  unitId?: string | number;
  unitName?: string;
  objectId?: string | number;
  objectName?: string;
}

type ConfirmHazardRecord = (HazardLedgerRecordVO | HazardDetailBasicInfoVO) & {
  hazardId?: string | number;
  hazardDescription?: string;
  hazardLevel?: string;
  sceneImages?: FileVO[];
  images?: FileVO[];
  riskUnit?: OptionalRef;
  riskObject?: OptionalRef;
  responsibleUser?: OptionalRef;
  acceptanceUser?: OptionalRef;
  acceptorUser?: OptionalRef;
  confirmUser?: OptionalRef;
  confirmUserId?: string | number;
  confirmUserName?: string;
  deadlineHours?: number | string;
  defaultDeadlineHours?: number | string;
};

type HazardDetailResponse = HazardDetailVO | HazardDetailBasicInfoVO | { data?: unknown; result?: unknown; details?: unknown };

type HazardConfirmPayload = Omit<HazardConfirmCommand, "categoryId" | "riskUnitId" | "riskObjectId"> & {
  categoryId: string;
  riskUnitId?: string;
  riskObjectId?: string;
};

interface CurrentUserStorage {
  id?: string | number;
  userId?: string | number;
  userID?: string | number;
  user_id?: string | number;
  name?: string;
  userName?: string;
  user_name?: string;
  username?: string;
  displayName?: string;
  nickname?: string;
  sub?: string;
}

const levelOptions: PickerOption[] = [
  { text: "一般", value: HazardLevel.GENERAL },
  { text: "重大", value: HazardLevel.MAJOR },
  { text: "特重大", value: HazardLevel.CRITICAL },
];

const deadlineOptions: PickerOption[] = [
  { text: "24h（1天）", value: "24" },
  { text: "72h（3天）", value: "72" },
  { text: "120h（5天）", value: "120" },
  { text: "168h（7天）", value: "168" },
  { text: "240h（10天）", value: "240" },
  { text: "360h（15天）", value: "360" },
];

const OPTION_PAGE_SIZE = 20;

const toCascaderOptions = (nodes: HazardCategoryTreeVO[]): CascaderOption[] =>
  nodes.map((node) => ({
    text: node.name,
    value: String(node.id),
    children: node.children?.length ? toCascaderOptions(node.children) : undefined,
  }));

const findCategoryOptionPath = (options: CascaderOption[], categoryId: string, parentPath: CascaderOption[] = []): CascaderOption[] => {
  for (const option of options) {
    const currentPath = [...parentPath, option];
    if (String(option.value) === categoryId) return currentPath;
    if (option.children?.length) {
      const childPath = findCategoryOptionPath(option.children, categoryId, currentPath);
      if (childPath.length > 0) return childPath;
    }
  }
  return [];
};

const mergeUniqueOptions = (options: PickerOption[], current?: PickerOption): PickerOption[] => {
  const merged = current?.value ? [current, ...options] : options;
  const seen = new Set<string>();
  return merged.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

const readPositiveIntegerText = (value: string): string | undefined => (/^[1-9]\d*$/.test(value) ? value : undefined);

const readOptionalText = (...values: Array<string | number | undefined | null>): string => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  return value === undefined || value === null ? "" : String(value);
};

const readStoredCurrentUser = (): CurrentUserStorage | undefined => {
  const storageKeys = ["GH-UserInfo", "userInfo"];
  for (const key of storageKeys) {
    try {
      const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as CurrentUserStorage;
      }
    } catch {
      // Ignore malformed historical storage and continue with token fallback.
    }
  }
  return undefined;
};

const decodeTokenPayload = (token: string): CurrentUserStorage | undefined => {
  const payload = token.split(".")[1];
  if (!payload) {
    return undefined;
  }
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as CurrentUserStorage;
  } catch {
    return undefined;
  }
};

const readCurrentUser = (): CurrentUserStorage | undefined => {
  const storedUser = readStoredCurrentUser();
  if (storedUser) {
    return storedUser;
  }
  const token = authStore.token || sessionStorage.getItem("token") || "";
  return decodeTokenPayload(token.replace(/^Bearer\s+/i, "").trim());
};

const readNumberLike = (value: number | string | null | undefined): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const toRiskUnitOption = (unit: RiskUnitVO): PickerOption | undefined => {
  const value = readOptionalText(unit.unitId, unit.id);
  const name = readOptionalText(unit.unitName, unit.name, unit.code, value);
  if (!value || !name) return undefined;
  return {
    text: name,
    value,
  };
};

const toRiskObjectOption = (object: RiskObjectVO): PickerOption | undefined => {
  const value = readOptionalText(object.objectId, object.id);
  const name = readOptionalText(object.objectName, object.name, object.objectCode, object.code, value);
  if (!value || !name) return undefined;
  return {
    text: name,
    value,
  };
};

const readRecordCategoryId = (record: ConfirmHazardRecord): string => {
  const categoryRecord = record as LedgerRecordWithCategory;
  if (Array.isArray(categoryRecord.categoryPath) && categoryRecord.categoryPath.length > 0) {
    return String(categoryRecord.categoryPath[categoryRecord.categoryPath.length - 1]);
  }
  if (Array.isArray(categoryRecord.categoryIds) && categoryRecord.categoryIds.length > 0) {
    return String(categoryRecord.categoryIds[categoryRecord.categoryIds.length - 1]);
  }
  if (Array.isArray(categoryRecord.categoryIdPath) && categoryRecord.categoryIdPath.length > 0) {
    return String(categoryRecord.categoryIdPath[categoryRecord.categoryIdPath.length - 1]);
  }
  if (Array.isArray(categoryRecord.category?.path) && categoryRecord.category.path.length > 0) {
    return String(categoryRecord.category.path[categoryRecord.category.path.length - 1]);
  }
  if (Array.isArray(categoryRecord.category?.ids) && categoryRecord.category.ids.length > 0) {
    return String(categoryRecord.category.ids[categoryRecord.category.ids.length - 1]);
  }
  return readOptionalText(
    categoryRecord.categoryId,
    categoryRecord.hazardCategoryId,
    categoryRecord.category?.categoryId,
    categoryRecord.category?.id,
  );
};

const readRecordCategoryName = (record: ConfirmHazardRecord): string => {
  const categoryRecord = record as LedgerRecordWithCategory;
  if (Array.isArray(categoryRecord.categoryNamePath) && categoryRecord.categoryNamePath.length > 0) {
    return categoryRecord.categoryNamePath.map(String).join(" / ");
  }
  return readOptionalText(categoryRecord.categoryName, categoryRecord.hazardCategoryName);
};

const unwrapHazardDetail = (response: HazardDetailResponse, fallbackId: string | number): ConfirmHazardRecord | undefined => {
  const candidate =
    response && typeof response === "object"
      ? ((response as { data?: unknown }).data ??
        (response as { result?: unknown }).result ??
        (response as { details?: unknown }).details ??
        response)
      : undefined;
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }
  const detailSource = candidate as HazardDetailVO | ConfirmHazardRecord;
  const detail = ("basicInfo" in detailSource && detailSource.basicInfo ? detailSource.basicInfo : detailSource) as ConfirmHazardRecord;
  const detailId = readOptionalText(detail.id, detail.hazardId);
  if (detailId && String(detailId) !== String(fallbackId)) {
    return undefined;
  }
  return detail;
};

const toUserOption = (user: User): PickerOption | undefined => {
  if (user.id == null || !user.name) {
    return undefined;
  }
  return {
    text: user.name,
    value: String(user.id),
  };
};

const readSceneImages = (record: ConfirmHazardRecord): FileVO[] => {
  if (Array.isArray(record.sceneImages)) {
    return record.sceneImages;
  }
  if (Array.isArray(record.images)) {
    return record.images;
  }
  return [];
};

const readSceneImageIds = (files: FileVO[]): string =>
  files
    .map((file) => file.id)
    .filter((value): value is string | number => value != null && String(value).trim() !== "")
    .map(String)
    .join(",");

export const ConfirmHazardPopup = defineComponent({
  name: "ConfirmHazardPopup",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    record: {
      type: Object as PropType<HazardLedgerRecordVO | null>,
      default: null,
    },
  },
  emits: ["update:show", "confirmed"],
  setup: (props, { emit }) => {
    const categoryOptions = shallowRef<CascaderOption[]>([]);
    const formRef = ref<FormInstance>();
    const imageUpload = useHazardImageUpload();
    const sceneImages = imageUpload.files;
    const loadingOptions = shallowRef(false);
    const submitting = shallowRef(false);
    const locating = shallowRef(false);
    const showCategory = shallowRef(false);
    const picker = reactive({
      show: false,
      field: "level" as PickerField,
      title: "",
      options: [] as PickerOption[],
    });
    const searchPicker = reactive({
      show: false,
      field: "riskUnitId" as SearchField,
      title: "",
      placeholder: "",
      keyword: "",
      options: [] as PickerOption[],
      loading: false,
      finished: true,
      pageNumber: 0,
    });
    const form = reactive({
      description: "",
      categoryId: "",
      categoryName: "",
      level: HazardLevel.GENERAL,
      riskUnitId: "",
      riskUnitName: "",
      riskObjectId: "",
      riskObjectName: "",
      locationName: "",
      longitude: "",
      latitude: "",
      responsibleUserId: "",
      responsibleUserName: "",
      acceptanceUserId: "",
      acceptanceUserName: "",
      deadline: "24",
    });
    let detailRequestVersion = 0;
    let searchRequestVersion = 0;
    const remoteOptionCache = new Map<string, RemoteOptionCache>();

    const levelText = computed(() => levelOptions.find((item) => item.value === form.level)?.text ?? form.level);
    const deadlineText = computed(() => deadlineOptions.find((item) => item.value === form.deadline)?.text ?? form.deadline);
    const selectedSearchValue = computed(() => form[searchPicker.field]);
    const displayedSearchOptions = computed(() => {
      if (searchPicker.keyword.trim()) return searchPicker.options;
      let current: PickerOption | undefined;
      if (searchPicker.field === "riskUnitId") {
        current = form.riskUnitId ? { value: form.riskUnitId, text: form.riskUnitName || form.riskUnitId } : undefined;
      } else if (searchPicker.field === "riskObjectId") {
        current = form.riskObjectId ? { value: form.riskObjectId, text: form.riskObjectName || form.riskObjectId } : undefined;
      } else if (searchPicker.field === "responsibleUserId") {
        current = form.responsibleUserId
          ? { value: form.responsibleUserId, text: form.responsibleUserName || form.responsibleUserId }
          : undefined;
      } else {
        current = form.acceptanceUserId
          ? { value: form.acceptanceUserId, text: form.acceptanceUserName || form.acceptanceUserId }
          : undefined;
      }
      return mergeUniqueOptions(searchPicker.options, current);
    });
    const requiredRule = (message: string): Array<{ required: true; message: string }> => [{ required: true, message }];
    const imageRequiredRule = [
      {
        validator: () => Boolean(readSceneImageIds(sceneImages.value)),
        message: "请至少上传一张现场照片",
      },
    ];
    const positiveIntegerRule = (
      message: string,
    ): Array<{ required: true; message: string } | { validator: (value: string) => boolean; message: string }> => [
      { required: true, message },
      {
        validator: (value: string) => readPositiveIntegerText(value) != null,
        message: "请输入有效数值",
      },
    ];
    const differentAcceptanceUserRule = [
      { required: true, message: "请选择验收人" },
      {
        validator: (value: string) => value !== form.responsibleUserId,
        message: "验收人与整改责任人不能相同",
      },
    ];

    const close = (force = false): void => {
      if (submitting.value && !force) {
        return;
      }
      emit("update:show", false);
    };

    const syncCategoryName = (): void => {
      if (!form.categoryId || categoryOptions.value.length === 0) {
        return;
      }
      const categoryPath = findCategoryOptionPath(categoryOptions.value, form.categoryId);
      if (categoryPath.length > 0) {
        form.categoryName = categoryPath
          .map((option) => String(option.text ?? ""))
          .filter(Boolean)
          .join(" / ");
      }
    };

    const resetForm = (record: ConfirmHazardRecord): void => {
      const riskUnitId = readOptionalText(record.riskUnitId, record.riskUnit?.unitId, record.riskUnit?.id);
      const riskObjectId = readOptionalText(record.riskObjectId, record.riskObject?.objectId, record.riskObject?.id);
      const responsibleUserId = readOptionalText(record.responsibleUserId, record.responsibleUser?.userId, record.responsibleUser?.id);
      const currentUser = readCurrentUser();
      const acceptanceUserId = readOptionalText(
        currentUser?.id,
        currentUser?.userId,
        currentUser?.userID,
        currentUser?.user_id,
        record.confirmUserId,
        record.confirmUser?.userId,
        record.confirmUser?.id,
        record.acceptanceUserId,
        record.acceptanceUser?.userId,
        record.acceptanceUser?.id,
        record.acceptorUser?.userId,
        record.acceptorUser?.id,
      );
      const rectificationDeadlineHours = readNumberLike(
        record.rectificationDeadlineHours ?? record.deadlineHours ?? record.defaultDeadlineHours,
      );

      form.description = record.description ?? record.hazardDescription ?? "";
      form.categoryId = readRecordCategoryId(record);
      form.categoryName = readRecordCategoryName(record);
      syncCategoryName();
      form.level = record.level ?? record.hazardLevel ?? HazardLevel.GENERAL;
      form.riskUnitId = riskUnitId;
      form.riskUnitName = readOptionalText(record.riskUnitName, record.riskUnit?.unitName, record.riskUnit?.name);
      form.riskObjectId = riskObjectId;
      form.riskObjectName = readOptionalText(record.riskObjectName, record.riskObject?.objectName, record.riskObject?.name);
      form.locationName = record.locationName ?? "";
      form.longitude = record.longitude == null ? "" : String(record.longitude);
      form.latitude = record.latitude == null ? "" : String(record.latitude);
      form.responsibleUserId = responsibleUserId;
      form.responsibleUserName = readOptionalText(
        record.responsibleUserName,
        record.responsibleUser?.userName,
        record.responsibleUser?.name,
      );
      form.acceptanceUserId = acceptanceUserId;
      form.acceptanceUserName = readOptionalText(
        currentUser?.name,
        currentUser?.userName,
        currentUser?.user_name,
        currentUser?.displayName,
        currentUser?.nickname,
        currentUser?.username,
        record.confirmUserName,
        record.confirmUser?.userName,
        record.confirmUser?.name,
        record.acceptanceUserName,
        record.acceptanceUser?.userName,
        record.acceptanceUser?.name,
        record.acceptorUser?.userName,
        record.acceptorUser?.name,
      );
      form.deadline = rectificationDeadlineHours ? String(rectificationDeadlineHours) : "24";
      imageUpload.setFiles(readSceneImages(record));
    };

    const loadOptions = async (): Promise<void> => {
      if (loadingOptions.value || categoryOptions.value.length > 0) {
        return;
      }
      loadingOptions.value = true;
      try {
        const categories = await useAuthRequest(() => getHazardCategoryTree());
        categoryOptions.value = toCascaderOptions(categories);
        syncCategoryName();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "确认选项加载失败，请稍后重试");
      } finally {
        loadingOptions.value = false;
      }
    };

    const getRemoteOptionCacheKey = (): string => {
      const keyword = searchPicker.keyword.trim();
      const parentId = searchPicker.field === "riskObjectId" ? form.riskUnitId : "";
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
      if (searchPicker.field === "riskObjectId" && !form.riskUnitId) return;

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
        const page = await (async () => {
          if (searchPicker.field === "riskUnitId") {
            return useAuthRequest(() =>
              pageUnits({
                pageNumber,
                pageSize: OPTION_PAGE_SIZE,
                keyword: searchPicker.keyword.trim() || undefined,
                view: "option",
              }),
            );
          }
          if (searchPicker.field === "riskObjectId") {
            return useAuthRequest(() =>
              pageRiskObjects({
                unitId: form.riskUnitId,
                pageNumber,
                pageSize: OPTION_PAGE_SIZE,
                keyword: searchPicker.keyword.trim() || undefined,
                view: "option",
              }),
            );
          }
          return useAuthRequest(() =>
            listUsers({
              pageNumber,
              pageSize: OPTION_PAGE_SIZE,
              keyword: searchPicker.keyword.trim() || undefined,
              enabled: true,
            }),
          );
        })();
        if (version !== searchRequestVersion) return;
        const options = (page.records ?? [])
          .map((item) => {
            if (searchPicker.field === "riskUnitId") return toRiskUnitOption(item as RiskUnitVO);
            if (searchPicker.field === "riskObjectId") return toRiskObjectOption(item as RiskObjectVO);
            return toUserOption(item as User);
          })
          .filter((item): item is PickerOption => item != null);
        searchPicker.options = mergeUniqueOptions([...searchPicker.options, ...options]);
        searchPicker.pageNumber = pageNumber;
        const total = page.total ?? 0;
        const pages = page.pages ?? (total > 0 ? Math.ceil(total / OPTION_PAGE_SIZE) : pageNumber);
        searchPicker.finished = searchPicker.options.length >= total || pageNumber >= pages || options.length < OPTION_PAGE_SIZE;
        saveRemoteOptionCache();
      } catch (error) {
        if (version === searchRequestVersion) {
          searchPicker.finished = true;
          const fallbackMessage =
            searchPicker.field === "riskUnitId"
              ? "风险单元加载失败，请稍后重试"
              : searchPicker.field === "riskObjectId"
                ? "风险对象加载失败，请稍后重试"
                : "人员加载失败，请稍后重试";
          showToast(error instanceof Error ? error.message : fallbackMessage);
        }
      } finally {
        if (version === searchRequestVersion) searchPicker.loading = false;
      }
    };

    const loadRecordDetail = async (id: string | number): Promise<void> => {
      detailRequestVersion += 1;
      const version = detailRequestVersion;
      try {
        const response = await useAuthRequest(() => getHazardDetail(id));
        const detail = unwrapHazardDetail(response, id);
        if (detail && version === detailRequestVersion && props.show) {
          resetForm(detail);
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "隐患详情加载失败，已使用列表数据回填");
      }
    };

    watch(
      () => props.show,
      (show) => {
        detailRequestVersion += 1;
        if (show && props.record) {
          resetForm(props.record);
          void loadOptions();
          void loadRecordDetail(props.record.id);
        }
      },
    );

    const openPicker = async (field: PickerField): Promise<void> => {
      picker.field = field;
      if (field === "level") {
        picker.title = "选择隐患等级";
        picker.options = levelOptions;
      } else {
        picker.title = "选择整改时限";
        picker.options = deadlineOptions;
      }
      picker.show = true;
    };

    const openSearchPicker = (field: SearchField): void => {
      if (searchPicker.show && searchPicker.field === field) return;
      if (field === "riskObjectId" && !form.riskUnitId) {
        showToast("请先选择风险单元");
        return;
      }
      searchRequestVersion += 1;
      searchPicker.field = field;
      searchPicker.keyword = "";
      searchPicker.pageNumber = 0;
      searchPicker.options = [];
      searchPicker.loading = false;
      searchPicker.finished = false;
      searchPicker.title =
        field === "riskUnitId"
          ? "选择风险单元"
          : field === "riskObjectId"
            ? "选择风险对象"
            : field === "responsibleUserId"
              ? "选择整改责任人"
              : "选择验收人";
      searchPicker.placeholder = field === "responsibleUserId" || field === "acceptanceUserId" ? "请输入人员姓名" : "请输入名称或编码";
      searchPicker.show = true;
      if (!restoreRemoteOptionCache()) {
        void loadRemoteOptions();
      }
    };

    const searchOptions = (keyword: string): void => {
      searchPicker.keyword = keyword;
      void loadRemoteOptions(true);
    };

    const selectSearchOption = (option: PickerOption): void => {
      if (searchPicker.field === "riskUnitId") {
        if (form.riskUnitId !== option.value) {
          form.riskObjectId = "";
          form.riskObjectName = "";
          searchRequestVersion += 1;
        }
        form.riskUnitId = option.value;
        form.riskUnitName = option.text;
      } else if (searchPicker.field === "riskObjectId") {
        form.riskObjectId = option.value;
        form.riskObjectName = option.text;
      } else if (searchPicker.field === "responsibleUserId") {
        form.responsibleUserId = option.value;
        form.responsibleUserName = option.text;
      } else {
        form.acceptanceUserId = option.value;
        form.acceptanceUserName = option.text;
      }
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

    const locateCurrentPosition = async (): Promise<void> => {
      if (locating.value) {
        return;
      }
      if (getEnvironment() !== "cubeApp") {
        showToast("请在移动端App内使用GPS定位");
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
        form.longitude = String(location.longitude);
        form.latitude = String(location.latitude);
        form.locationName = address || `${location.longitude},${location.latitude}`;
        showToast("定位成功");
      } catch {
        await showGpsDisabledDialog();
      } finally {
        locating.value = false;
      }
    };

    const confirmPicker = (event: { selectedOptions?: Array<{ text?: unknown; value?: unknown }> }): void => {
      const selected = event.selectedOptions?.[0];
      const value = String(selected?.value ?? "");
      if (!value) {
        picker.show = false;
        return;
      }
      if (picker.field === "level") {
        form.level = value;
      } else {
        form.deadline = value;
      }
      picker.show = false;
    };

    const createPayload = (): HazardConfirmCommand | undefined => {
      const sceneImageIds = readSceneImageIds(sceneImages.value);
      const categoryId = readPositiveIntegerText(form.categoryId);
      const riskUnitId = readPositiveIntegerText(form.riskUnitId);
      const riskObjectId = readPositiveIntegerText(form.riskObjectId);
      const longitude = Number(form.longitude);
      const latitude = Number(form.latitude);
      const rectificationDeadlineHours = Number(form.deadline);

      if (!sceneImageIds) {
        showToast("请至少上传一张现场照片");
        return undefined;
      }
      if (!categoryId || !Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        showToast("表单数据异常，请重新填写");
        return undefined;
      }
      const payload: HazardConfirmPayload = {
        sceneImages: sceneImageIds,
        description: form.description.trim(),
        categoryId,
        level: form.level as HazardConfirmCommand["level"],
        ...(riskUnitId ? { riskUnitId } : {}),
        ...(riskObjectId ? { riskObjectId } : {}),
        locationName: form.locationName.trim(),
        longitude,
        latitude,
        responsibleUserId: form.responsibleUserId,
        acceptanceUserId: form.acceptanceUserId,
        rectificationDeadlineHours,
      };
      return payload as unknown as HazardConfirmCommand;
    };

    const submit = async (): Promise<void> => {
      if (!props.record || submitting.value) {
        return;
      }
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      const payload = createPayload();
      if (!payload) {
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() => confirmHazard(props.record?.id ?? "", payload));
        showToast("已确认隐患属实");
        emit("confirmed");
        close(true);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "确认失败，请稍后重试");
      } finally {
        submitting.value = false;
      }
    };

    return () => (
      <>
        <Popup
          show={props.show}
          position="bottom"
          round
          closeOnClickOverlay={!submitting.value}
          onUpdate:show={(show: boolean) => {
            if (!show) close();
          }}
        >
          <div class={styles.confirmSheet}>
            <div class={styles.sheetTitle}>确认属实</div>
            <div class={styles.sheetBody}>
              <Form ref={formRef} required="auto">
                <CellGroup inset>
                  <Field
                    v-model={form.description}
                    label="隐患描述"
                    type="textarea"
                    rows={2}
                    autosize
                    rules={requiredRule("请输入隐患描述")}
                    maxlength={HAZARD_H5_FIELD_LIMITS.longText}
                    showWordLimit
                  />
                  <Field
                    modelValue={readSceneImageIds(sceneImages.value)}
                    label="现场照片"
                    label-align="top"
                    required
                    rules={imageRequiredRule}
                  >
                    {{
                      input: () => (
                        <HazardImageUploader
                          files={sceneImages.value}
                          loading={imageUpload.uploading.value}
                          maxCount={imageUpload.maxCount}
                          emptyText="暂无现场照片"
                          previewSize={88}
                          onUpload={() => {
                            void imageUpload.upload();
                          }}
                          onRemove={imageUpload.removeAt}
                        />
                      ),
                    }}
                  </Field>
                  <Field
                    modelValue={form.categoryId}
                    label="隐患类型"
                    placeholder="请选择"
                    readonly
                    clickable
                    isLink
                    rules={requiredRule("请选择隐患类型")}
                    v-slots={{
                      input: () => <span>{form.categoryName || form.categoryId}</span>,
                    }}
                    onClick={() => {
                      if (categoryOptions.value.length === 0) {
                        showToast(loadingOptions.value ? "类型加载中" : "暂无可选类型");
                        return;
                      }
                      showCategory.value = true;
                    }}
                  />
                  <Field
                    modelValue={form.level}
                    label="隐患等级"
                    readonly
                    clickable
                    isLink
                    rules={requiredRule("请选择隐患等级")}
                    v-slots={{ input: () => <span>{levelText.value}</span> }}
                    onClick={() => {
                      void openPicker("level");
                    }}
                  />
                  <Field
                    modelValue={form.riskUnitId}
                    label="风险单元"
                    placeholder="请选择"
                    readonly
                    clickable
                    isLink
                    v-slots={{
                      input: () => <span>{form.riskUnitName || form.riskUnitId}</span>,
                    }}
                    onClick={() => openSearchPicker("riskUnitId")}
                  />
                  <Field
                    modelValue={form.riskObjectId}
                    label="风险对象"
                    placeholder={form.riskUnitId ? "请选择" : "请先选择风险单元"}
                    readonly
                    clickable
                    isLink
                    v-slots={{
                      input: () => <span>{form.riskObjectName || form.riskObjectId}</span>,
                    }}
                    onClick={() => openSearchPicker("riskObjectId")}
                  />
                  <Field
                    v-model={form.locationName}
                    label="位置"
                    rules={requiredRule("请输入位置")}
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
                  <Field
                    modelValue={form.responsibleUserId}
                    label="整改责任人"
                    placeholder="请选择"
                    readonly
                    clickable
                    isLink
                    rules={requiredRule("请选择整改责任人")}
                    v-slots={{
                      input: () => <span>{form.responsibleUserName}</span>,
                    }}
                    onClick={() => openSearchPicker("responsibleUserId")}
                  />
                  <Field
                    modelValue={form.acceptanceUserId}
                    label="验收人"
                    placeholder="请选择"
                    readonly
                    clickable
                    isLink
                    rules={differentAcceptanceUserRule}
                    v-slots={{
                      input: () => <span>{form.acceptanceUserName}</span>,
                    }}
                    onClick={() => openSearchPicker("acceptanceUserId")}
                  />
                  <Field
                    modelValue={form.deadline}
                    label="整改时限"
                    readonly
                    clickable
                    isLink
                    rules={requiredRule("请选择整改时限")}
                    v-slots={{ input: () => <span>{deadlineText.value}</span> }}
                    onClick={() => {
                      void openPicker("deadline");
                    }}
                  />
                </CellGroup>
              </Form>
            </div>
            <div class={styles.sheetFooter}>
              <Button block disabled={submitting.value} onClick={() => close()}>
                取消
              </Button>
              <Button
                block
                type="primary"
                loading={submitting.value}
                onClick={() => {
                  void submit();
                }}
              >
                确认属实
              </Button>
            </div>
          </div>
        </Popup>
        <Overlay show={submitting.value} zIndex={3000} class={styles.submitOverlay}>
          <div class={styles.submitLoading}>
            <Loading size="24px" vertical>
              确认属实中...
            </Loading>
          </div>
        </Overlay>
        <Popup
          show={showCategory.value}
          position="bottom"
          round
          onUpdate:show={(show: boolean) => {
            showCategory.value = show;
          }}
        >
          <Cascader
            modelValue={form.categoryId}
            title="选择隐患类型"
            options={categoryOptions.value}
            onClose={() => {
              showCategory.value = false;
            }}
            onFinish={(event: { value?: unknown; selectedOptions?: Array<{ text?: unknown; value?: unknown }> }) => {
              const selectedOptions = event.selectedOptions ?? [];
              const lastOption = selectedOptions[selectedOptions.length - 1];
              form.categoryId = String(event.value ?? lastOption?.value ?? "");
              form.categoryName = selectedOptions
                .map((item) => String(item.text ?? ""))
                .filter(Boolean)
                .join(" / ");
              showCategory.value = false;
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
        <Popup
          show={picker.show}
          position="bottom"
          round
          onUpdate:show={(show: boolean) => {
            picker.show = show;
          }}
        >
          <Picker
            title={picker.title}
            columns={picker.options}
            onCancel={() => {
              picker.show = false;
            }}
            onConfirm={confirmPicker}
          />
        </Popup>
      </>
    );
  },
});
