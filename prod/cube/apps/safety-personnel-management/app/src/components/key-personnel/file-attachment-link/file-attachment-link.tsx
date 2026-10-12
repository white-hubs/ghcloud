import { defineComponent, type PropType } from "vue";

import type { FileVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { Image, PaperClipOutlined } from "@ghcloud/cube-ui";

import { downloadAttachment, isImageFile, toImageSrc } from "@/utils/key-personnel/file-attachment";

import styles from "./file-attachment-link.module.less";

export const FileAttachmentLink = defineComponent({
  props: {
    file: { type: Object as PropType<FileVO>, required: true },
    /** 图片附件是否内联预览（监管上报记录等场景） */
    previewImage: { type: Boolean, default: false },
  },
  setup(props) {
    const onClick = (event: MouseEvent): void => {
      event.preventDefault();
      downloadAttachment(props.file);
    };

    return (): JSX.Element => {
      const url = toImageSrc(props.file);
      if (props.previewImage && isImageFile(props.file) && url) {
        return (
          <div class={styles.imagePreview}>
            <Image
              src={url}
              alt={props.file.name ?? "图片附件"}
              title={props.file.name ?? "图片附件"}
              width={72}
              height={72}
              style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "6px" }}
            />
          </div>
        );
      }

      return (
        <a class={styles.link} href="#" title={props.file.name ?? "下载附件"} onClick={onClick}>
          <PaperClipOutlined />
          <span>{props.file.name ?? "附件"}</span>
        </a>
      );
    };
  },
});
