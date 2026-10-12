<template>
  <VanField v-if="props.readonly" :label="props.label" :required="props.required" readonly>
    <template #input>
      <div v-if="effectiveSelectedItems.length" class="readonly-list">
        <div v-for="item in effectiveSelectedItems" :key="itemKey(item)" class="readonly-item">
          <div class="readonly-title">
            <span>{{ item.itemName || `#${item.id}` }}</span>
            <span v-if="item.aiRecognitionEnabled" class="ai-badge">AI</span>
          </div>
          <div v-if="hasConfirmDetail(item)" class="confirm-detail">
            <div class="confirm-detail-row">
              <span class="confirm-detail-label">结果</span>
              <span class="confirm-result" :class="{ abnormal: item.confirmResult === 'ABNORMAL' }">{{ getResultText(item) }}</span>
            </div>
            <div class="confirm-detail-row">
              <span class="confirm-detail-label">备注</span>
              <span class="confirm-detail-text">{{ item.description || "--" }}</span>
            </div>
            <div v-if="item.attachments?.length" class="confirm-images">
              <img
                v-for="(file, fileIndex) in item.attachments"
                :key="getAttachmentKey(file, fileIndex)"
                class="confirm-image"
                :src="getAttachmentUrl(file)"
                alt="确认图片"
                @click="previewItemAttachment(item, file)"
              />
            </div>
          </div>
          <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
        </div>
      </div>
      <span v-else>--</span>
    </template>
  </VanField>
  <template v-else>
    <div class="work-permit-items-inline">
      <VanField
        readonly
        :label="props.label"
        :required="props.required"
        :model-value="selectedSummary"
        :placeholder="`请选择${itemLabel}`"
        :error-message="errorMessage"
      >
        <template #button>
          <VanButton class="add-btn" size="mini" type="primary" icon="plus" @click="addManualItem">添加</VanButton>
        </template>
      </VanField>
      <div class="list">
        <div v-if="loading" class="loading-panel">
          <VanLoading size="20">加载中...</VanLoading>
        </div>
        <template v-else>
          <VanEmpty v-if="displayItems.length === 0" :description="`暂无${itemLabel}`" />
          <div
            v-for="item in displayItems"
            :key="itemKey(item)"
            class="task-card"
            :class="{ checked: isChecked(item), manual: item.custom }"
          >
            <div class="task-row">
              <template v-if="item.custom">
                <div class="task-content">
                  <VanField
                    class="manual-input"
                    :model-value="item.itemName"
                    clearable
                    :placeholder="`请输入${itemLabel}内容`"
                    @click.stop
                    @update:model-value="(value) => updateManualItem(item, value)"
                  />
                  <div v-if="hasConfirmDetail(item)" class="confirm-detail">
                    <div class="confirm-detail-row">
                      <span class="confirm-detail-label">结果</span>
                      <span class="confirm-result" :class="{ abnormal: item.confirmResult === 'ABNORMAL' }">{{ getResultText(item) }}</span>
                    </div>
                    <div class="confirm-detail-row">
                      <span class="confirm-detail-label">备注</span>
                      <span class="confirm-detail-text">{{ item.description || "--" }}</span>
                    </div>
                    <div v-if="item.attachments?.length" class="confirm-images">
                      <img
                        v-for="(file, fileIndex) in item.attachments"
                        :key="getAttachmentKey(file, fileIndex)"
                        class="confirm-image"
                        :src="getAttachmentUrl(file)"
                        alt="确认图片"
                        @click.stop="previewItemAttachment(item, file)"
                      />
                    </div>
                  </div>
                  <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
                </div>
                <div class="task-actions">
                  <VanButton class="confirm-btn" size="mini" type="primary" @click.stop="openConfirm(item)">
                    {{ item.confirmResult ? "编辑" : "确认" }}
                  </VanButton>
                  <VanButton class="remove-btn" size="mini" type="danger" plain @click.stop="removeManualItem(item)">移除</VanButton>
                </div>
              </template>
              <template v-else>
                <div class="task-content">
                  <div class="task-name-line">
                    <span class="task-name">{{ item.itemName || `#${item.id}` }}</span>
                    <span v-if="item.aiRecognitionEnabled" class="ai-badge">AI</span>
                  </div>
                  <div v-if="hasConfirmDetail(item)" class="confirm-detail">
                    <div class="confirm-detail-row">
                      <span class="confirm-detail-label">结果</span>
                      <span class="confirm-result" :class="{ abnormal: item.confirmResult === 'ABNORMAL' }">{{ getResultText(item) }}</span>
                    </div>
                    <div class="confirm-detail-row">
                      <span class="confirm-detail-label">备注</span>
                      <span class="confirm-detail-text">{{ item.description || "--" }}</span>
                    </div>
                    <div v-if="item.attachments?.length" class="confirm-images">
                      <img
                        v-for="(file, fileIndex) in item.attachments"
                        :key="getAttachmentKey(file, fileIndex)"
                        class="confirm-image"
                        :src="getAttachmentUrl(file)"
                        alt="确认图片"
                        @click.stop="previewItemAttachment(item, file)"
                      />
                    </div>
                  </div>
                  <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
                </div>
                <div class="task-actions">
                  <VanButton size="mini" type="primary" @click.stop="openConfirm(item)">
                    {{ item.confirmResult ? "编辑" : "确认" }}
                  </VanButton>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
    <VanPopup v-model:show="confirmVisible" position="right" duration="0.2">
      <div class="confirm-pop">
        <VanNavBar :title="`${itemLabel}确认`" left-text="返回" @click-left="closeConfirm" />
        <div class="confirm-body">
          <VanField label="结果" required>
            <template #input>
              <VanRadioGroup v-model="confirmForm.result" direction="horizontal">
                <VanRadio name="NORMAL">正常</VanRadio>
                <VanRadio name="ABNORMAL">异常</VanRadio>
              </VanRadioGroup>
            </template>
          </VanField>
          <VanField v-model="confirmForm.description" label="备注" type="textarea" rows="4" autosize placeholder="请输入确认备注" />
          <VanField label="附件">
            <template #input>
              <div class="upload-area">
                <template v-for="(file, fileIndex) in confirmForm.attachments" :key="file.id || fileIndex">
                  <div class="van-uploader__preview">
                    <div class="van-image van-uploader__preview-image" @click="previewAttachment(file)">
                      <img :src="file.path || file.url" class="van-image__img" />
                    </div>
                    <div class="van-uploader__preview-delete van-uploader__preview-delete--shadow" @click="removeAttachment(fileIndex)">
                      <i class="van-badge__wrapper van-icon van-icon-cross van-uploader__preview-delete-icon"></i>
                    </div>
                  </div>
                </template>
                <div class="van-uploader" @click="chooseFile">
                  <div class="van-uploader__wrapper">
                    <div class="van-uploader__upload">
                      <i class="van-badge__wrapper van-icon van-icon-plus van-uploader__upload-icon"></i>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </VanField>
        </div>
        <div class="confirm-footer">
          <VanButton
            v-if="currentConfirmItem?.aiRecognitionEnabled"
            block
            plain
            type="primary"
            :loading="aiRecognizing"
            @click="recognizeCurrentItem"
          >
            AI识别
          </VanButton>
          <VanButton block type="primary" @click="confirmItemResult">确定</VanButton>
        </div>
      </div>
    </VanPopup>
    <input ref="uploadInput" type="file" accept="image/*" multiple style="display: none" @change="inputFileChange" />
  </template>
