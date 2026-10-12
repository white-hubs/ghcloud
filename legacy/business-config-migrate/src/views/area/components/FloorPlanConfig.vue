<script setup lang="ts">
import { DeleteOutlined, FileImageOutlined, UploadOutlined } from "@ant-design/icons-vue";
import { message, Upload, type UploadProps } from "ant-design-vue";
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from "vue";

import { GLOBAL_SCENE_CODE, type FileState } from "@ghcloud/cube-file-service";

import { cubeFileService } from "@/api/service";

const props = defineProps<{
  fileId: string | null;
  file: FileState | null;
  coordinateAxis: string | null;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  "update:fileId": [value: string | null];
  "update:file": [value: FileState | null];
  "update:coordinateAxis": [value: string | null];
  "uploading-change": [value: boolean];
}>();

type Corner = "bottomLeft" | "topRight";
type Axis = "x" | "y";
type Point = Record<Axis, number | null>;
const corners: { key: Corner; label: string; number: number }[] = [
  { key: "bottomLeft", label: "图片左下角", number: 1 },
  { key: "topRight", label: "图片右上角", number: 2 },
];
const axes: { key: Axis; label: string }[] = [
  { key: "x", label: "横坐标 X" },
  { key: "y", label: "纵坐标 Y" },
];
const coordinates = reactive<Record<Corner, Point>>({
  bottomLeft: { x: 0, y: 0 },
  topRight: { x: null, y: null },
});
const uploading = shallowRef(false);
const loadingFile = shallowRef(false);
const loadedFile = shallowRef<FileState | null>(null);
const fileError = shallowRef("");
const validationError = shallowRef("");
const activeCorner = shallowRef<Corner>("bottomLeft");
const imageReady = shallowRef(false);
const imageError = shallowRef(false);
const imageRatio = shallowRef(1);
const previewStage = shallowRef<HTMLElement>();
const stageWidth = shallowRef(500);
const inputRefs = new Map<string, { focus: () => void }>();
let resizeObserver: ResizeObserver | undefined;
let fileRequest = 0;
let disposed = false;

const previewUrl = computed(() => loadedFile.value?.path || "");
const imageStyle = computed(() => ({
  width: `${Math.min(Math.max(stageWidth.value, 1), 180 * imageRatio.value)}px`,
  aspectRatio: String(imageRatio.value),
}));

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

watch(
  () => props.coordinateAxis,
  (value) => {
    let parsed;
    try {
      parsed = value ? JSON.parse(value) : null;
    } catch {
      parsed = null;
    }
    for (const corner of corners) {
      for (const axis of axes) {
        const pointValue = parsed?.[corner.key]?.[axis.key];
        coordinates[corner.key][axis.key] = isNumber(pointValue) ? pointValue : !value && corner.key === "bottomLeft" ? 0 : null;
      }
    }
  },
  { immediate: true },
);

async function loadFile() {
  const request = ++fileRequest;
  loadedFile.value = null;
  imageReady.value = false;
  imageError.value = false;
  fileError.value = "";
  loadingFile.value = false;
  if (!props.fileId) return;
  if (props.file?.path && String(props.file.id) === props.fileId) {
    loadedFile.value = props.file;
    return;
  }
  loadingFile.value = true;
  try {
    const file = await cubeFileService.getFileInfo(props.fileId);
    if (request !== fileRequest || disposed) return;
    if (!file.path) throw new Error("平面图地址不存在");
    loadedFile.value = file;
  } catch {
    if (request === fileRequest && !disposed) fileError.value = "平面图加载失败，请重试或重新上传。";
  } finally {
    if (request === fileRequest && !disposed) loadingFile.value = false;
  }
}
watch([() => props.fileId, () => props.file], loadFile, { immediate: true });
watch(previewUrl, () => {
  imageReady.value = false;
  imageError.value = false;
});

function updateCoordinate(corner: Corner, axis: Axis, value: number | string | null) {
  coordinates[corner][axis] = isNumber(value) ? value : null;
  validationError.value = "";
  const empty = corners.every(({ key }) => axes.every(({ key: axis }) => coordinates[key][axis] === null));
  emit("update:coordinateAxis", empty && !props.fileId ? null : JSON.stringify(coordinates));
}

function focusCorner(corner: Corner) {
  activeCorner.value = corner;
  inputRefs.get(`${corner}.x`)?.focus();
}

function onImageLoad(event: Event) {
  const image = event.target as HTMLImageElement;
  imageRatio.value = image.naturalWidth / image.naturalHeight;
  imageReady.value = true;
}

const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  if (!/\.(png|jpe?g|webp)$/i.test(file.name) || (file.type && !/^image\/(png|jpeg|webp)$/.test(file.type))) {
    message.error("请上传 PNG、JPG 或 WebP 格式的平面图");
    return Upload.LIST_IGNORE;
  }
  if (file.size > 20 * 1024 * 1024) {
    message.error("平面图大小不能超过 20 MB");
    return Upload.LIST_IGNORE;
  }
  return true;
};

