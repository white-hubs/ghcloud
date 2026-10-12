import type SwiperInstance from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { defineComponent, nextTick, onMounted, ref, watch } from "vue";

import { BusinessNavItem } from "./components/business-nav-item";
import { SubBusinessNavItem } from "./components/sub-business-nav-item";
import { getFirstSortedChild, sortSceneNavItems } from "./sort-scene-nav";
import "swiper/css";

import { sceneTypePage } from "@/infrastructure/api/mdata";
import type { SceneDataType } from "@/infrastructure/api/models/mdata";
import { commandMap } from "@/visualization-core/ai/ai-command";
import { eventInstance } from "@/visualization-core/event/event";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./business-nav.module.less";

const SWIPER_BTN_THRESHOLD = 6;
const SWIPER_VISIBLE_COUNT = 5;
const NAV_ITEM_WIDTH = 120;
/** 菜单项之间的间距 */
const NAV_ITEM_GAP = 40;

const getNavTrackWidth = (count: number): number => {
  if (count <= 0) {
    return 0;
  }
  if (count > SWIPER_VISIBLE_COUNT) {
    return SWIPER_VISIBLE_COUNT * NAV_ITEM_WIDTH + (SWIPER_VISIBLE_COUNT - 1) * NAV_ITEM_GAP;
  }
  return count * NAV_ITEM_WIDTH + (count - 1) * NAV_ITEM_GAP;
};

const isSameNavId = (left?: string | null, right?: string | null): boolean => String(left ?? "") === String(right ?? "");

export const BusinessNav = defineComponent({
  setup: () => {
    const { globalState } = useStateStore();
    const swiperObj = ref<SwiperInstance>();
    const swiperBtn = "/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png";
    const businessNavData = ref<SceneDataType[]>([]);
    const active = ref<SceneDataType>();
    const activeParentNav = ref<SceneDataType>();
    const parentNav = ref<SceneDataType>();
    const showSubNav = ref<boolean>(false);
    const mouseInSubNav = ref(false);

    watch(
      () => globalState.panel.rightPanelName,
      () => {
        if (globalState.panel.rightPanelName === "AlarmListPanel") {
          active.value = undefined;
        }
      },
    );

    function getQuery(): string {
      const query = new URLSearchParams(window.location.search);
      const menuName = query.get("menuName");
      return menuName ? decodeURIComponent(menuName) : "";
    }

    async function switchNav(item: SceneDataType): Promise<void> {
      globalState.business.currentMenu = item.id;
      eventInstance.emitEvent("switchBusinessPanel", true);
    }

    async function getMenuList(): Promise<void> {
      try {
        const res = await sceneTypePage();
        const menuName = getQuery();
        if (!res?.length) {
          console.warn("[BusinessNav] scene-type/page returned empty list");
          return;
        }
        businessNavData.value = sortSceneNavItems(res).map((item) => ({
          ...item,
          children: sortSceneNavItems(item.children),
        }));
        globalState.business.menu = businessNavData.value;
        commandMap.set("toggleSwitchboard", (value?: { value?: string }) => {
          const hint = String(value?.value ?? value ?? "").trim();
          if (!hint) {
            return false;
          }
          const nav = businessNavData.value.find((item) => item.name.includes(hint) || hint.includes(item.name));
          if (!nav) {
            return false;
          }
          clickNav(nav, 1);
          return true;
        });
        const matched = businessNavData.value.find((e) => e.name === menuName);
        const initialParent = matched ?? businessNavData.value[0];
        parentNav.value = initialParent;
        activeParentNav.value = initialParent;
        // Parent with children is a group; default to first child for panel + sub-nav highlight.
        const firstChild = getFirstSortedChild(initialParent);
        active.value = firstChild ?? initialParent;
        showSubNav.value = !!initialParent?.children?.length;
        if (active.value) {
          await switchNav(active.value);
        }
      } catch (error) {
        console.error("[BusinessNav] getMenuList failed", error);
      }
    }

    function clickNav(nav: SceneDataType, lv: number): void {
      if (nav.disabled) {
        return;
      }

      const isPrimary = lv === 1;
      const parentChanged = isPrimary && !isSameNavId(parentNav.value?.id, nav.id);

      if (isPrimary) {
        if (parentChanged) {
          parentNav.value = nav;
          activeParentNav.value = nav;
          showSubNav.value = !!nav.children?.length;
          const firstChild = getFirstSortedChild(nav);
          active.value = firstChild ?? nav;
          globalState.business.currentMenu = (firstChild ?? nav).id;
          // Defer heavy panel/model switch until after click render flush.
          void nextTick(() => {
            eventInstance.emitEvent("setFirstPerspective");
          });
        } else {
          // Same primary: only toggle secondary menu visibility.
          showSubNav.value = nav.children?.length ? !showSubNav.value : false;
          activeParentNav.value = parentNav.value;
        }
        return;
      }

      // Same secondary: keep highlight, skip re-entry.
      if (isSameNavId(active.value?.id, nav.id) && isSameNavId(globalState.business.currentMenu, nav.id)) {
        showSubNav.value = true;
        return;
      }

      active.value = nav;
      globalState.business.currentMenu = nav.id;
      showSubNav.value = true;
      activeParentNav.value = parentNav.value;
      void nextTick(() => {
        eventInstance.emitEvent("switchBusinessPanel", true);
      });
    }

    onMounted(() => {
      void getMenuList();
    });

    return (): JSX.Element => {
      const menuCount = businessNavData.value.length;
      if (menuCount === 0) {
        return <div class="ue5-business-nav" style="display:none" aria-hidden="true" />;
      }

      const showSwiperBtns = menuCount >= SWIPER_BTN_THRESHOLD;
      const compact = menuCount <= SWIPER_VISIBLE_COUNT;
      const trackWidth = `${getNavTrackWidth(menuCount)}px`;

      return (
        <div class="ue5-business-nav">
          {showSwiperBtns && (
            <>
              <img
                src={swiperBtn}
                class="swiper-left-btn"
                onClick={() => {
                  swiperObj.value?.slidePrev();
                }}
              />
              <img
                src={swiperBtn}
                class="swiper-right-btn"
                onClick={() => {
                  swiperObj.value?.slideNext();
                }}
              />
            </>
          )}
          <Swiper
            class={["outSwiperBox", "swiper", compact ? "is-compact" : ""].filter(Boolean).join(" ")}
            style={{ width: trackWidth }}
            loop={!compact}
            noSwiping={true}
            noSwipingClass="swiper-no-swiping"
            slides-per-view={compact ? "auto" : SWIPER_VISIBLE_COUNT}
            space-between={NAV_ITEM_GAP}
            observer={true}
            observe-slide-children={true}
            observe-parents={true}
            onSwiper={(swiper: SwiperInstance) => {
              swiperObj.value = swiper;
            }}
          >
            {businessNavData.value.map((item, index) => (
              <SwiperSlide key={`business-nav-${String(item.id)}-${index}`}>
                <BusinessNavItem activeId={parentNav.value?.id} navItem={item} onClickNav={clickNav} />
              </SwiperSlide>
            ))}
          </Swiper>
          <SubBusinessNavItem
            parentNav={parentNav.value}
            activeId={active.value?.id}
            onClickNav={clickNav}
            v-model:mouseInSubNav={mouseInSubNav}
            visible={showSubNav.value}
          />
        </div>
      );
    };
  },
});
