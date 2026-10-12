import { DropDown, Menu, MenuItem } from "@ghcloud/cube-ui";
import { Icon } from "@iconify/vue";
import "./iconify-init";
import { defineComponent, ref, type PropType } from "vue";
import type { MaterialFolder } from "../types";
import styles from "./material-card.module.less";

const CLICK_DELAY = 250;

export const MaterialFolderCard = defineComponent({
  props: {
    folder: {
      type: Object as PropType<MaterialFolder>,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click", "dblclick", "rename", "delete"],
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
      if (key === "open") {
        emit("dblclick");
      } else if (key === "rename") {
        emit("rename");
      } else if (key === "delete") {
        emit("delete");
      }
    };

    return (): JSX.Element => (
      <DropDown trigger={["contextmenu"]}>
        {{
          default: () => (
            <div
              class={[
                styles["card-base"],
                props.selected ? styles["card-selected"] : "",
              ]}
              onClick={handleClick}
              onDblclick={handleDblClick}
            >
              <Icon icon="mdi:folder" style={{ fontSize: "48px", color: "#faad14" }} />
              <div class={styles["card-name"]} title={props.folder.name}>
                {props.folder.name}
              </div>
            </div>
          ),
          overlay: () => (
            <Menu onClick={handleMenuClick}>
              <MenuItem key="open">打开</MenuItem>
              <MenuItem key="rename">重命名</MenuItem>
              <MenuItem key="delete">
                <span style={{ color: "#ff4d4f" }}>删除</span>
              </MenuItem>
            </Menu>
          ),
        }}
      </DropDown>
    );
  },
});
