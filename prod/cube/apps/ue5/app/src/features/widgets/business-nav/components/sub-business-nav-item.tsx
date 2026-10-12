import type SwiperInstance from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, defineComponent, ref } from "vue";

import { sortSceneNavItems } from "../sort-scene-nav";
import type { SceneDataType } from "@/infrastructure/api/models/mdata";

import "swiper/css";

import styles from "./sub-business-nav-item.module.less";

interface Props {
  parentNav: SceneDataType | undefined;
  activeId: string | undefined;
  mouseInSubNav: boolean;
  visible: boolean;
}

const SUB_NAV_SWIPER_THRESHOLD = 12;

const isSameNavId = (left?: string | null, right?: string | null): boolean => String(left ?? "") === String(right ?? "");

export const SubBusinessNavItem = defineComponent({
  props: ["parentNav", "activeId", "mouseInSubNav", "visible"],
  emits: ["clickNav", "update:mouseInSubNav"],
  setup(props: Props, { emit }) {
    const swiperObj = ref<SwiperInstance>();

    const children = computed(() => sortSceneNavItems(props.parentNav?.children));
    const useSwiper = computed(() => children.value.length > SUB_NAV_SWIPER_THRESHOLD);

    function clickNav(nav: SceneDataType, lv: number): void {
      emit("clickNav", nav, lv);
    }

    function onMouseenter(): void {
      emit("update:mouseInSubNav", true);
    }

    function onMouseleave(): void {
      emit("update:mouseInSubNav", false);
    }

    const renderItem = (item: SceneDataType) => (
      <div
        class={[styles.item, isSameNavId(item.id, props.activeId) ? styles.active : ""]}
        onClick={() => {
          clickNav(item, 2);
        }}
        key={`sub-${String(item.id)}`}
      >
        {item.name}
      </div>
    );

    return () => {
      if (!children.value.length) {
        return null;
      }

      const rootClass = [styles["sub-nav"], !props.visible ? styles["hide-sub-nav"] : ""];

      if (useSwiper.value) {
        return (
          <div class={[...rootClass, "swiper"]} onMouseenter={onMouseenter} onMouseleave={onMouseleave}>
            <Swiper
              class={styles.subSwiper}
              loop={true}
              slides-per-view={SUB_NAV_SWIPER_THRESHOLD}
              space-between={16}
              observer={true}
              observe-slide-children={true}
              observe-parents={true}
              onSwiper={(swiper: SwiperInstance) => {
                swiperObj.value = swiper;
              }}
            >
              {children.value.map((item) => (
                <SwiperSlide key={`sub-slide-${String(item.id)}`} class={styles.subSlide}>
                  {renderItem(item)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      }

      return (
        <div class={[...rootClass, styles["no-swiper"]]} onMouseenter={onMouseenter} onMouseleave={onMouseleave}>
          {children.value.map((item) => renderItem(item))}
        </div>
      );
    };
  },
});
