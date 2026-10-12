import styles from "./navbar.module.less";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { only } from "node:test";
import { NavBar as VantNanBar } from "vant";
import { defineComponent, onMounted, type VNode } from "vue";

interface Props {
  title: string;
  showBack?: boolean;
  rightText?: string;
  rightSlot?: VNode;
  onlyBack?: boolean;
}

/** 通用H5 导航栏 */
export const NavBar = defineComponent({
  props: ["title", "showBack", "rightText", "rightSlot", "onlyBack"],
  emits: ["clickLeft", "clickRight"],
  setup(props: Props, { emit }) {
    onMounted(async () => {
      try {
        await cubeAppService.onVisibilityNativeAppBar(false);
      } catch {}
    });

    return () => (
      <VantNanBar
        class={styles["cube-navbar"]}
        title={props.title ?? ""}
        leftArrow={props.showBack ?? true}
        onClickLeft={async () => {
          if (props.onlyBack) {
            emit("clickLeft");
            return;
          }
          try {
            await cubeAppService.backPage();
          } catch {
            window.history.back();
          }
        }}
        right-text={props.rightText}
        v-slots={{ right: props.rightSlot }}
        onClickRight={() => {
          emit("clickRight");
        }}
        style="position: sticky; top: 0px;z-index: 1;"
      />
    );
  },
});
