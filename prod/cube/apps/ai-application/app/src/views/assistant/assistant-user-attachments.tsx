import type { ImageAttachment } from "@cube-ai/contracts";
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";

import { authStore } from "../../api/auth-store";
import { buildAgenticEngineRequestHeaders, fetchAuthenticatedPreviewBlobUrl, resolveAttachmentPreviewSrc } from "./assistant-multimodal";

import styles from "./assistant-chat.module.less";

export const AssistantUserAttachments = defineComponent({
  name: "AssistantUserAttachments",
  props: {
    attachments: { type: Array as () => ImageAttachment[], required: true },
    mediaBaseUrl: { type: String, required: true },
  },
  setup(props) {
    const previewSrcById = ref<Record<string, string>>({});

    const revokeBlobUrls = (map: Record<string, string>): void => {
      for (const src of Object.values(map)) {
        if (src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
      }
    };

    const loadPreviews = async (): Promise<void> => {
      revokeBlobUrls(previewSrcById.value);
      previewSrcById.value = {};
      const headers = buildAgenticEngineRequestHeaders({
        tenant: authStore.tenant,
        terminal: authStore.terminal,
        token: authStore.token,
      });
      const next: Record<string, string> = {};
      await Promise.all(
        props.attachments.map(async (att) => {
          const previewUrl = att.previewUrl?.trim() ?? "";
          if (previewUrl === "") {
            return;
          }
          const blobUrl = await fetchAuthenticatedPreviewBlobUrl(previewUrl, props.mediaBaseUrl, headers);
          if (blobUrl != null) {
            next[att.attachmentId] = blobUrl;
          }
        }),
      );
      previewSrcById.value = next;
    };

    watch(
      () => [props.attachments, props.mediaBaseUrl] as const,
      () => {
        void loadPreviews();
      },
      { immediate: true, deep: true },
    );

    onBeforeUnmount(() => {
      revokeBlobUrls(previewSrcById.value);
    });

    return () => (
      <div class={styles.userAttachmentRow}>
        {props.attachments.map((att) => {
          const blobSrc = previewSrcById.value[att.attachmentId];
          const linkHref = blobSrc ?? resolveAttachmentPreviewSrc(att.previewUrl ?? "", props.mediaBaseUrl);
          return (
            <a key={att.attachmentId} class={styles.userAttachmentThumb} href={linkHref} target="_blank" rel="noopener noreferrer">
              {blobSrc != null ? (
                <img src={blobSrc} alt={att.fileId} />
              ) : (
                <span class={styles.userAttachmentPlaceholder} title="图片加载中或预览失败">
                  {att.fileId}
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  },
});
