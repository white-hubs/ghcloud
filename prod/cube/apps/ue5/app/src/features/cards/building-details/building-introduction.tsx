import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons-vue";
import Swiper from "swiper";
import { defineComponent, nextTick, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { cubeMdataService } from "@/infrastructure/api/service";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "swiper/css";

import styles from "./building-introduction.module.less";

type AreaExtend = {
  videoFiles?: Array<{ path?: string }>;
  pictureFiles?: Array<{ path?: string }>;
  introduce?: string;
};

export const BuildingIntroduction = defineComponent({
  name: "BuildingIntroduction",
  props: {
    title: { type: String, required: false, default: "楼栋简介" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const videoRef = ref<HTMLVideoElement | null>(null);
    const swiperHostRef = ref<HTMLElement | null>(null);
    const scrollTextRef = ref<HTMLElement | null>(null);
    const buildingDetailsData = ref<AreaExtend>({
      videoFiles: [],
      pictureFiles: [],
      introduce: "",
    });
    const visible = ref(false);
    const current = ref(0);
    const playStatus = ref(false);
    const playHover = ref(false);
    const animationTime = ref(0);
    let swiperInstance: Swiper | null = null;

    const pictures = (): Array<{ path?: string }> =>
      Array.isArray(buildingDetailsData.value.pictureFiles) ? buildingDetailsData.value.pictureFiles : [];
    const videos = (): Array<{ path?: string }> =>
      Array.isArray(buildingDetailsData.value.videoFiles) ? buildingDetailsData.value.videoFiles : [];
    const introduceText = (): string => String(buildingDetailsData.value.introduce || "");

    const calcAnimationTime = (): number => {
      const SPEED = 10;
      const clientHeight = scrollTextRef.value?.clientHeight ?? 0;
      return clientHeight / SPEED;
    };

    const getBuildingDetails = async (): Promise<void> => {
      try {
        const areaId = globalState.business.currentAreaId || globalState.business.area?.[0]?.id;
        if (!areaId) return;
        const res = await cubeMdataService.getAreaById(areaId);
        buildingDetailsData.value = (res?.areaExtend || {}) as AreaExtend;
        await nextTick();
        swiperInstance?.destroy(true, true);
        if (swiperHostRef.value) {
          swiperInstance = new Swiper(swiperHostRef.value, {
            loop: pictures().length > 1,
            slidesPerView: pictures().length >= 2 ? 2 : 1,
            observer: true,
            observeSlideChildren: true,
            observeParents: true,
          });
        }
        animationTime.value = calcAnimationTime();
      } catch {
        buildingDetailsData.value = { videoFiles: [], pictureFiles: [], introduce: "" };
      }
    };

    const clickImage = (index: number): void => {
      current.value = index;
      visible.value = true;
    };

    const playVideo = (): void => {
      void videoRef.value?.play();
      playStatus.value = true;
    };

    const pauseVideo = (): void => {
      videoRef.value?.pause();
      playStatus.value = false;
    };

    const slidePrev = (): void => {
      swiperInstance?.slidePrev();
    };

    const slideNext = (): void => {
      swiperInstance?.slideNext();
    };

    onMounted(() => {
      void getBuildingDetails();
    });

    const firstVideo = (): string => videos()[0]?.path || "";

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card building-introduction-v2-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-management" />,
              default: () => (
                <div class={styles.buildingBox} data-no-zoom>
                  {firstVideo() ? (
                    <>
                      <div class={styles.buildingTitle}>
                        <img width="12" src={getAssetsImage("overView93.png")} alt="" />
                        <div class={styles.buildingText}>楼栋宣传片</div>
                      </div>
                      <div
                        class={styles.videoBox}
                        onMouseenter={() => {
                          playHover.value = true;
                        }}
                        onMouseleave={() => {
                          playHover.value = false;
                        }}
                      >
                        <video ref={videoRef} controls={playStatus.value} class={styles.videoEl}>
                          <source src={firstVideo()} type="video/mp4" />
                        </video>
                        {!playStatus.value ? (
                          <PlayCircleOutlined onClick={playVideo} class={styles.playIcon} />
                        ) : playHover.value ? (
                          <PauseCircleOutlined onClick={pauseVideo} class={styles.pauseIcon} />
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  <div class={styles.buildingTitle}>
                    <img width="12" src={getAssetsImage("overView93.png")} alt="" />
                    <div class={styles.buildingText}>楼栋介绍</div>
                  </div>

                  {pictures().length > 0 ? (
                    <div class={styles.swiperBox}>
                      <img src={getAssetsImage("overView96.png")} class={styles.swiperLeftBtn} onClick={slidePrev} alt="" />
                      <img src={getAssetsImage("overView95.png")} class={styles.swiperRightBtn} onClick={slideNext} alt="" />
                      <div class={["swiper", styles.outSwiperBox]} ref={swiperHostRef}>
                        <div class={["swiper-wrapper", styles.swiperImg]}>
                          {pictures().map((item, i) => (
                            <div class="swiper-slide" key={`${item.path || "pic"}-${i}`}>
                              <a-image
                                onClick={() => clickImage(i)}
                                preview={{ visible: false }}
                                width="80%"
                                height={100}
                                src={item.path}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div class={styles.buildingContent}>
                    <div
                      class={[styles.scrollText, introduceText().length < 600 ? styles.disableAnimation : ""]}
                      ref={scrollTextRef}
                      style={{ animationDuration: `${animationTime.value}s` }}
                    >
                      {introduceText() || "暂无介绍"}
                    </div>
                  </div>
                </div>
              ),
              "zoom-content": () => (
                <div class={[styles.buildingBox, styles.isZoom]} data-no-zoom>
                  <div class={styles.buildingContent}>
                    <div class={[styles.scrollText, styles.disableAnimation]}>{introduceText() || "暂无介绍"}</div>
                  </div>
                  {pictures().length > 0 ? (
                    <div class={styles.zoomGallery}>
                      {pictures().map((item, i) => (
                        <a-image key={`zoom-${item.path || i}`} src={item.path} width={160} height={100} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            }}
          />
        </div>
        <div class={styles.previewBox}>
          <a-image-preview-group
            preview={{
              visible: visible.value,
              current: current.value,
              onVisibleChange: (vis: boolean) => {
                visible.value = vis;
              },
              onChange: (index: number) => {
                current.value = index;
              },
            }}
          >
            {pictures().map((item, i) => (
              <a-image class={styles.previewBox} key={`preview-${item.path || i}`} src={item.path} />
            ))}
          </a-image-preview-group>
        </div>
      </>
    );
  },
});

export default BuildingIntroduction;
