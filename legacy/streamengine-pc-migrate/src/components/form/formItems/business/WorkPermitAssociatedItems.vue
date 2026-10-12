<script lang="ts" setup>
import { message } from "ant-design-vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { cubeFileService } from "@/api/service";
import { getWorkPermitAcceptanceItems, getWorkPermitRiskCheckItems, recognizeWorkPermitItemByAi } from "@/api/work-permit";

type AssociatedItem = {
  id?: string | number;
  itemName?: string;
  typeName?: string;
  workPermitLevel?: string;
  custom?: boolean;
  aiRecognitionEnabled?: boolean;
  confirmResult?: "NORMAL" | "ABNORMAL";
  description?: string;
  attachments?: any[];
  confirmSource?: "MANUAL" | "AI";
  aiRecognitionStatus?: "SUCCESS" | "UNRECOGNIZED" | "FAILED";
  aiRecognitionMessage?: string;
};

const emits = defineEmits(["update:modelValue", "clearValidate"]);
const props = withDefaults(
  defineProps<{
    modelValue?: AssociatedItem[] | null;
    readonly?: boolean;
    formData?: Record<string, any>;
    allFormData?: Record<string, any>;
    parentRowChain?: Record<string, unknown>[];
    params?: string | null;
    params2?: string | null;
    itemType?: "RISK_CHECK" | "ACCEPTANCE";
  }>(),
  {
    modelValue: null,
    readonly: false,
    formData: () => ({}),
    allFormData: undefined,
    parentRowChain: undefined,
    params: null,
    params2: null,
    itemType: "RISK_CHECK",
  },
);

const route = useRoute();
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get((route.query.businessType as string) ?? "") ?? GLOBAL_SCENE_CODE.approvalCenter;
const loading = ref(false);
const confirmVisible = ref(false);
const confirmLoading = ref(false);
const aiRecognizing = ref(false);
const currentConfirmKey = ref("");
const confirmForm = reactive<{
  result: "NORMAL" | "ABNORMAL";
  description: string;
  attachments: any[];
}>({
  result: "NORMAL",
  description: "",
  attachments: [],
});
const records = ref<AssociatedItem[]>([]);
const page = reactive({
  pageNumber: 1,
  pageSize: 1000,
  total: 0,
});

const isEffectiveItem = (item: AssociatedItem) => {
  return !item.custom || Boolean(item.itemName?.trim());
};

const selectedItems = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));
const effectiveSelectedItems = computed(() => selectedItems.value.filter((item) => isEffectiveItem(item)));
const confirmedItems = computed(() => effectiveSelectedItems.value.filter((item) => Boolean(item.confirmResult)));
const hasRemoteSnapshot = computed(() => selectedItems.value.some((item) => !item.custom));
const itemLabel = computed(() => (props.itemType === "ACCEPTANCE" ? "验收项" : "检查项"));
const manualPlaceholder = computed(() => `添加${itemLabel.value}`);
const manualInputPlaceholder = computed(() => `请输入${itemLabel.value}内容`);
const abnormalResultCount = computed(() => confirmedItems.value.filter((item) => item.confirmResult === "ABNORMAL").length);
const aiAbnormalCount = computed(
  () => confirmedItems.value.filter((item) => item.confirmSource === "AI" && item.confirmResult === "ABNORMAL").length,
);
const summaryText = computed(
  () => `确认项 ${confirmedItems.value.length}；异常 ${abnormalResultCount.value}；AI异常项 ${aiAbnormalCount.value}`,
);

const resolveRelateParamValue = (key: string, rowChain: Record<string, unknown>[] | undefined, root: Record<string, any>) => {
  if (rowChain?.length) {
    for (let i = rowChain.length - 1; i >= 0; i -= 1) {
      const row = rowChain[i];
      if (row && typeof row === "object" && !Array.isArray(row) && Object.prototype.hasOwnProperty.call(row, key)) {
        return row[key];
      }
    }
  }
  return root[key];
};