const uploadFile: UploadProps["customRequest"] = async (options) => {
  if (uploading.value) return;
  uploading.value = true;
  emit("uploading-change", true);
  try {
    const file = await cubeFileService.uploadFile({
      businessKey: "mdata",
      sceneCode: GLOBAL_SCENE_CODE.spaceList,
      useTemporary: true,
      file: options.file as File,
    });
    if (disposed) return;
    if (!file.id) throw new Error("上传失败：未返回文件编号");
    emit("update:file", { ...file, id: String(file.id) });
    emit("update:fileId", String(file.id));
    validationError.value = "";
    options.onSuccess?.(file);
  } catch (error) {
    if (disposed) return;
    const uploadError = error instanceof Error ? error : new Error("平面图上传失败，请重试");
    message.error(uploadError.message);
    options.onError?.(uploadError);
  } finally {
    if (!disposed) {
      uploading.value = false;
      emit("uploading-change", false);
    }
  }
};

function removeFile() {
  emit("update:fileId", null);
  emit("update:file", null);
  emit("update:coordinateAxis", null);
  activeCorner.value = "bottomLeft";
  validationError.value = "";
}

function validate() {
  validationError.value = "";
  if (uploading.value) {
    validationError.value = "请等待平面图上传完成";
    return false;
  }
  if (!props.fileId && !props.coordinateAxis) return true;
  for (const corner of corners) {
    for (const axis of axes) {
      if (!isNumber(coordinates[corner.key][axis.key])) {
        validationError.value = `请填写${corner.label}的${axis.label}`;
        activeCorner.value = corner.key;
        inputRefs.get(`${corner.key}.${axis.key}`)?.focus();
        return false;
      }
    }
  }
  const { bottomLeft, topRight } = coordinates;
  if (topRight.x! <= bottomLeft.x! || topRight.y! <= bottomLeft.y!) {
    validationError.value = "右上角的 X、Y 坐标须分别大于左下角，才能形成有效范围";
    focusCorner("topRight");
    return false;
  }
  return true;
}
defineExpose({ validate });

watch(
  previewStage,
  (stage) => {
    resizeObserver?.disconnect();
    if (!stage) return;
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) stageWidth.value = entry.contentRect.width;
    });
    resizeObserver.observe(stage);
  },
  { flush: "post" },
);
onBeforeUnmount(() => {
  disposed = true;
  fileRequest++;
  resizeObserver?.disconnect();
});
</script>

<template>
  <div v-if="!fileId" class="plan-upload-entry">
    <a-upload
      accept=".png,.jpg,.jpeg,.webp"
      :multiple="false"
      :max-count="1"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      :custom-request="uploadFile"
      :disabled="disabled || uploading"
    >
      <a-button :loading="uploading" :disabled="disabled || uploading"><UploadOutlined />上传平面图</a-button>
    </a-upload>
    <span class="upload-hint">PNG / JPG / WebP，最大 20 MB</span>
  </div>
  <section v-else class="floor-plan-config" aria-label="平面图与坐标轴配置">
    <div class="plan-panel">
      <div class="plan-toolbar">
        <div class="plan-title">
          <FileImageOutlined />
          <span :title="loadedFile?.name || '区域平面图'">{{ loadedFile?.name || "区域平面图" }}</span>
        </div>
        <a-space :size="4">
          <a-upload
            accept=".png,.jpg,.jpeg,.webp"
            :multiple="false"
            :max-count="1"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            :custom-request="uploadFile"
            :disabled="disabled || uploading"
          >
            <a-button type="link" size="small" :loading="uploading" :disabled="disabled">更换</a-button>
          </a-upload>
          <a-popconfirm title="移除平面图并清空坐标配置？" ok-text="移除" cancel-text="取消" @confirm="removeFile">
            <a-button type="text" size="small" danger :disabled="disabled || uploading" aria-label="移除平面图">
              <DeleteOutlined />
            </a-button>
          </a-popconfirm>
        </a-space>
      </div>
      <div ref="previewStage" class="preview-stage" :aria-busy="uploading || loadingFile">
        <a-spin v-if="uploading || loadingFile" tip="正在加载平面图…" />
        <div v-else-if="fileError || imageError" class="preview-empty" role="alert">
          <FileImageOutlined class="empty-icon" />
          <p>{{ fileError || "图片无法预览，请检查文件或重新上传。" }}</p>
          <a-button @click="loadFile">重新加载</a-button>
        </div>
        <div v-else-if="previewUrl" class="image-frame" :style="imageStyle">
          <img :src="previewUrl" alt="区域平面图" @load="onImageLoad" @error="imageError = true" />
          <template v-if="imageReady">
            <button
              v-for="corner in corners"
              :key="corner.key"
              type="button"
              class="corner-marker"
              :class="corner.key"
              :aria-label="`配置${corner.label}坐标`"
              :disabled="disabled"
              @click="focusCorner(corner.key)"
            >
              {{ corner.number }}
            </button>
            <span
              class="corner-caption bottomLeft"
              :title="`左下角 (${coordinates.bottomLeft.x ?? '—'}, ${coordinates.bottomLeft.y ?? '—'})`"
            >
              左下角 ({{ coordinates.bottomLeft.x ?? "—" }}, {{ coordinates.bottomLeft.y ?? "—" }})
            </span>
            <span class="corner-caption topRight" :title="`右上角 (${coordinates.topRight.x ?? '—'}, ${coordinates.topRight.y ?? '—'})`">
              右上角 ({{ coordinates.topRight.x ?? "—" }}, {{ coordinates.topRight.y ?? "—" }})
            </span>
          </template>
        </div>
      </div>
    </div>

    <div class="coordinate-panel">
      <div v-for="corner in corners" :key="corner.key" class="coordinate-card" :class="{ active: activeCorner === corner.key }">
        <h4>
          <span class="corner-number">{{ corner.number }}</span
          >{{ corner.label }}
        </h4>
        <div class="coordinate-fields">
          <label v-for="axis in axes" :key="axis.key">
            <span>{{ axis.label }}<i v-if="fileId || coordinateAxis"> *</i></span>
            <a-input-number
              :ref="
                (el) => {
                  if (el) inputRefs.set(`${corner.key}.${axis.key}`, el as unknown as { focus: () => void });
                }
              "
              :value="coordinates[corner.key][axis.key]"
              :disabled="disabled || uploading"
              :aria-label="`${corner.label}${axis.label}`"
              :title="String(coordinates[corner.key][axis.key] ?? '')"
              :controls="false"
              placeholder="填写实际坐标"
              @change="updateCoordinate(corner.key, axis.key, $event)"
              @focus="activeCorner = corner.key"
            />
          </label>
        </div>
      </div>
      <div v-if="validationError" class="validation-error" role="alert">{{ validationError }}</div>
    </div>
  </section>
