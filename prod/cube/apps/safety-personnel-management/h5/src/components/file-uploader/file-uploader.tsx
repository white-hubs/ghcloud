import { Button, Icon, Uploader, showToast } from "vant";
import { defineComponent, type PropType, ref, watch, type VNode } from "vue";

import type { FileVO } from "@ghcloud/cube-service-interface/safety-personnel";

import { uploadBusinessFile } from "@/api/file-service";
import { toOssPreviewPath } from "@/utils/file-url";

import styles from "./file-uploader.module.less";

interface DisplayFile {
  id: string;
  name: string;
  url?: string;
}

export const FileUploader = defineComponent({
  emits: ["update:fileIds", "update:files"],
  props: {
    fileIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    files: {
      type: Array as PropType<FileVO[]>,
      default: () => [],
    },
    sceneCode: {
      type: String,
      required: true,
    },
    maxCount: {
      type: Number,
      default: 6,
    },
    accept: {
      type: String,
      default: "*",
    },
    imageMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const uploading = ref(false);
    const displayFiles = ref<DisplayFile[]>([]);

    watch(
      () => [props.fileIds, props.files] as const,
      () => {
        const fromFiles = props.files
          .filter((f) => f.id)
          .map((f) => ({
            id: String(f.id),
            name: f.name || String(f.id),
            url: toOssPreviewPath(f),
          }));
        const existedIds = new Set(fromFiles.map((f) => f.id));
        const fromIds = props.fileIds
          .filter((id) => !existedIds.has(String(id)))
          .map((id) => ({
            id: String(id),
            name: String(id),
          }));
        displayFiles.value = [...fromFiles, ...fromIds];
      },
      { immediate: true, deep: true },
    );

    const syncFiles = (next: DisplayFile[]): void => {
      displayFiles.value = next;
      emit(
        "update:fileIds",
        next.map((f) => f.id),
      );
      emit(
        "update:files",
        next.map((f) => ({ id: f.id, name: f.name, path: f.url })),
      );
    };

    const handleAfterRead = async (item: { file?: File | File[] }): Promise<void> => {
      const rawFiles = Array.isArray(item.file) ? item.file : item.file ? [item.file] : [];
      if (rawFiles.length === 0) {
        return;
      }
      uploading.value = true;
      try {
        const uploaded: DisplayFile[] = [];
        for (const file of rawFiles) {
          const result = await uploadBusinessFile(file, props.sceneCode);
          if (result.id) {
            uploaded.push({
              id: String(result.id),
              name: result.name || file.name,
              url: toOssPreviewPath(result),
            });
          }
        }
        syncFiles([...displayFiles.value, ...uploaded].slice(0, props.maxCount));
      } catch (error) {
        showToast((error as Error)?.message || "上传失败");
      } finally {
        uploading.value = false;
      }
    };

    const removeFile = (id: string): void => {
      syncFiles(displayFiles.value.filter((f) => f.id !== id));
    };

    return (): VNode => (
      <div class={styles.upload}>
        <div class={styles.files}>
          {displayFiles.value.map((file) => (
            <div class={props.imageMode ? styles.imageItem : styles.fileItem} key={file.id}>
              {props.imageMode && file.url ? <img src={file.url} alt={file.name} /> : <Icon name="description" />}
              <span>{file.name}</span>
              <Icon name="cross" class={styles.remove} onClick={() => removeFile(file.id)} />
            </div>
          ))}
        </div>
        {displayFiles.value.length < props.maxCount ? (
          <Uploader
            accept={props.accept}
            multiple={!props.imageMode}
            maxCount={props.maxCount - displayFiles.value.length}
            afterRead={handleAfterRead}
          >
            <Button size="small" type="primary" loading={uploading.value} icon="plus">
              上传
            </Button>
          </Uploader>
        ) : null}
      </div>
    );
  },
});
