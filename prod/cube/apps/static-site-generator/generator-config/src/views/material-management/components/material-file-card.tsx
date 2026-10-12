import { Icon } from "@iconify/vue";
import { defineComponent, ref, type PropType } from "vue";

import "./iconify-init";
import { DropDown, Menu, MenuItem } from "@ghcloud/cube-ui";

import { formatFileSize, getMaterialType } from "../mock";
import type { Material } from "../types";

import styles from "./material-card.module.less";

const CLICK_DELAY = 250;

const typeConfig: Record<string, { icon: string; color: string; label: string; previewClass: string; tagClass: string }> = {
  image: { icon: "mdi:image", color: "#52c41a", label: "图片", previewClass: styles["type-image"], tagClass: styles["type-image-tag"] },
  video: { icon: "mdi:video", color: "#722ed1", label: "视频", previewClass: styles["type-video"], tagClass: styles["type-video-tag"] },
  font: { icon: "mdi:format-font", color: "#eb2f96", label: "字体", previewClass: styles["type-font"], tagClass: styles["type-font-tag"] },
  other: {
    icon: "mdi:file-document-outline",
    color: "#8c8c8c",
    label: "其他",
    previewClass: styles["type-other"],
    tagClass: styles["type-other-tag"],
  },
};

export const MaterialFileCard = defineComponent({
  props: {
    material: {
      type: Object as PropType<Material>,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click", "dblclick", "rename", "move", "delete"],
  setup(props, { emit }) {
    const clickTimer = ref<number | null>(null);

    const handleClick = (e: MouseEvent): void => {
      // Ctrl/Cmd + 单击：立即多选，不延迟
      if (e.ctrlKey || e.metaKey) {
        if (clickTimer.value) {
          clearTimeout(clickTimer.value);
          clickTimer.value = null;
        }
        emit("click", e);
        return;
      }

      // 普通单击：延迟执行，避免与双击冲突
      if (clickTimer.value) {
        clearTimeout(clickTimer.value);
        clickTimer.value = null;
        return;
      }

      clickTimer.value = window.setTimeout(() => {
        clickTimer.value = null;
        emit("click", e);
      }, CLICK_DELAY);
    };

    const handleDblClick = (): void => {
      if (clickTimer.value) {
        clearTimeout(clickTimer.value);
        clickTimer.value = null;
      }
      emit("dblclick");
    };

    const handleMenuClick = ({ key }: { key: string }): void => {
      if (key === "preview") {
        emit("dblclick");
      } else if (key === "rename") {
        emit("rename");
      } else if (key === "move") {
        emit("move");
      } else if (key === "delete") {
        emit("delete");
      }
    };

    return (): JSX.Element => {
      const type = getMaterialType(props.material.mimeType, props.material.ext);
      const config = typeConfig[type];
      const isImage = type === "image";
      const imageUrl = props.material.url;

      return (
        <DropDown trigger={["contextmenu"]}>
          {{
            default: () => (
              <div
                class={[styles["card-base"], props.selected ? styles["card-selected"] : ""]}
                onClick={handleClick}
                onDblclick={handleDblClick}
              >
                {/* 预览区域 */}
                <div class={`${styles["preview-box"]} ${config.previewClass}`}>
                  {isImage && imageUrl ? (
                    <img class={styles["preview-image"]} src={imageUrl} alt={props.material.name} />
                  ) : (
                    <Icon icon={config.icon} style={{ fontSize: "40px", color: config.color }} />
                  )}
                  {/* 类型标签 */}
                  <span class={`${styles["preview-tag"]} ${config.tagClass}`}>{config.label}</span>
                </div>

                {/* 名称 */}
                <div class={styles["card-name"]} title={`${props.material.name}.${props.material.ext}`}>
                  {props.material.name}
                </div>

                {/* 大小 */}
                <div class={styles["card-size"]}>{formatFileSize(props.material.size)}</div>
              </div>
            ),
            overlay: () => (
              <Menu onClick={handleMenuClick}>
                <MenuItem key="preview">预览</MenuItem>
                <MenuItem key="rename">重命名</MenuItem>
                <MenuItem key="move">移动</MenuItem>
                <MenuItem key="delete">
                  <span style={{ color: "#ff4d4f" }}>删除</span>
                </MenuItem>
              </Menu>
            ),
          }}
        </DropDown>
      );
    };
  },
});
