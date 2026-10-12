<script setup lang="ts">
import { FileTextOutlined, UploadOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { computed, shallowRef, watch } from "vue";

import { CubeFileService, GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

type ContentFile = {
  id: number | string;
  name: string;
  path?: string;
  url?: string;
  size?: number;
  suffix?: string;
  type?: string;
};

type UploadOptions = {
  file: File;
  onSuccess?: (response?: unknown, file?: File) => void;
  onError?: (error: unknown) => void;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    files?: ContentFile[];
    readonly?: boolean;
    showHeader?: boolean;
  }>(),
  {
    modelValue: "",
    files: () => [],
    readonly: false,
    showHeader: true,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "update:files", value: ContentFile[]): void;
  (event: "upload-pending", value: boolean): void;
}>();

const maxCount = 5;
const maxSize = 20 * 1024 * 1024;
const accepting = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
const fileList = shallowRef<ContentFile[]>([]);
const pendingCount = shallowRef(0);

const normalizeFiles = (files: ContentFile[]) =>
  files.filter(Boolean).map((file) => ({
    ...file,
    name: file.name || "未命名文件",
    url: file.url || file.path,
  }));

const updateValue = () => {
  emit("update:modelValue", fileList.value.map((file) => file.id).join(","));
  emit("update:files", fileList.value);
};

watch(pendingCount, (count) => emit("upload-pending", count > 0), { flush: "sync" });

watch(
  () => props.files,
  (files) => {
    fileList.value = normalizeFiles(files);
  },
  { immediate: true },
);

const hasDuplicate = (file: File) => fileList.value.some((item) => item.name === file.name);

const beforeUpload = (file: File) => {
  if (hasDuplicate(file)) {
    message.warning("文件已存在");
    return false;
  }
  if (file.size > maxSize) {
    message.warning(`文件“${file.name}”超过20MB，无法上传`);
    return false;
  }
  if (fileList.value.length + pendingCount.value >= maxCount) {
    message.warning("最多上传5个附件");
    return false;
  }
  pendingCount.value += 1;
  return true;
};

const uploadFile = async ({ file, onSuccess, onError }: UploadOptions) => {
  try {
    const token = JSON.parse(sessionStorage.getItem("GH-Token") || "{}").access_token;
    const tenant = JSON.parse(sessionStorage.getItem("GH-NowEnterprise") || "{}").code;
    const fileService = new CubeFileService({
      token,
      tenant,
      terminal: "bimops-manage-web",
    });
    const uploaded = (await fileService.uploadFile({
      file,
      businessKey: "emergency",
      sceneCode: GLOBAL_SCENE_CODE.emergencyFile,
    })) as ContentFile;
    fileList.value = [
      ...fileList.value,
      {
        ...uploaded,
        name: uploaded.name || file.name,
        url: uploaded.path || uploaded.url,
      },
    ];
    updateValue();
    onSuccess?.({ data: uploaded }, file);
  } catch (error) {
    message.error("文件上传失败，请稍后重试");
    onError?.(error);
  } finally {
    pendingCount.value = Math.max(0, pendingCount.value - 1);
  }
};

const removeFile = (id: ContentFile["id"]) => {
  fileList.value = fileList.value.filter((file) => String(file.id) !== String(id));
  updateValue();
};

const isImage = (file: ContentFile) => {
  const extension = (file.suffix || file.name.split(".").pop() || "").toLowerCase();
  return Boolean(file.url) && (file.type?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(extension));
};

const attachmentText = computed(() => (fileList.value.length ? `已上传 ${fileList.value.length} 个附件` : "暂无附件"));
</script>

<template>
  <div class="generated-attachment-upload">
    <div v-if="showHeader" class="attachment-header">
      <div>
        <h3>附件</h3>
        <p>支持 PDF、Word、Excel、图片等，单个不超过 20MB，最多5个</p>
      </div>
      <a-upload
        v-if="!readonly"
        :accept="accepting"
        :multiple="true"
        :show-upload-list="false"
        :before-upload="beforeUpload"
        :custom-request="uploadFile"
      >
        <a-button class="upload-button" size="small"> <UploadOutlined />点击上传 </a-button>
      </a-upload>
    </div>
    <div v-else class="attachment-actions">
      <span>{{ attachmentText }}</span>
      <a-upload
        v-if="!readonly"
        :accept="accepting"
        :multiple="true"
        :show-upload-list="false"
        :before-upload="beforeUpload"
        :custom-request="uploadFile"
      >
        <a-button size="small"><UploadOutlined />点击上传</a-button>
      </a-upload>
    </div>
    <div v-if="fileList.length" class="attachment-list">
      <div v-for="file in fileList" :key="file.id" class="attachment-item">
        <img v-if="isImage(file)" :src="file.url" :alt="file.name" class="attachment-thumbnail" />
        <FileTextOutlined v-else class="file-icon" />
        <span class="file-name" :title="file.name">{{ file.name }}</span>
        <button v-if="!readonly" class="remove-button" type="button" aria-label="删除附件" @click="removeFile(file.id)">×</button>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.generated-attachment-upload {
  width: 100%;
  padding: 16px 18px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.attachment-header,
.attachment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attachment-header h3 {
  margin: 0 0 3px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.attachment-header p,
.attachment-actions span {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.upload-button {
  color: #1e92b8;
  border-color: #1e92b8;
}

.attachment-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 9px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.file-icon {
  flex: none;
  color: #1e92b8;
  font-size: 18px;
}

.attachment-thumbnail {
  flex: none;
  width: 44px;
  height: 34px;
  object-fit: cover;
  border-radius: 4px;
}

.file-name {
  overflow: hidden;
  color: #374151;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-button {
  flex: none;
  margin-left: auto;
  color: #6b7280;
  font-size: 18px;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.remove-button:hover {
  color: #ef4444;
}
</style>
