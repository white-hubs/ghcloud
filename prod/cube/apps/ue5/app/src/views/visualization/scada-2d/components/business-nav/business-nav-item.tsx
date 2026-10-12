import { defineComponent, type PropType } from "vue";

import type { SceneDataType } from "@/infrastructure/api/models/mdata";

import styles from "./business-nav-item.module.less";

export const BusinessNavItem = defineComponent({
  name: "Scada2DBusinessNavItem",
  props: {
    navItem: { type: Object as PropType<SceneDataType>, required: true },
    activedId: { type: String, required: true },
  },
  emits: ["clickNav", "hoverNav", "mouseleaveNav"],
  setup(props, { emit }) {
    const clickNav = (nav: SceneDataType, lv: number): void => {
      emit("clickNav", nav, lv);
    };

    const onMouseenter = (): void => {
      emit("hoverNav", props.navItem);
    };

    const onMouseleave = (): void => {
      setTimeout(() => {
        emit("mouseleaveNav", props.navItem);
      }, 0);
    };

    return (): JSX.Element => (
      <>
        <div
          class={["swiper-no-swiping", styles["nav-item"], props.navItem.id === props.activedId ? styles.actived : ""]}
          style={props.navItem.disabled ? "cursor: not-allowed;" : undefined}
          onMouseenter={onMouseenter}
          onMouseleave={onMouseleave}
          onClick={() => {
            clickNav(props.navItem, 1);
          }}
        >
          <img src={props.navItem.fileVO ? props.navItem.fileVO.path : ""} alt="" />
          <span class={styles["item-name"]}>{props.navItem.name}</span>
        </div>
      </>
    );
  },
});

export default BusinessNavItem;