</template>

<style scoped>
.plan-upload-entry {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}
.upload-hint {
  color: #8c95a3;
  font-size: 12px;
}
.floor-plan-config {
  --plan-primary: var(--cube-theme-var--primary-color, #1677ff);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  align-items: center;
}
.plan-panel {
  min-width: 0;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  overflow: hidden;
}
.plan-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 6px 10px;
  border-bottom: 1px solid #edf0f4;
}
.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 500;
}
.plan-title > span:nth-child(2) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plan-toolbar > :last-child {
  flex-shrink: 0;
}
.preview-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 228px;
  padding: 24px 32px;
  background-color: #f8fafc;
  background-image: radial-gradient(#dfe5ed 1px, transparent 1px);
  background-size: 16px 16px;
}
.preview-empty {
  text-align: center;
  color: #8c95a3;
}
.empty-icon {
  margin-bottom: 12px;
  color: #aab8ca;
  font-size: 36px;
}
.preview-empty p {
  margin: 0 0 18px;
  font-size: 12px;
}
.image-frame {
  position: relative;
  flex-shrink: 0;
  outline: 1px solid var(--plan-primary);
  background: #fff;
}
.image-frame img {
  display: block;
  width: 100%;
  height: 100%;
}
.corner-marker {
  position: absolute;
  z-index: 1;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--plan-primary);
  box-shadow: 0 0 0 1px var(--plan-primary);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.corner-marker.bottomLeft {
  left: 0;
  bottom: 0;
  transform: translate(-50%, 50%);
}
.corner-marker.topRight {
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}
.corner-caption {
  position: absolute;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--plan-primary);
  font-size: 11px;
}
.corner-caption.bottomLeft {
  left: 14px;
  top: calc(100% + 8px);
}
.corner-caption.topRight {
  right: 14px;
  bottom: calc(100% + 8px);
}
.coordinate-panel {
  display: grid;
  gap: 12px;
  min-width: 0;
}
.coordinate-card {
  padding: 12px;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  transition: border-color 0.2s;
}
.coordinate-card.active {
  border-color: var(--plan-primary);
}
.coordinate-card h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 500;
}
.corner-number {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--plan-primary);
  color: #fff;
  font-size: 12px;
}
.coordinate-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
}
.coordinate-fields label > span {
  display: block;
  margin-bottom: 4px;
  color: #596579;
  font-size: 12px;
}
.coordinate-fields label > :last-child {
  width: 100%;
}
.coordinate-fields i {
  color: #f04438;
  font-style: normal;
}
.validation-error {
  color: #f04438;
  font-size: 12px;
}
@media (max-width: 680px) {
  .floor-plan-config {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