const getRelatedValue = (field?: string | null) => {
  if (!field) {
    return null;
  }
  return resolveRelateParamValue(field, props.parentRowChain, props.allFormData ?? props.formData ?? {});
};

const typeName = computed(() => {
  const value = getRelatedValue(props.params);
  if (!value) {
    return null;
  }
  return typeof value === "string" ? value : value.typeName || value.name || null;
});

const workPermitLevel = computed(() => {
  const value = getRelatedValue(props.params2);
  if (!value) {
    return null;
  }
  return typeof value === "string" ? value : value.workPermitLevel || value.name || value.label || null;
});

const itemKey = (item: AssociatedItem) => {
  if (item.custom) {
    return `custom-${item.id || item.itemName}`;
  }
  return `remote-${item.id}`;
};

const selectedItemMap = computed(() => {
  const map = new Map<string, AssociatedItem>();
  selectedItems.value.forEach((item) => map.set(itemKey(item), item));
  return map;
});

const getSelectedItem = (item: AssociatedItem) => selectedItemMap.value.get(itemKey(item));

const getDisplayItem = (item: AssociatedItem) => getSelectedItem(item) || item;

const getResultText = (item: AssociatedItem) => {
  if (item.confirmResult === "NORMAL") {
    return "正常";
  }
  if (item.confirmResult === "ABNORMAL") {
    return "异常";
  }
  return "--";
};

const hasConfirmDetail = (item: AssociatedItem) => {
  return Boolean(item.confirmResult || item.description || item.attachments?.length);
};

const getAttachmentUrl = (file: any) => file?.path || file?.url || "";

const getAttachmentKey = (file: any, index: number) => String(file?.id ?? file?.uid ?? file?.url ?? file?.path ?? index);

const currentConfirmItem = computed(() => selectedItems.value.find((item) => itemKey(item) === currentConfirmKey.value));

const hasAiRecognitionMessage = (item: AssociatedItem) => {
  return Boolean(item.aiRecognitionStatus && item.aiRecognitionStatus !== "SUCCESS");
};

const getAiRecognitionText = (item: AssociatedItem) => {
  if (item.aiRecognitionStatus === "FAILED") {
    return `AI识别失败：${item.aiRecognitionMessage || "请手动确认"}`;
  }
  if (item.aiRecognitionStatus === "UNRECOGNIZED") {
    return `AI未识别：${item.aiRecognitionMessage || "未识别到明确结果，请手动确认"}`;
  }
  return "";
};

const displayItems = computed(() => {
  const map = new Map<string, AssociatedItem>();
  records.value.forEach((item) => map.set(itemKey(item), getDisplayItem(item)));
  selectedItems.value.forEach((item) => {
    if (!map.has(itemKey(item))) {
      map.set(itemKey(item), item);
    }
  });
  return Array.from(map.values());
});

const normalizeRecords = (res: any): AssociatedItem[] => {
  if (Array.isArray(res?.records)) {
    return res.records;
  }
  if (Array.isArray(res?.list)) {
    return res.list;
  }
  if (Array.isArray(res?.data)) {
    return res.data;
  }
  if (Array.isArray(res)) {
    return res;
  }
  return [];
};

const mergeLoadedRecordsToSelected = (loadedRecords: AssociatedItem[]) => {
  const selectedMap = new Map<string, AssociatedItem>();
  selectedItems.value.forEach((item) => selectedMap.set(itemKey(item), item));
  const next = loadedRecords.map((item) => normalizeEffectiveItem({ ...item, ...(selectedMap.get(itemKey(item)) || {}) }));
  selectedItems.value.forEach((item) => {
    if (item.custom && !next.some((nextItem) => itemKey(nextItem) === itemKey(item))) {
      next.push(item);
    }
  });
  if (next.length !== selectedItems.value.length || next.some((item, index) => itemKey(item) !== itemKey(selectedItems.value[index]))) {
    emitSelected(next);
  }
};