</template>

<script setup lang="ts">
import { closeToast, showImagePreview, showLoadingToast, showToast } from "vant";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { cubeAppService, getAuthHeaders } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { FormItemExpose } from "../../../business/dynamic-table/form-item";
import { resolveRelateParamValue } from "../../../business/dynamic-table/relate-params";
import { cubeFileService } from "../../../service/service";
import { workPermitService, WorkPermitAssociatedItem } from "../../../service/work-permit/work-permit";

const emits = defineEmits(["update:modelValue"]);
const props = withDefaults(
  defineProps<{
    modelValue?: WorkPermitAssociatedItem[] | null;
    required?: boolean;
    readonly?: boolean;
    label?: string;
    formData?: Record<string, any>;
    allFormData?: Record<string, any>;
    parentRowChain?: Record<string, unknown>[];
    params?: string | null;
    params2?: string | null;
    itemType?: "RISK_CHECK" | "ACCEPTANCE";
  }>(),
  {
    modelValue: null,
    formData: () => ({}),
    allFormData: undefined,
    parentRowChain: undefined,
    params: null,
    params2: null,
    itemType: "RISK_CHECK",
  },
);

const confirmVisible = ref(false);
const loading = ref(false);
const aiRecognizing = ref(false);
const records = ref<WorkPermitAssociatedItem[]>([]);
const localSelected = ref<WorkPermitAssociatedItem[]>([]);
const validInput = ref(true);
const page = reactive({ pageNumber: 1, pageSize: 1000, total: 0 });
const route = useRoute();
const underCubeEnvironment = getEnvironment() === "cubeApp";
const uploadInput = ref<HTMLInputElement>();
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get((route.query.businessType as string) ?? "") ?? GLOBAL_SCENE_CODE.approvalCenter;
const currentConfirmKey = ref("");
const associatedItemTypeKey = "__workPermitAssociatedItemType";
let lastEmittedSnapshot = "";
const confirmForm = reactive<{
  result: "NORMAL" | "ABNORMAL";
  description: string;
  attachments: any[];
}>({
  result: "NORMAL",
  description: "",
  attachments: [],
});

