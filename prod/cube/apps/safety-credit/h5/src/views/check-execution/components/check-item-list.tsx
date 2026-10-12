import { Empty, Field, Icon, Tag, showImagePreview, showToast } from "vant";
import { defineComponent, type PropType } from "vue";

import type { SafetyCreditId } from "@ghcloud/cube-safety-credit-service";

import { maxCheckPhotoCount, type CheckItemState, type PhotoState } from "../shared";
import { qualityStatusLabel, qualityStatusTone } from "@/constants/safety-credit-enums";
import { formatShortDateTime, trimText } from "@/utils/format";

export const CheckItemList = defineComponent({
  name: "CheckItemList",
  props: {
    items: {
      type: Array as PropType<CheckItemState[]>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
    editingReady: {
      type: Boolean,
      default: false,
    },
    showEditControls: {
      type: Boolean,
      default: false,
    },
    photoUploading: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    updateChecked: (_itemId: SafetyCreditId, _checked: boolean) => true,
    updateRemark: (_itemId: SafetyCreditId, _remark: string) => true,
    uploadPhotos: (_itemId: SafetyCreditId) => true,
    removePhoto: (_itemId: SafetyCreditId, _fileId: string) => true,
  },
  setup: (props, { emit }) => {
    function previewPhoto(photos: PhotoState[], index: number): void {
      const imageUrls = photos.map((photo) => trimText(photo.filePath)).filter((url): url is string => url !== undefined);
      const currentUrl = trimText(photos[index]?.filePath);
      if (imageUrls.length === 0 || currentUrl === undefined) {
        showToast("暂无可预览图片");
        return;
      }
      showImagePreview({
        images: imageUrls,
        startPosition: Math.max(0, imageUrls.indexOf(currentUrl)),
        closeable: true,
      });
    }

    function renderPhotoArea(item: CheckItemState): JSX.Element | null {
      if (item.photos.length === 0 && !props.showEditControls) {
        return null;
      }
      const uploadDisabled = !props.editingReady || props.photoUploading || item.photos.length >= maxCheckPhotoCount;
      const uploadText = !props.editingReady
        ? "待加载"
        : props.photoUploading
          ? "上传中"
          : item.photos.length >= maxCheckPhotoCount
            ? "已达上限"
            : item.photos.length === 0
              ? "拍照上传"
              : "继续上传";

      return (
        <div class="check-photo-area">
          <div class="check-photo-list">
            {item.photos.map((photo, index) => (
              <div class={["check-photo-item", photo.qualityStatus !== undefined ? "with-ai" : ""]} key={photo.fileId}>
                <button type="button" class="check-photo-preview-button" onClick={() => previewPhoto(item.photos, index)}>
                  {photo.filePath !== undefined ? (
                    <div class="check-photo-preview">
                      <img src={photo.filePath} alt={photo.fileName} />
                      <span>{formatShortDateTime(photo.captureTime)}</span>
                    </div>
                  ) : (
                    <div class="check-photo-file">{photo.fileName.slice(0, 1).toUpperCase()}</div>
                  )}
                </button>
                {photo.qualityStatus !== undefined ? (
                  <div class="check-photo-ai">
                    <div>
                      <span>AI判定结果：</span>
                      <Tag type={qualityStatusTone(photo.qualityStatus)}>{qualityStatusLabel(photo.qualityStatus)}</Tag>
                    </div>
                    {photo.qualityStatus === "SUSPECTED_FAKE" && trimText(photo.qualityReason) !== undefined ? (
                      <p>{trimText(photo.qualityReason)}</p>
                    ) : null}
                  </div>
                ) : (
                  <p>{photo.fileName}</p>
                )}
                {props.editingReady ? (
                  <button type="button" class="check-photo-remove" onClick={() => emit("removePhoto", item.itemId, photo.fileId)}>
                    删除
                  </button>
                ) : null}
              </div>
            ))}
            {props.showEditControls ? (
              <button
                type="button"
                class={["check-photo-upload-card", uploadDisabled ? "disabled" : ""]}
                disabled={uploadDisabled}
                onClick={() => emit("uploadPhotos", item.itemId)}
              >
                <span class="check-photo-upload-icon">
                  <Icon name="photograph" />
                </span>
                <span>{uploadText}</span>
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    function renderCheckItem(item: CheckItemState, index: number): JSX.Element {
      const remarkText = trimText(item.remark) ?? "暂无备注";
      return (
        <article class={["check-item-card", item.checked ? "done" : ""]} key={String(item.itemId)}>
          <div class="check-item-body">
            <button
              type="button"
              class={["check-item-toggle", item.checked ? "done" : ""]}
              disabled={props.readonly}
              onClick={() => emit("updateChecked", item.itemId, !item.checked)}
              aria-label={item.checked ? "取消完成" : "标记完成"}
            >
              <span />
            </button>
            <div class="check-item-content">
              <div class="check-item-title-row">
                <span class="check-item-index">{index + 1}</span>
                <strong>{item.itemName}</strong>
                {item.required ? <em class="check-source-tag base">必查</em> : null}
                {item.photoRequired ? <em class="check-source-tag photo">需拍照</em> : null}
              </div>
              {props.readonly ? (
                <div class={["check-item-remark-text", trimText(item.remark) === undefined ? "empty" : ""]}>{remarkText}</div>
              ) : (
                <Field
                  class="check-item-remark"
                  modelValue={item.remark}
                  type="textarea"
                  rows={3}
                  autosize={{ minHeight: 72, maxHeight: 160 }}
                  maxlength={300}
                  showWordLimit
                  placeholder="请输入备注"
                  onUpdate:modelValue={(value: string) => emit("updateRemark", item.itemId, value)}
                />
              )}
              {renderPhotoArea(item)}
            </div>
          </div>
        </article>
      );
    }

    return (): JSX.Element => (
      <section class="check-item-list">
        {props.items.length === 0 ? <Empty description="暂无检查项" /> : props.items.map(renderCheckItem)}
      </section>
    );
  },
});
