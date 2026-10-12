import type SwiperInstance from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import { defineComponent, onMounted, ref, watch } from "vue";

import BusinessNavItem from "./business-nav-item";
import SubBusinessNavItem from "./sub-business-nav-item";
import { sceneTypePage } from "@/infrastructure/api/mdata";
import type { SceneDataType } from "@/infrastructure/api/models/mdata";

import "swiper/css";

import "./business-nav.module.less";

const swiperBtn = "/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png";

export const BusinessNav = defineComponent({
  name: "Scada2DBusinessNav",
  emits: ["switchNav"],
  setup(_props, { emit, expose }) {
    const businessNavs = ref<SceneDataType[]>([]);
    const actived = ref<SceneDataType>();
    const activedParentNav = ref<SceneDataType>();
    const parentNav = ref<SceneDataType>();
    const swiperObj = ref<SwiperInstance>();
    const mouseInSubNav = ref(false);
    const showSubNav = ref(false);

    async function getMenuList(): Promise<void> {
      try {
        const res = await sceneTypePage();
        if (!res.length) {
          console.warn("[Scada2DBusinessNav] scene-type/page returned empty list");
          return;
        }
        businessNavs.value = res;
        actived.value = businessNavs.value[0];
        parentNav.value = businessNavs.value[0];
        activedParentNav.value = businessNavs.value[0];
        if (parentNav.value.children?.length) {
          showSubNav.value = true;
        }
        emit("switchNav", actived.value, 1);
      } catch (error) {
        console.error("[Scada2DBusinessNav] getMenuList failed", error);
      }
    }

    onMounted(() => {
      void getMenuList();
    });

    function clickNav(nav: SceneDataType, lv: number): void {
      if (nav.disabled) {
        return;
      }
      if (actived.value?.id !== nav.id) {
        emit("switchNav", nav, lv);
      }
      actived.value = nav;
      if (lv === 1 && parentNav.value) {
        if (parentNav.value.id !== nav.id) {
          parentNav.value = nav;
          showSubNav.value = !!parentNav.value.children?.length;
        } else {
          showSubNav.value = parentNav.value.children?.length ? !showSubNav.value : false;
        }
      }
      activedParentNav.value = parentNav.value;
    }

    function hoverNav(nav: SceneDataType): void {
      parentNav.value = nav;
    }

    function mouseleaveNav(nav: SceneDataType): void {
      if (mouseInSubNav.value) {
        return;
      }
      if (activedParentNav.value && activedParentNav.value.id !== nav.id) {
        parentNav.value = activedParentNav.value;
      }
    }

    watch(
      () => mouseInSubNav.value,
      () => {
        if (!mouseInSubNav.value && activedParentNav.value) {
          parentNav.value = activedParentNav.value;
        }
      },
    );

    function clearActived(): void {
      actived.value = undefined;
    }

    expose({ getMenuList, clearActived });

    return (): JSX.Element => {
      if (businessNavs.value.length === 0) {
        return <div class="business-nav" style="display:none" aria-hidden="true" />;
      }

      return (
        <div class="business-nav">
          {businessNavs.value.length >= 6 && (
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
            class="outSwiperBox swiper"
            style={businessNavs.value.length < 6 ? { width: `${businessNavs.value.length * 120}px` } : undefined}
            loop={businessNavs.value.length > 5}
            noSwiping={true}
            noSwipingClass="swiper-no-swiping"
            slides-per-view="auto"
            space-between={0}
            centered-slides={businessNavs.value.length < 6}
            observer={true}
            observe-slide-children={true}
            observe-parents={true}
            onSwiper={(swiper: SwiperInstance) => {
              swiperObj.value = swiper;
            }}
          >
            {businessNavs.value.map((item, index) => (
              <SwiperSlide key={`scada-business-nav-${String(item.id)}-${index}`}>
                <BusinessNavItem
                  activedId={parentNav.value?.id ?? ""}
                  navItem={item}
                  onClickNav={clickNav}
                  onHoverNav={hoverNav}
                  onMouseleaveNav={mouseleaveNav}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          {parentNav.value && (
            <SubBusinessNavItem
              parentNav={parentNav.value}
              activedId={actived.value?.id ?? ""}
              mouseInSubNav={mouseInSubNav.value}
              onUpdate:mouseInSubNav={(value: boolean) => {
                mouseInSubNav.value = value;
              }}
              class={!showSubNav.value ? "hide-sub-nav" : undefined}
              onClickNav={clickNav}
            />
          )}
        </div>
      );
    };
  },
});

export default BusinessNav;