const itemLabel = computed(() => (props.itemType === "ACCEPTANCE" ? "验收项" : "检查项"));
const selectedItems = computed(() => localSelected.value.filter((item) => isCurrentTypeItem(item)));
const effectiveSelectedItems = computed(() => selectedItems.value.filter((item) => isEffectiveItem(item)));
const confirmedItems = computed(() => effectiveSelectedItems.value.filter((item) => Boolean(item.confirmResult)));
const hasRemoteSnapshot = computed(() => selectedItems.value.some((item) => !item.custom));
const abnormalResultCount = computed(() => confirmedItems.value.filter((item) => item.confirmResult === "ABNORMAL").length);
const aiAbnormalCount = computed(
  () => confirmedItems.value.filter((item) => item.confirmSource === "AI" && item.confirmResult === "ABNORMAL").length,
);
const selectedSummary = computed(() =>
  effectiveSelectedItems.value.length
    ? `确认项 ${confirmedItems.value.length}；异常 ${abnormalResultCount.value}；AI异常项 ${aiAbnormalCount.value}`
    : "",
);
const errorMessage = computed(() => (!validInput.value && props.required ? `请选择${props.label}` : ""));

const getRelatedValue = (field?: string | null) => {
  if (!field) return null;
  return resolveRelateParamValue(field, props.parentRowChain, props.allFormData ?? props.formData ?? {});
};

const typeName = computed(() => {
  const value = getRelatedValue(props.params);
  if (!value) return null;
  return typeof value === "string" ? value : value.typeName || value.name || null;
});
const workPermitLevel = computed(() => {
  const value = getRelatedValue(props.params2);
  if (!value) return null;
  return typeof value === "string" ? value : value.workPermitLevel || value.name || value.label || null;
});
const displayItems = computed(() => {
  const map = new Map<string, WorkPermitAssociatedItem>();
  records.value.forEach((item) => map.set(itemKey(item), getDisplayItem(item)));
  selectedItems.value.forEach((item) => {
    if (!map.has(itemKey(item))) map.set(itemKey(item), item);
  });
  return Array.from(map.values());
});
const selectedItemMap = computed(() => {
  const map = new Map<string, WorkPermitAssociatedItem>();
  selectedItems.value.forEach((item) => map.set(itemKey(item), item));
  return map;
});
const currentConfirmItem = computed(() => selectedItems.value.find((item) => itemKey(item) === currentConfirmKey.value));

