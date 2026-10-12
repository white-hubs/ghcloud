import { defineComponent } from "vue";

import { Image } from "@ghcloud/cube-ui";

import styles from "./file-image-thumb.module.less";

export const FileImageThumb = defineComponent({
  name: "FileImageThumb",
  props: {
    src: { type: String, default: "" },
    size: { type: Number, default: 32 },
    alt: { type: String, default: "" },
    preview: { type: Boolean, default: true },
  },
  setup(props) {
    return (): JSX.Element => {
      if (!props.src) {
        return <span class={styles.placeholder}>—</span>;
      }
      return (
        <div class={styles.thumb} style={{ width: `${props.size}px`, height: `${props.size}px` }}>
          <Image
            src={props.src}
            alt={props.alt}
            width={props.size}
            height={props.size}
            preview={props.preview}
            style={{ objectFit: "contain" }}
          />
        </div>
      );
    };
  },
});
