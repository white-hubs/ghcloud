import { Button, Uploader, type UploaderFileListItem } from "vant";
import { defineComponent, type PropType } from "vue";

import type { FileVO } from "@ghcloud/cube-service-interface/hazard-governance";

import styles from "./index.module.less";

const readFileUrl = (file: FileVO & { url?: string }): string => file.path || file.endpointPath || file.url || "";

const toUploaderFiles = (files: FileVO[]): UploaderFileListItem[] =>
  files.map((file) => ({
    url: readFileUrl(file),
    status: "done",
    message: file.name,
    isImage: true,
  }));

export const HazardImageUploader = defineComponent({
  name: "HazardImageUploader",
  props: {
    files: {
      type: Array as PropType<FileVO[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxCount: {
      type: Number,
      default: 3,
    },
    previewSize: {
      type: [Number, String],
      default: 76,
    },
    emptyText: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "拍照/上传",
    },
  },
  emits: {
    upload: () => true,
    remove: (index: number) => Number.isInteger(index),
  },
  setup:
    (props, { emit }) =>
    () => (
      <div class={styles.uploader}>
        {props.files.length > 0 ? (
          <Uploader
            modelValue={toUploaderFiles(props.files)}
            showUpload={false}
            deletable={!props.disabled}
            previewSize={props.previewSize}
            maxCount={props.maxCount}
            onDelete={(_file: UploaderFileListItem, detail: { index: number }) => {
              if (props.disabled) return;
              emit("remove", detail.index);
            }}
          />
        ) : props.emptyText ? (
          <div class={styles.empty}>{props.emptyText}</div>
        ) : null}
        {props.files.length < props.maxCount ? (
          <Button
            icon="photograph"
            type="primary"
            plain
            size="small"
            loading={props.loading}
            disabled={props.loading || props.disabled}
            onClick={() => {
              if (!props.disabled) emit("upload");
            }}
          >
            {props.buttonText}
          </Button>
        ) : null}
        <div class={styles.hint}>支持图片，最多 {props.maxCount} 张</div>
      </div>
    ),
});