function itemKey(item: WorkPermitAssociatedItem) {
  const type = getAssociatedItemType(item);
  return item.custom ? `${type}-custom-${item.id || item.itemName}` : `${type}-remote-${item.id}`;
}
function getAssociatedItemType(item: WorkPermitAssociatedItem) {
  return ((item as Record<string, unknown>)[associatedItemTypeKey] as typeof props.itemType | undefined) ?? props.itemType;
}
function isCurrentTypeItem(item: WorkPermitAssociatedItem) {
  return getAssociatedItemType(item) === props.itemType;
}
function markAssociatedItem(item: WorkPermitAssociatedItem, itemType = props.itemType) {
  Object.defineProperty(item, associatedItemTypeKey, {
    value: itemType,
    enumerable: false,
    configurable: true,
  });
  return item;
}
function isEffectiveItem(item: WorkPermitAssociatedItem) {
  return !item.custom || Boolean(item.itemName?.trim());
}
function getSelectedItem(item: WorkPermitAssociatedItem) {
  return selectedItemMap.value.get(itemKey(item));
}
function getDisplayItem(item: WorkPermitAssociatedItem) {
  return getSelectedItem(item) || item;
}
function getResultText(item: WorkPermitAssociatedItem) {
  if (item.confirmResult === "NORMAL") {
    return "正常";
  }
  if (item.confirmResult === "ABNORMAL") {
    return "异常";
  }
  return "--";
}
function hasConfirmDetail(item: WorkPermitAssociatedItem) {
  return Boolean(item.confirmResult || item.description || item.attachments?.length);
}
function getAttachmentUrl(file: any) {
  return file?.path || file?.url || "";
}
function getAttachmentKey(file: any, index: number) {
  return String(file?.id ?? file?.uid ?? file?.url ?? file?.path ?? index);
}
function isChecked(item: WorkPermitAssociatedItem) {
  return Boolean(getDisplayItem(item).confirmResult);
}
function hasAiRecognitionMessage(item: WorkPermitAssociatedItem) {
  return Boolean(item.aiRecognitionStatus && item.aiRecognitionStatus !== "SUCCESS");
}
function getAiRecognitionText(item: WorkPermitAssociatedItem) {
  if (item.aiRecognitionStatus === "FAILED") {
    return `AI识别失败：${item.aiRecognitionMessage || "请手动确认"}`;
  }
  if (item.aiRecognitionStatus === "UNRECOGNIZED") {
    return `AI未识别：${item.aiRecognitionMessage || "未识别到明确结果，请手动确认"}`;
  }
  return "";
}
function snapshotItems(items: WorkPermitAssociatedItem[]) {
  return JSON.stringify(
    items.map((item) => ({
      key: itemKey(item),
      associatedItemType: getAssociatedItemType(item),
      itemName: item.itemName ?? "",
      confirmResult: item.confirmResult ?? "",
      description: item.description ?? "",
      confirmSource: item.confirmSource ?? "",
      aiRecognitionStatus: item.aiRecognitionStatus ?? "",
      aiRecognitionMessage: item.aiRecognitionMessage ?? "",
      attachments: (item.attachments ?? []).map((file: any) => file?.id ?? file?.uid ?? file?.url ?? file?.path ?? ""),
    })),
  );
}
function applyLocalSelected(items: WorkPermitAssociatedItem[]) {
  const normalizedItems = normalizeAssociatedItems(items).filter((item) => isCurrentTypeItem(item));
  if (snapshotItems(normalizedItems) !== snapshotItems(selectedItems.value)) {
    localSelected.value = normalizedItems;
  }
  validInput.value = !props.required || normalizeEffectiveItems(normalizedItems).length > 0;
  return normalizedItems;
}
function emitSelected(items: WorkPermitAssociatedItem[]) {
  const normalizedItems = applyLocalSelected(items);
  const nextSnapshot = snapshotItems(normalizedItems);
  if (nextSnapshot === lastEmittedSnapshot) {
    return;
  }
  lastEmittedSnapshot = nextSnapshot;
  emits("update:modelValue", normalizedItems);
}
function mergeLoadedRecordsToSelected(loadedRecords: WorkPermitAssociatedItem[]) {
  const selectedMap = new Map<string, WorkPermitAssociatedItem>();
  selectedItems.value.forEach((item) => selectedMap.set(itemKey(item), item));
  const next = loadedRecords.map((item) => {
    const selectedItem = selectedMap.get(itemKey(item));
    return markAssociatedItem({ ...item, ...(selectedItem || {}), attachments: selectedItem?.attachments ?? item.attachments ?? [] });
  });
  selectedItems.value.forEach((item) => {
    if (item.custom && !next.some((nextItem) => itemKey(nextItem) === itemKey(item))) {
      next.push(item);
    }
  });
  if (next.length !== selectedItems.value.length || next.some((item, index) => itemKey(item) !== itemKey(selectedItems.value[index]))) {
    emitSelected(next);
  }
}
function normalizeRecords(res: any) {
  if (Array.isArray(res?.records)) return res.records;
  if (Array.isArray(res?.list)) return res.list;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}
