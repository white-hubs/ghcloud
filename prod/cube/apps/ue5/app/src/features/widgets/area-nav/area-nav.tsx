import { Pagination, Navigation, Scrollbar } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, defineComponent, onMounted, ref, type PropType } from "vue";

import { getAreaList } from "@/infrastructure/api/mdata";
import { eventInstance } from "@/visualization-core/event/event";
import { useFloorTagPosition } from "@/visualization-core/hooks/use-floor-tag-position";
import "swiper/css"; // 引入swiper样式（按需导入）
import "swiper/css/navigation"; // 轮播图两边的左右箭头

import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./area-nav.module.less";

export const AreaNav = defineComponent({
  name: "AreaNav",
  props: {
    modelReady: { type: Boolean as PropType<boolean>, default: false },
  },
  setup(props) {
    const { globalState, getAreaById } = useStateStore();
    const { tagLeft } = useFloorTagPosition();
    const currenList = computed(() => {
      let res = [];
      if (globalState.business.currentAreaId) {
        const currentArea = getAreaById(globalState.business.currentAreaId);
        if (currentArea.children.length) {
          res = currentArea.children;
        }
        // 如果没有下级区域，就返回当前区域的上级区域
        if (currentArea.parentId) {
          const parentArea = getAreaById(currentArea.parentId);
          res = parentArea?.children || [];
        }
      } else {
        res = globalState.business.area;
      }
      return res.sort((a, b) => {
        return a.sort - b.sort;
      });
    });
    const selected = ref({ id: "", name: "" });
    const pageSize = 10;
    const page = ref(1);
    const showPageButton = computed(() => {
      return currenList.value.length > pageSize;
    });
    const showAreaNav = computed(() => {
      if (!props.modelReady) {
        return false;
      }
      if (!globalState.menuVisible) {
        return false;
      }
      if (!globalState.panel.visible) {
        return false;
      }
      if (!globalState.panel.leftPanelName) {
        return false;
      }
      return globalState.panel.switchScene === "BUILD" && globalState.business.area.length;
    });

    const changeBuild = (item): void => {
      if (!item.children.length) {
        selected.value = item;
      }
      eventInstance.emitEvent("handelClickBuild", item);
    };

    const back = (): void => {
      selected.value = { id: "", name: "" };
      eventInstance.emitEvent("backPreAreaLevel");
    };

    onMounted(async () => {
      const res = await getAreaList();
      if (res.length) {
        globalState.business.area = res;
      }
    });

    return (): JSX.Element => (
      <div
        class={`${styles["tag-container"]} ${showAreaNav.value ? styles["show"] : styles["hide"]}`}
        style={{ left: `${tagLeft.value}px` }}
      >
        {globalState.business.currentAreaLeave > 1 && (
          <div class={styles["tag-item"]} onClick={back}>
            <span class={styles["tag-label"]}>返回</span>
          </div>
        )}
        <div
          class={`${styles["tag-item"]} ${page.value === 1 ? styles["disabled"] : ""}`}
          style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
        >
          <span class={styles["tag-label"]}>上一页</span>
        </div>
        {currenList.value.length > 0 && (
          <Swiper
            class={styles["swiper-area"]}
            modules={[Pagination, Navigation, Scrollbar]}
            slides-per-view={currenList.value.length < pageSize ? currenList.value.length : pageSize}
            slides-per-group={pageSize}
            direction="vertical"
          >
            {currenList.value.map((item) => {
              return (
                <SwiperSlide key={item.id}>
                  <div
                    class={`${styles["tag-item"]} ${item.id === selected.value?.id ? styles["active"] : ""}`}
                    onClick={() => {
                      changeBuild(item);
                    }}
                  >
                    <span class={styles["tag-label"]}>{item.name}</span>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
        <div
          class={`${styles["tag-item"]} ${page.value === Math.ceil(currenList.value.length / pageSize) ? styles["disabled"] : ""}`}
          style={{ visibility: showPageButton.value ? "visible" : "hidden" }}
        >
          <span class={styles["tag-label"]}>下一页</span>
        </div>
      </div>
    );
  },
});