const fetchPage = async (useRemoteSnapshot = true) => {
  if (props.readonly) {
    return;
  }
  if (useRemoteSnapshot && hasRemoteSnapshot.value) {
    records.value = selectedItems.value.filter((item) => !item.custom);
    page.total = records.value.length;
    return;
  }
  loading.value = true;
  try {
    const api = props.itemType === "ACCEPTANCE" ? getWorkPermitAcceptanceItems : getWorkPermitRiskCheckItems;
    const res: any = await api({
      pageNumber: page.pageNumber,
      pageSize: page.pageSize,
      typeName: typeName.value,
      workPermitLevel: workPermitLevel.value,
    });
    records.value = normalizeRecords(res);
    mergeLoadedRecordsToSelected(records.value);
    page.total = Number(res?.total ?? res?.totalCount ?? records.value.length);
  } finally {
    loading.value = false;
  }
};

const emitSelected = (items: AssociatedItem[]) => {
  emits("update:modelValue", items);
  emits("clearValidate");
};

const isChecked = (item: AssociatedItem) => {
  return Boolean(getDisplayItem(item).confirmResult);
};

const addManualItem = () => {
  emitSelected([
    ...selectedItems.value,
    {
      id: `manual-${Date.now()}`,
      itemName: "",
      typeName: typeName.value || undefined,
      workPermitLevel: workPermitLevel.value || undefined,
      custom: true,
    },
  ]);
};

const updateManualItem = (item: AssociatedItem, itemName: string) => {
  emitSelected(selectedItems.value.map((selected) => (itemKey(selected) === itemKey(item) ? { ...selected, itemName } : selected)));
};

const removeManualItem = (item: AssociatedItem) => {
  emitSelected(selectedItems.value.filter((selected) => itemKey(selected) !== itemKey(item)));
};

const reload = () => {
  page.pageNumber = 1;
  fetchPage(false);
};

const rowIndex = (_item: AssociatedItem, index: number) => {
  return index + 1;
};

const normalizeEffectiveItem = (item: AssociatedItem) => ({
  ...item,
  itemName: item.custom ? (item.itemName || "").trim() : item.itemName,
  attachments: item.attachments ?? [],
});

const openConfirm = (item: AssociatedItem) => {
  const target = getDisplayItem(item);
  currentConfirmKey.value = itemKey(target);
  confirmForm.result = target.confirmResult ?? "NORMAL";
  confirmForm.description = target.description ?? "";
  confirmForm.attachments = [...(target.attachments ?? [])];
  confirmVisible.value = true;
};

const updateSelectedItem = (key: string, patch: Partial<AssociatedItem>) => {
  let matched = false;
  const next = selectedItems.value.map((selected) => {
    if (itemKey(selected) !== key) {
      return selected;
    }
    matched = true;
    return normalizeEffectiveItem({ ...selected, ...patch });
  });
  if (!matched) {
    const source = displayItems.value.find((item) => itemKey(item) === key);
    if (source) {
      next.push(normalizeEffectiveItem({ ...source, ...patch }));
    }
  }
  emitSelected(next);
};

const confirmItemResult = () => {
  updateSelectedItem(currentConfirmKey.value, {
    confirmResult: confirmForm.result,
    description: confirmForm.description.trim(),
    attachments: [...confirmForm.attachments],
    confirmSource: "MANUAL",
    aiRecognitionStatus: undefined,
    aiRecognitionMessage: undefined,
  });
  confirmVisible.value = false;
};

const attachmentFileList = computed(() =>
  confirmForm.attachments.map((file, index) => ({
    uid: String(file.uid ?? file.id ?? index),
    name: file.name ?? `附件${index + 1}`,
    status: "done",
    url: file.path ?? file.url,
  })),
);

const beforeUpload = (file: File) => {
  if (confirmForm.attachments.length >= 9) {
    message.warning("最多上传9个附件");
    return false;
  }
  if (file.size / 1024 > 1024 * 100) {
    message.warning("附件上传大小不能超过100MB");
    return false;
  }
  return true;
};