function normalizeTotal(res: any, list: WorkPermitAssociatedItem[]) {
  return Number(res?.total ?? res?.totalCount ?? res?.count ?? list.length);
}
async function fetchPage(useRemoteSnapshot = true) {
  if (loading.value) return;
  if (useRemoteSnapshot && hasRemoteSnapshot.value) {
    records.value = selectedItems.value.filter((item) => !item.custom);
    page.total = records.value.length;
    return;
  }
  loading.value = true;
  try {
    const api =
      props.itemType === "ACCEPTANCE"
        ? workPermitService.getAcceptanceItems.bind(workPermitService)
        : workPermitService.getRiskCheckItems.bind(workPermitService);
    const res = await api({
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      typeName: typeName.value,
      workPermitLevel: workPermitLevel.value,
    });
    const list = normalizeRecords(res);
    records.value = list;
    page.total = normalizeTotal(res, list);
    mergeLoadedRecordsToSelected(list);
  } finally {
    loading.value = false;
  }
}
function reload() {
  page.pageNumber = 1;
  records.value = [];
  loading.value = false;
  fetchPage(false);
}
function addManualItem() {
  applyLocalSelected([
    ...selectedItems.value,
    createSelectedItem({
      id: `manual-${Date.now()}`,
      itemName: "",
      typeName: typeName.value || undefined,
      workPermitLevel: workPermitLevel.value || undefined,
      custom: true,
    }),
  ]);
}
function updateManualItem(item: WorkPermitAssociatedItem, itemName: string) {
  emitSelected(selectedItems.value.map((selected) => (itemKey(selected) === itemKey(item) ? { ...selected, itemName } : selected)));
}
function removeManualItem(item: WorkPermitAssociatedItem) {
  emitSelected(selectedItems.value.filter((selected) => itemKey(selected) !== itemKey(item)));
}
function normalizeEffectiveItems(items: WorkPermitAssociatedItem[]) {
  return items
    .map((item) => ({
      ...item,
      itemName: item.custom ? (item.itemName || "").trim() : item.itemName,
      attachments: item.attachments ?? [],
      __sourceItemType: getAssociatedItemType(item),
    }))
    .map((item) => {
      const itemType = item.__sourceItemType;
      delete item.__sourceItemType;
      return markAssociatedItem(item, itemType);
    })
    .filter((item) => isEffectiveItem(item));
}
function normalizeAssociatedItems(items: WorkPermitAssociatedItem[]) {
  return items.map((item) => markAssociatedItem({ ...item, attachments: item.attachments ?? [] }, getAssociatedItemType(item)));
}
function createSelectedItem(item: WorkPermitAssociatedItem) {
  return markAssociatedItem({
    ...item,
    attachments: item.attachments ?? [],
  });
}
function updateSelectedItem(key: string, patch: Partial<WorkPermitAssociatedItem>) {
  let matched = false;
  const next = selectedItems.value.map((selected) => {
    if (itemKey(selected) !== key) {
      return selected;
    }
    matched = true;
    return markAssociatedItem(
      { ...selected, ...patch, attachments: patch.attachments ?? selected.attachments ?? [] },
      getAssociatedItemType(selected),
    );
  });
  if (!matched) {
    const source = displayItems.value.find((item) => itemKey(item) === key);
    if (source) {
      next.push(
        markAssociatedItem(
          { ...source, ...patch, attachments: patch.attachments ?? source.attachments ?? [] },
          getAssociatedItemType(source),
        ),
      );
    }
  }
  emitSelected(next);
}
function openConfirm(item: WorkPermitAssociatedItem) {
  const target = getDisplayItem(item);
  currentConfirmKey.value = itemKey(target);
  confirmForm.result = target.confirmResult ?? "NORMAL";
  confirmForm.description = target.description ?? "";
  confirmForm.attachments = [...(target.attachments ?? [])];
  confirmVisible.value = true;
}
function confirmItemResult() {
  updateSelectedItem(currentConfirmKey.value, {
    confirmResult: confirmForm.result,
    description: confirmForm.description.trim(),
    attachments: [...confirmForm.attachments],
    confirmSource: "MANUAL",
    aiRecognitionStatus: undefined,
    aiRecognitionMessage: undefined,
  });
  closeConfirm();
}
function closeConfirm() {
  confirmVisible.value = false;
}
async function chooseFile() {
  if (confirmForm.attachments.length >= 9) {
    showToast("最多上传9张图片");
    return;
  }
  if (!underCubeEnvironment) {
    uploadInput.value?.click();
    return;
  }
  const remain = String(9 - confirmForm.attachments.length);
  const res = await cubeAppService.uploadFile(remain, { sceneCode });
  confirmForm.attachments.push(...res);
  try {
    sceneCode &&
      (await cubeFileService.persistFile(
        sceneCode,
        res.map((file: any) => file.id),
      ));
  } catch {}
}
async function inputFileChange() {
  const files = Array.from(uploadInput.value?.files ?? []);
  if (!files.length) return;
  showLoadingToast({ message: "上传中", duration: 0 });
  try {
    for (const file of files.slice(0, 9 - confirmForm.attachments.length)) {
      if (file.size / 1024 > 1024 * 100) {
        showToast("附件上传大小不能超过100MB");
        continue;
      }
      const res = await cubeFileService.uploadFile({
        file,
        tenant: getAuthHeaders().tenant,
        businessKey: "maintain",
        sceneCode,
      });
      confirmForm.attachments.push(res);
    }
    try {
      sceneCode &&
        (await cubeFileService.persistFile(
          sceneCode,
          confirmForm.attachments.map((file) => file.id),
        ));
    } catch {}
  } finally {
    if (uploadInput.value) uploadInput.value.value = "";
    closeToast();
  }
}
function removeAttachment(index: number) {
  confirmForm.attachments.splice(index, 1);
}
function previewAttachment(file: any) {
  const images = confirmForm.attachments.map((item) => item.path || item.url).filter(Boolean);
  showImagePreview({
    images,
    startPosition: images.findIndex((url) => url === (file.path || file.url)),
  });
}
function previewItemAttachment(item: WorkPermitAssociatedItem, file: any) {
  const images = (item.attachments ?? []).map(getAttachmentUrl).filter(Boolean);
  if (!images.length) return;
  showImagePreview({
    images,
    startPosition: Math.max(
      images.findIndex((url) => url === getAttachmentUrl(file)),
      0,
    ),
  });
}
function readAttachmentIds(attachments: any[]) {
  return attachments
    .map((file) => file.id)
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(String);
}
function unwrapAiResult(response: any) {
  return response?.data ?? response?.result ?? response;
}
function applyAiResult(item: WorkPermitAssociatedItem, response: any, attachments = getDisplayItem(item).attachments ?? []) {
  const result = unwrapAiResult(response);
  if (result?.callResult === "FAILED") {
    showToast(result.failureReason || "AI识别失败，请手动确认");
    updateSelectedItem(itemKey(item), {
      attachments: [...attachments],
      confirmSource: "AI",
      aiRecognitionStatus: "FAILED",
      aiRecognitionMessage: result.failureReason || "AI识别失败，请手动确认",
    });
    return;
  }
  const hazards = Array.isArray(result?.hazards) ? result.hazards : [];
  if (hazards.length === 0 && !result?.confirmResult) {
    showToast("未识别到结果，请手动确认");
    updateSelectedItem(itemKey(item), {
      attachments: [...attachments],
      confirmSource: "AI",
      aiRecognitionStatus: "UNRECOGNIZED",
      aiRecognitionMessage: result?.failureReason || result?.description || "未识别到明确结果，请手动确认",
    });
    return;
  }
  const first = hazards[0] ?? {};
  const key = itemKey(item);
  updateSelectedItem(key, {
    confirmResult: result.confirmResult ?? "ABNORMAL",
    description: result.description ?? first.disposalSuggestion ?? first.hazardTypeName ?? "AI识别异常，请现场复核",
    attachments: [...attachments],
    confirmSource: "AI",
    aiRecognitionStatus: "SUCCESS",
    aiRecognitionMessage: undefined,
  });
  showToast("AI识别完成");
}
async function recognizeCurrentItem() {
  const item = currentConfirmItem.value;
  if (!item?.aiRecognitionEnabled) return;
  if (confirmForm.attachments.length === 0) {
    showToast("请先上传图片后再进行AI识别");
    return;
  }
  const fileIds = readAttachmentIds(confirmForm.attachments);
  if (fileIds.length === 0) {
    showToast("未获取到图片文件ID，请重新上传");
    return;
  }
  aiRecognizing.value = true;
  try {
    const response = await workPermitService.recognizeItemByAi({
      itemContent: confirmForm.description || item.itemName || "",
      fileIds,
    });
    applyAiResult(item, response, confirmForm.attachments);
    confirmVisible.value = false;
  } catch {
    updateSelectedItem(itemKey(item), {
      attachments: [...confirmForm.attachments],
      confirmSource: "AI",
      aiRecognitionStatus: "FAILED",
      aiRecognitionMessage: "AI识别失败，请手动确认",
    });
    showToast("AI识别失败，请手动确认");
  } finally {
    aiRecognizing.value = false;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    const nextValue = Array.isArray(value) ? normalizeAssociatedItems(value).filter((item) => isCurrentTypeItem(item)) : [];
    if (snapshotItems(nextValue) === lastEmittedSnapshot) {
      return;
    }
    localSelected.value = nextValue;
    lastEmittedSnapshot = snapshotItems(nextValue);
  },
  { immediate: true },
);
watch([typeName, workPermitLevel], () => {
  if (!props.readonly) reload();
});

