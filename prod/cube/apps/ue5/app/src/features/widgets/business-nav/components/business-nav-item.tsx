import { defineComponent } from "vue";

import type { SceneDataType } from "@/infrastructure/api/models/mdata";

import styles from "./business-nav-item.module.less";

const defaultImg = "/resource/v1/ue5-migrate/assets/images/nav/default-img.png";

interface Props {
  navItem: SceneDataType;
  activeId: string;
}

export const BusinessNavItem = defineComponent({
  props: ["navItem", "activeId"],
  emits: ["clickNav", "hoverNav", "mouseleaveNav"],
  setup(props: Props, { emit }) {
    /**
     * 点击菜单事件
     * @param nav 菜单数据
     * @param lv 层级
     */
    function clickNav(nav: SceneDataType, lv: number): void {
      emit("clickNav", nav, lv);
    }

    function onMouseenter(): void {
      emit("hoverNav", props.navItem);
    }

    function onMouseleave(): void {
      setTimeout(() => {
        emit("mouseleaveNav", props.navItem);
      }, 0);
    }

    return () => (
      <div
        class={["swiper-no-swiping", styles["nav-item"], props.navItem.id === props.activeId ? styles.actived : ""]}
        style={props.navItem.disabled ? "cursor: not-allowed;" : ""}
        onClick={() => {
          clickNav(props.navItem, 1);
        }}
        onMouseenter={() => {
          onMouseenter();
        }}
        onMouseleave={() => {
          onMouseleave();
        }}
      >
        <img src={props.navItem.fileVO?.path || defaultImg} alt="" />
        <span class={styles["item-name"]}>{props.navItem.name}</span>
      </div>
    );
  },
});
