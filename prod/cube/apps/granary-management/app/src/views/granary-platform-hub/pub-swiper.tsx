import Swiper from "swiper";
import type { Swiper as SwiperType } from "swiper";
import { EffectCoverflow, Pagination, Navigation, Virtual, A11y } from "swiper";
import { defineComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
import type { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { message } from "@ghcloud/cube-ui";

import { authStore, navigateHostReplacePath } from "@/api/auth-store";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import styles from "./pub-swiper.module.less";

const COMMAND_DISPATCH_APP_CODE = "command-dispatch-app";

const DEFAULT_COMMAND_DISPATCH_PATH = "/command-dispatch";

const getCommandDispatchEntryPath = (): string => {
  const raw = import.meta.env.VITE_COMMAND_DISPATCH_HOST_PATH;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  const path = window.config?.commandEntry ?? DEFAULT_COMMAND_DISPATCH_PATH;
  return path;
};

const openCommandDispatchWithSecret = (path: string, cubeSecret: string): void => {
  const query = new URLSearchParams({ "cube-secret": cubeSecret });
  const urlObj = new URL(path, globalThis.location.origin);
  urlObj.search = urlObj.search !== "" ? `${urlObj.search}&${query.toString()}` : `?${query.toString()}`;
  globalThis.location.assign(urlObj.toString());
};

const DEFAULT_GRAIN_SAFETY_PLATFORM_URL = "http://192.168.1.199:8650/";

const getGrainSafetyPlatformUrl = (): string => {
  const raw = import.meta.env.VITE_STATISTICAL_PANEL_GRAIN_SAFETY_PLATFORM_URL;
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return DEFAULT_GRAIN_SAFETY_PLATFORM_URL;
};

interface HubNavItem {
  title: string;
  cardIndex: number;
  onClick?: () => Promise<void>;
}

const SWIPER_MODULES = [EffectCoverflow, Pagination, Navigation, Virtual, A11y];

export const PubSwiper = defineComponent({
  name: "PubSwiper",
  setup: () => {
    const containerRef = ref<HTMLDivElement | null>(null);
    const swiperInstance = ref<SwiperType | null>(null);
    const activeIndex = ref(1);

    const openGrainSafetyPlatformInNewTab = (): void => {
      globalThis.location.assign(DEFAULT_GRAIN_SAFETY_PLATFORM_URL);
    };

    const goToCommandDispatch = async (): Promise<void> => {
      message.loading("正在获取授权");
      try {
        const cubeAuthService = new CubeAuthService(
          COMMAND_DISPATCH_APP_CODE as unknown as CubeTerminalEnum,
          authStore.tenant,
          authStore.token,
        );
        const cubeSecret = await cubeAuthService.getSecretByToken();
        message.destroy();
        const trimmed = typeof cubeSecret === "string" ? cubeSecret.trim() : "";
        if (trimmed === "") {
          message.error("获取短期鉴权密钥失败，请稍后重试");
          return;
        }
        openCommandDispatchWithSecret(getCommandDispatchEntryPath(), trimmed);
      } catch (error) {
        message.destroy();
        message.error("进入指挥调度失败，请稍后重试");
      }
    };

    const goToBusinessBackend = (): void => {
      navigateHostReplacePath("/portal/genericEquipmentMonitor/equipmentMoitorList");
    };

    const navItems: HubNavItem[] = [
      {
        title: "粮情与粮储穿透式监管平台",
        cardIndex: 1,
        onClick: async (): Promise<void> => {
          openGrainSafetyPlatformInNewTab();
        },
      },
      {
        title: "AI安全管控平台",
        cardIndex: 2,
        onClick: async (): Promise<void> => {
          await goToCommandDispatch();
        },
      },
      {
        title: "综合数据管理平台",
        cardIndex: 3,
        onClick: async (): Promise<void> => {
          goToBusinessBackend();
        },
      },
      {
        title: "粮情与粮储穿透式监管平台",
        cardIndex: 1,
        onClick: async (): Promise<void> => {
          openGrainSafetyPlatformInNewTab();
        },
      },
      {
        title: "AI安全管控平台",
        cardIndex: 2,
        onClick: async (): Promise<void> => {
          await goToCommandDispatch();
        },
      },
      {
        title: "综合数据管理平台",
        cardIndex: 3,
        onClick: async (): Promise<void> => {
          goToBusinessBackend();
        },
      },
    ];

    const coverflowEffect = {
      rotate: 50,
      stretch: 0,
      depth: 115,
      modifier: 1,
      slideShadows: false,
    };

    const handleNavClick = (item: HubNavItem, index: number): void => {
      activeIndex.value = index;
      item.onClick?.();
    };

    const handlePrev = (): void => {
      swiperInstance.value?.slidePrev(800);
    };

    const handleNext = (): void => {
      swiperInstance.value?.slideNext(800);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        event.preventDefault();
      }
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          handlePrev();
          break;
        case "ArrowRight":
        case "ArrowDown":
          handleNext();
          break;
        case "Enter": {
          const currentIndex = swiperInstance.value?.realIndex ?? activeIndex.value;
          const currentItem = navItems[currentIndex];
          if (currentItem) {
            handleNavClick(currentItem, currentIndex);
          }
          break;
        }
      }
    };

    const safeUpdateSwiper = (): void => {
      const swiper = swiperInstance.value;
      if (swiper?.el != null && !swiper.destroyed) {
        swiper.update();
      }
    };

    const mountSwiper = (): void => {
      const el = containerRef.value;
      if (el == null || swiperInstance.value != null) {
        return;
      }
      swiperInstance.value = new Swiper(el, {
        modules: SWIPER_MODULES,
        loop: true,
        initialSlide: 1,
        centeredSlides: true,
        slidesPerView: 3,
        spaceBetween: 14,
        effect: "coverflow",
        coverflowEffect,
        speed: 800,
        observer: true,
        observeParents: true,
        watchSlidesProgress: true,
        updateOnWindowResize: true,
        preventInteractionOnTransition: false,
        grabCursor: true,
        autoplay: false,
        on: {
          slideChangeTransitionStart: () => {
            safeUpdateSwiper();
          },
          slideChangeTransitionEnd: () => {
            safeUpdateSwiper();
          },
          click: () => {
            const currentIndex = swiperInstance.value?.realIndex ?? activeIndex.value;
            const currentItem = navItems[currentIndex];
            if (currentItem) {
              handleNavClick(currentItem, currentIndex);
            }
          },
        },
      });
    };

    const init = async (): Promise<void> => {
      await nextTick();
      const swiper = swiperInstance.value;
      if (swiper?.el == null || swiper.destroyed) {
        return;
      }
      swiper.update();
      swiper.slideTo(1, 0);
      setTimeout(() => {
        safeUpdateSwiper();
        setTimeout(() => {
          safeUpdateSwiper();
        }, 200);
      }, 100);
    };

    let stopContainerWatch: (() => void) | undefined;

    onMounted(() => {
      stopContainerWatch = watch(
        containerRef,
        (el) => {
          if (el != null && swiperInstance.value == null) {
            mountSwiper();
            void init();
            stopContainerWatch?.();
            stopContainerWatch = undefined;
          }
        },
        { flush: "post", immediate: true },
      );
      message.destroy();
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", init);
    });

    onUnmounted(() => {
      stopContainerWatch?.();
      stopContainerWatch = undefined;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", init);
      const swiper = swiperInstance.value;
      if (swiper != null && !swiper.destroyed) {
        swiper.destroy(true, true);
      }
      swiperInstance.value = null;
    });

    return (): JSX.Element => (
      <div class={styles["nav-menu-container"]}>
        <div class={styles["arrow-btn"]} onClick={handlePrev}>
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/arrow.webp" class={styles["arrow-left"]} alt="上一个" />
        </div>
        <div class={styles["swiper-clip"]}>
          <div ref={containerRef} class={["swiper", styles["swiper-container"]]}>
            <div class="swiper-wrapper">
              {navItems.map((item, index) => (
                <div class={["swiper-slide", styles["swiper-slide"]]} key={`${item.cardIndex}-${index}`}>
                  <div
                    class={`${styles["nav-item"]} ${activeIndex.value === index ? styles["nav-item-active"] : ""}`}
                    onClick={() => handleNavClick(item, index)}
                  >
                    <img src={`/resource/v1/granary-management/assets/card-${item.cardIndex}.png`} class={styles["nav-card"]} alt="" />
                    <div class={styles["nav-card-bottom"]}>
                      <div class={styles["nav-title"]}>{item.title}</div>
                      <img src="/apps/@ghcloud/higreen-data-viz/images/home/card-2-bottom.png" class={styles["nav-title-bg"]} alt="" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class={styles["arrow-btn"]} onClick={handleNext}>
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/arrow.webp" class={styles["arrow-right"]} alt="下一个" />
        </div>
      </div>
    );
  },
});