onMounted(() => {
  if (!props.readonly) reload();
});

defineExpose<FormItemExpose>({
  validate: () => {
    const effectiveItems = normalizeEffectiveItems(selectedItems.value).filter((item) => isCurrentTypeItem(item));
    const valid = !props.required || effectiveItems.length > 0;
    validInput.value = valid;
    if (valid) {
      emitSelected(effectiveItems);
    }
    return valid;
  },
});
</script>

<style scoped lang="less">
.work-permit-items-inline {
  width: 100%;
  background: #fff;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  overflow: hidden;
}

.work-permit-items-inline :deep(.van-field) {
  padding: 10px 12px;
}

.add-btn {
  min-width: 52px;
}

.list {
  padding: 8px 10px 10px;
  background: #f7f8fa;
}

.loading-panel {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.task-card {
  padding: 9px 10px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  background: #fff;
}

.task-card + .task-card {
  margin-top: 8px;
}

.task-card.checked {
  border-color: #1989fa;
  background: #f7fbff;
}

.task-card.manual {
  border-style: dashed;
}

.task-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.confirm-btn {
  flex: 0 0 auto;
}

.manual-input {
  padding: 0;
  background: transparent;
}

.manual-input :deep(.van-cell) {
  padding: 0;
}

.manual-input :deep(.van-field__control) {
  font-size: 14px;
}

.remove-btn {
  flex: 0 0 auto;
}

.task-name-line,
.readonly-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
}

