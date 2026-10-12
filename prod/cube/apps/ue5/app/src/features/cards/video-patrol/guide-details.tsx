import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed, onBeforeUnmount } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { conferenceUsedRatio } from "@/infrastructure/api/conference";
import { statCategoryAll } from "@/infrastructure/api/energy";
import { dayAndWeekRatio } from "@/infrastructure/api/securitymanagement";
import { cubeVisitorManagementService } from "@/infrastructure/api/service";
import { hiddenXwPanel } from "@/visualization-core/scene/scene-actions";

import styles from "./guide-details.module.less";

export const GuideDetails = defineComponent({
  name: "GuideDetails",
  setup(_props, ctx) {
    const autoplay = ref(false);
    const playStatus = ref(false);
    const isBreak = ref(false);
    const currentGuideData = ref({
      id: "",
      setScreen: {
        initPerspective: "",
        durationStay: 0,
      },
      pointList: "",
    });
    const currentGuideItemData = ref();
    const ueClient = UeClient.getInstance();
    const guideData = computed(() => {
      return window.config.guideData;
    });
    const playVideo = () => {
      playStatus.value = true;
    };
    const pauseVideo = () => {
      playStatus.value = false;
    };
    const delay = (value) => {
      ueClient.send("changeCameraView", { ...JSON.parse(value.angleView), pawnToCamera: false });
      setTimeout(() => {
        currentGuideItemData.value = value;
      }, 2000);
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          resolve();
        }, value.time * 1000),
      );
    };
    const processArray = async (arr) => {
      return new Promise<void>((resolve) => {
        hiddenXwPanel();
        currentGuideData.value = arr;
        ueClient.send("changeCameraView", { ...JSON.parse(currentGuideData.value.setScreen.initPerspective), pawnToCamera: false });
        arr.setScreen.effectList.forEach((e) => {
          if (e.name === "模型环游") {
            ueClient.send("startAutoRevolve");
          }
          e.value.split(",").forEach((item) => {
            ueClient.send("showActor", { id: item });
          });
        });
        let index = 0;
        setTimeout(async () => {
          isBreak.value = false;
          hiddenXwPanel();
          ueClient.send("stopAutoRevolve");
          for (let i = 0; i < currentGuideData.value.pointList.length; i++) {
            index = i;
            currentGuideItemData.value = null;
            await delay(currentGuideData.value.pointList[i]);
            if (currentGuideData.value?.pointList.length - 1 === index) {
              resolve();
              if (isBreak.value) {
                break;
              }
            }
          }
        }, currentGuideData.value.setScreen.durationStay * 1000);
      });
    };
    const changeGuide = (value) => {
      autoplay.value = false;
      isBreak.value = true;
      if (currentGuideData.value?.id !== value.id) {
        currentGuideData.value = null;
        currentGuideItemData.value = null;
        processArray(value);
      } else {
        currentGuideData.value = null;
        currentGuideItemData.value = null;
      }
    };
    const autoplayEvent = async () => {
      for (let i = 0; i < guideData.value.guideList.length; i++) {
        currentGuideData.value = null;
        currentGuideItemData.value = null;
        if (!autoplay.value) {
          break;
        }
        await processArray(guideData.value.guideList[i]);
        if (i === guideData.value.guideList.length - 1) {
          autoplayEvent();
        }
      }
    };
    const indexData = ref({
      NumberVisitors: {},
      ConferenceRoomUtilizationRate: {},
      EnergyConsumption: {},
      "PM2.5": {},
    });
    const indexUnit = {
      NumberVisitors: "人",
      ConferenceRoomUtilizationRate: "次",
      EnergyConsumption: "kwh",
      "PM2.5": "ug/m³",
    };
    const currentIndex = ref({
      dayCurrentValue: 0,
      dayRatioValue: 0,
      weekRatioValue: 0,
    });
    const currentUnit = ref("");
    const getIndexData = async () => {
      const NumberVisitors = await cubeVisitorManagementService.dayAndWeekRatio();
      indexData.value.NumberVisitors = {
        dayCurrentValue: NumberVisitors.dayContrast.compareValue,
        dayRatioValue: Number(NumberVisitors.dayContrast.ratioValue) * 100,
        weekRatioValue: Number(NumberVisitors.weekContrast.ratioValue) * 100,
      };
      const pm = await dayAndWeekRatio();
      indexData.value["PM2.5"] = {
        dayCurrentValue: pm.dayContrast.compareValue,
        dayRatioValue: Number(pm.dayContrast.ratioValue) * 100,
        weekRatioValue: Number(pm.weekContrast.ratioValue) * 100,
      };
      const ConferenceRoomUtilizationRate = await conferenceUsedRatio({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      indexData.value.ConferenceRoomUtilizationRate = {
        dayCurrentValue: ConferenceRoomUtilizationRate.dayOnDay,
        dayRatioValue: ConferenceRoomUtilizationRate.usedRatio,
        weekRatioValue: ConferenceRoomUtilizationRate.weekOnWeek,
      };
      const dayEnergyConsumption = await statCategoryAll({
        period: [moment().format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
      });
      const weekEnergyConsumption = await statCategoryAll({
        period: [
          moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
          moment().endOf("week").add(1, "days").format("YYYY-MM-DD HH:mm:ss"),
        ].join(","),
      });
      const dayEnergy = dayEnergyConsumption.find((item) => item.instrumentType === "zh");
      const weekEnergy = weekEnergyConsumption.find((item) => item.instrumentType === "zh");
      indexData.value.EnergyConsumption = {
        dayCurrentValue: dayEnergy.value,
        dayRatioValue: Number(dayEnergy.qoqValueRate) * 100,
        weekRatioValue: Number(weekEnergy.qoqValueRate) * 100,
      };
    };
    const setPanelStyle = () => {
      const dom = document.querySelector("#left-panel");
      dom.classList.add("guide-panel");
    };
    setPanelStyle();
    onMounted(() => {
      hiddenXwPanel();
      ueClient.send("removePoiByType", {
        type: "all", // text/icon/all
      });
      getIndexData();
    });
    onBeforeUnmount(() => {
      currentGuideData.value = null;
      currentGuideItemData.value = null;
      isBreak.value = true;
      ueClient.send("stopAutoRevolve");
      const dom = document.querySelector("#left-panel");
      dom.classList.remove("guide-panel");
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="导览">
          <div class="auto-play">
            <a-switch
              checked={autoplay}
              onUpdate:checked={(v) => {
                autoplay.value = v;
              }}
              onChange={autoplayEvent}
            />
            自动连播
          </div>
          <div class="guide-box">
            {guideData.guideList.map((item) => (
              <div class="guide-item" key={item.id} onClick={changeGuide(item)}>
                <div class="guide-item-img">
                  <div class="guide-item-img-play">
                    <play-circle-outlined onClick={playVideo} class="play-icon" />
                    <pause-circle-outlined onClick={pauseVideo} class="pause-icon" />
                  </div>
                  <div class="guide-item-img-box"> {item.name}</div>
                </div>
              </div>
            ))}
          </div>
          <Teleport to="body">
            {currentGuideItemData?.title && currentGuideItemData?.type === "characters" && (
              <div class="guideDetail-modal">
                <div class="guideDetail-modal-header">
                  {" "}
                  <div class="header-title"> {currentGuideItemData?.title}</div>
                </div>
                <div class="guideDetail-modal-body"> {currentGuideItemData?.describe}</div>
              </div>
            )}
            {currentGuideItemData?.type === "chart" ? (
              <div class="guideDetail-chare-modal">
                <div class="guideDetail-chare-modal-header">
                  {" "}
                  <div class="header-title"> {currentGuideItemData?.title}</div>
                </div>
                <div class="guideDetail-chare-modal-body">
                  <div class="guideDetail-chare-modal-body-left">
                    {currentIndex.dayCurrentValue}
                    <span class="unit"> {currentUnit}</span>
                  </div>
                  <div class="guideDetail-chare-modal-body-right">
                    <div class="extra flex-start">
                      <div class="mode"> 周同比</div>
                      <div class={["downtriangle", currentIndex.weekRatioValue > 0 && "uptriangle"]}></div>
                      <div class={[currentIndex.weekRatioValue < 0 ? "down" : "up"]}>{currentIndex.weekRatioValue}%</div>
                    </div>
                    <div class="extra flex-start">
                      <div class="mode"> 日环比</div>
                      <div class={["downtriangle", currentIndex.dayRatioValue > 0 && "uptriangle"]}></div>
                      <div class={[currentIndex.dayRatioValue < 0 ? "down" : "up"]}>{currentIndex.dayRatioValue}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </Teleport>
        </SubPanelTemplate>
      </>
    );
  },
});

export default GuideDetails;