const uploadAttachment = async (data: any) => {
  const res = await cubeFileService.uploadFile({
    file: data.file,
    businessKey: "maintain",
    sceneCode,
  });
  try {
    sceneCode && (await cubeFileService.persistFile(sceneCode, [res.id]));
  } catch {}
  confirmForm.attachments.push(res);
  data.onSuccess?.(res);
};

const removeAttachment = (file: any) => {
  const uid = String(file.uid ?? "");
  const index = confirmForm.attachments.findIndex((item, idx) => String(item.uid ?? item.id ?? idx) === uid);
  if (index >= 0) {
    confirmForm.attachments.splice(index, 1);
  }
};

const readAttachmentIds = (attachments: any[]) =>
  attachments
    .map((file) => file.id)
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(String);

const unwrapAiResult = (response: any) => response?.data ?? response?.result ?? response;

const applyAiResult = (item: AssociatedItem, response: any, attachments = getDisplayItem(item).attachments ?? []) => {
  const result = unwrapAiResult(response);
  if (result?.callResult === "FAILED") {
    message.warning(result.failureReason || "AI识别失败，请手动确认");
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
    message.warning("未识别到结果，请手动确认");
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
  message.success("AI识别完成");
};

const recognizeCurrentItem = async () => {
  const item = currentConfirmItem.value;
  if (!item?.aiRecognitionEnabled) {
    return;
  }
  if (confirmForm.attachments.length === 0) {
    message.warning("请先上传图片后再进行AI识别");
    return;
  }
  const fileIds = readAttachmentIds(confirmForm.attachments);
  if (fileIds.length === 0) {
    message.warning("未获取到图片文件ID，请重新上传");
    return;
  }
  aiRecognizing.value = true;
  try {
    const response = await recognizeWorkPermitItemByAi({
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
    message.warning("AI识别失败，请手动确认");
  } finally {
    aiRecognizing.value = false;
  }
};

watch([typeName, workPermitLevel], reload);

onMounted(fetchPage);

defineExpose({
  validator: () => {
    emitSelected(effectiveSelectedItems.value.map(normalizeEffectiveItem));
    return Promise.resolve();
  },
});
</script>

<template>
  <div class="work-permit-items">
    <template v-if="props.readonly">
      <div v-if="effectiveSelectedItems.length" class="readonly-list">
        <div v-for="(item, index) in effectiveSelectedItems" :key="itemKey(item)" class="task-row checked">
          <span class="task-index">{{ index + 1 }}</span>
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
                />
              </div>
            </div>
            <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
          </div>
        </div>
      </div>
      <span v-else>--</span>
    </template>

    <template v-else>
      <div class="items-header">
        <div class="summary">{{ summaryText }}</div>
        <a-button size="small" type="primary" @click="addManualItem">{{ manualPlaceholder }}</a-button>
      </div>

      <a-spin :spinning="loading">
        <div class="task-list">
          <a-empty v-if="displayItems.length === 0" :description="`暂无${itemLabel}`" />
          <div
            v-for="(item, index) in displayItems"
            v-else
            :key="itemKey(item)"
            class="task-row"
            :class="{ checked: isChecked(item), manual: item.custom }"
          >
            <span class="task-index">{{ rowIndex(item, index) }}</span>
            <template v-if="item.custom">
              <div class="task-content">
                <a-input
                  class="manual-input"
                  :value="item.itemName"
                  :placeholder="manualInputPlaceholder"
                  @update:value="(value) => updateManualItem(item, value)"
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
                    />
                  </div>
                </div>
                <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
              </div>
              <a-button size="small" type="primary" @click="openConfirm(item)">{{ item.confirmResult ? "编辑" : "确认" }}</a-button>
              <a-button class="remove-btn" type="link" danger @click="removeManualItem(item)">移除</a-button>
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
                    />
                  </div>
                </div>
                <div v-if="hasAiRecognitionMessage(item)" class="ai-result-tip">{{ getAiRecognitionText(item) }}</div>
              </div>
              <a-button size="small" type="primary" @click="openConfirm(item)">{{ item.confirmResult ? "编辑" : "确认" }}</a-button>
            </template>
          </div>
        </div>
      </a-spin>
    </template>

    <a-modal
      v-model:visible="confirmVisible"
      :title="`${itemLabel}确认`"
      :confirm-loading="confirmLoading"
      @ok="confirmItemResult"
      @cancel="confirmVisible = false"
    >
      <div class="confirm-form">
        <div class="form-row">
          <span class="form-label">结果</span>
          <a-radio-group v-model:value="confirmForm.result">
            <a-radio value="NORMAL">正常</a-radio>
            <a-radio value="ABNORMAL">异常</a-radio>
          </a-radio-group>
        </div>
        <div class="form-row">
          <span class="form-label">备注</span>
          <a-textarea v-model:value="confirmForm.description" :rows="4" placeholder="请输入确认备注" />
        </div>
        <div class="form-row attachment-form-row">
          <span class="form-label">附件</span>
          <div class="attachment-control">
            <a-upload
              class="attachment-upload"
              multiple
              accept="image/*"
              :custom-request="uploadAttachment"
              :before-upload="beforeUpload"
              :file-list="attachmentFileList"
              @remove="removeAttachment"
            >
              <a-button>上传图片</a-button>
            </a-upload>
            <a-button
              v-if="currentConfirmItem?.aiRecognitionEnabled"
              class="ai-recognition-btn"
              type="primary"
              :loading="aiRecognizing"
              @click="recognizeCurrentItem"
            >
              AI识别
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
.work-permit-items {
  width: 100%;
}

.items-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.summary {
  flex: 1;
  min-width: 0;
  color: #1677ff;
  font-size: 12px;
}

.task-list {
  min-height: 80px;
  margin-bottom: 8px;
}

.task-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  background: #fff;
}

.task-row.checked {
  border-color: #91caff;
  background: #f0f7ff;
}

.task-row.manual {
  align-items: flex-start;
  border-style: dashed;
  border-color: #91caff;
  background: #f8fbff;
}

.task-index {
  flex: 0 0 24px;
  height: 24px;
  line-height: 22px;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  color: #666;
  font-size: 12px;
}

.task-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
}

.task-name {
  word-break: break-all;
}

.ai-badge {
  flex: 0 0 auto;
  padding: 0 6px;
  border: 1px solid #91caff;
  border-radius: 3px;
  color: #1677ff;
  font-size: 12px;
  line-height: 18px;
  background: #e6f4ff;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.confirm-detail {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f7fbff;
  color: #4b5563;
  font-size: 12px;
}

.confirm-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 20px;
}

.confirm-detail-label {
  flex: 0 0 32px;
  color: #8c8c8c;
}

.confirm-result {
  color: #16a34a;
  font-weight: 500;
}

.confirm-result.abnormal {
  color: #f5222d;
}

.confirm-detail-text {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

.ai-result-tip {
  margin-top: 8px;
  padding: 7px 10px;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #8a5a00;
  font-size: 12px;
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
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  object-fit: cover;
  background: #fff;
}

.manual-input {
  width: 100%;
  min-width: 0;
}

.remove-btn {
  flex: 0 0 auto;
  padding-right: 0;
  padding-left: 0;
}

.readonly-list .task-row {
  margin-bottom: 4px;
}

.confirm-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-label {
  flex: 0 0 48px;
  color: #4b5563;
  line-height: 32px;
  text-align: right;
}

.attachment-form-row {
  align-items: flex-start;
}

.attachment-control {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.attachment-upload {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.attachment-upload :deep(.ant-upload-list),
.attachment-upload :deep(.ant-upload-list-item),
.attachment-upload :deep(.ant-upload-list-item-info) {
  max-width: 100%;
}

.attachment-upload :deep(.ant-upload-list-item-name) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-recognition-btn {
  flex: 0 0 auto;
}
</style>