.task-name {
  color: #323233;
  line-height: 20px;
  word-break: break-all;
}

.ai-badge {
  flex: 0 0 auto;
  padding: 0 5px;
  border: 1px solid #91caff;
  border-radius: 3px;
  color: #1989fa;
  font-size: 11px;
  line-height: 16px;
  background: #ecf9ff;
}

.confirm-detail {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f7fbff;
  color: #646566;
  font-size: 12px;
}

.confirm-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 20px;
}

.confirm-detail-label {
  flex: 0 0 30px;
  color: #969799;
}

.confirm-result {
  color: #07c160;
  font-weight: 500;
}

.confirm-result.abnormal {
  color: #ee0a24;
}

.confirm-detail-text {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.ai-result-tip {
  margin-top: 8px;
  padding: 7px 9px;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #8a5a00;
  font-size: 12px;
  line-height: 18px;
  background: #fffbe6;
}

.confirm-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.confirm-image {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
  background: #f7f8fa;
}

.readonly-list {
  width: 100%;
}

.readonly-item + .readonly-item {
  margin-top: 10px;
}

.readonly-title {
  color: #323233;
  line-height: 20px;
  word-break: break-all;
}

.confirm-pop {
  width: 100vw;
  height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.confirm-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 8px;
}

.confirm-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-area {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.van-uploader,
.van-uploader__preview {
  flex: 0 0 64px;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

.van-uploader__wrapper,
.van-uploader__upload,
.van-image,
.van-image__img {
  width: 100%;
  height: 100%;
}

.van-image__img {
  object-fit: cover;
}

.van-uploader__preview-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 0 0 0 6px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}
</style>
