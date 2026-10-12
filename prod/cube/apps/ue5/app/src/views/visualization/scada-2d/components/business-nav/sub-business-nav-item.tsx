import Swiper from "swiper";
import { defineComponent, nextTick, type PropType, ref, watch } from "vue";

import type { SceneDataType } from "@/infrastructure/api/models/mdata";

import "swiper/css";

import styles from "./sub-business-nav-item.module.less";

export const SubBusinessNavItem = defineComponent({
  name: "Scada2DSubBusinessNavItem",
  props: {
    parentNav: { type: Object as PropType<SceneDataType>, required: true },
    activedId: { type: String, default: "" },
    mouseInSubNav: { type: Boolean, default: false },
  },
  emits: ["clickNav", "update:mouseInSubNav"],
  setup(props, { emit }) {
    const swiperObj = ref<Swiper>();

    const initSwiper = (): void => {
      if (!props.parentNav?.children?.length || props.parentNav.children.length < 8) {
        swiperObj.value = undefined;
        return;
      }
      const slidesPerView = props.parentNav.children.length > 8 ? 8 : props.parentNav.children.length;
      swiperObj.value?.updateSlides();
      swiperObj.value = new Swiper(".sub-navs", {
        loop: true,
        slidesPerView,
      });
    };

    watch(
      () => props.parentNav,
      () => {
        nextTick(() => {
          initSwiper();
        });
      },
      { immediate: true },
    );

    const clickNav = (nav: SceneDataType, lv: number): void => {
      emit("clickNav", nav, lv);
    };

    const onMouseenter = (): void => {
      emit("update:mouseInSubNav", true);
    };

    const onMouseleave = (): void => {
      emit("update:mouseInSubNav", false);
    };

    return (): JSX.Element | null => {
      if (!props.parentNav?.children?.length) {
        return null;
      }

      if (props.parentNav.children.length > 8) {
        return (
          <div class={`${styles["sub-navs"]} swiper`} onMouseenter={onMouseenter} onMouseleave={onMouseleave}>
            <div class="swiper-wrapper">
              {props.parentNav.children.map((item, index) => (
                <div class="swiper-slide" key={item.id ?? index}>
                  <div
                    class={[styles.item, item.id === props.activedId ? styles.actived : ""]}
                    onClick={() => {
                      clickNav(item, 2);
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div class={`${styles["sub-navs"]} ${styles["no-swiper"]}`} onMouseenter={onMouseenter} onMouseleave={onMouseleave}>
          {props.parentNav.children.map((item, index) => (
            <div
              class={[styles.item, item.id === props.activedId ? styles.actived : ""]}
              key={item.id ?? index}
              onClick={() => {
                clickNav(item, 2);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      );
    };
  },
});

export default SubBusinessNavItem;
