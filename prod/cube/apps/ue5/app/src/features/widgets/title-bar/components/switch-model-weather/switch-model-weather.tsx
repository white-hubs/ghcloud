import { Dropdown } from "ant-design-vue";
import { defineComponent, onBeforeMount, ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { modelWeatherList } from "./model-weather";
import { ConfigLoader } from "@/application/config/config-loader";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import { fetchWeatherByLocation, isWeatherApiAvailable } from "@/infrastructure/utils/three-part-api";
import { eventInstance } from "@/visualization-core/event/event";
import { storeHead } from "@/visualization-core/stores/use-state-head";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./switch-model-weather.module.less";

/** 切换模型天气 */
export const SwitchModelWeather = defineComponent({
  setup() {
    const { renderType } = useStateStore();
    const piniaStoreHead = storeHead();
    const options = ref(modelWeatherList);

    // 初始化天气
    renderType === "UE5" &&
      UeClient.getInstance().onConnected(async () => {
        if (!ConfigLoader.config.otherConfig?.autoWeather || !ConfigLoader.config.otherConfig?.modelLocation) {
          handleClick(options.value[0]);
          return;
        }
        if (!isWeatherApiAvailable()) {
          console.warn("[weather] skip auto weather: VITE_ALIYUN_WEATHER_APPCODE is not configured");
          handleClick(options.value[0]);
          return;
        }
        try {
          const { lat, lng } = ConfigLoader.config.otherConfig.modelLocation;
          const weather = await fetchWeatherByLocation({ lat, lng });
          const findOption = options.value.find((item) => item.label === weather);
          if (findOption) {
            options.value[0] = { ...findOption, label: "自动" };
            handleClick(options.value[0]);
            return;
          }
        } catch (error) {
          console.warn("[weather] auto weather failed, fallback to default", error);
        }
        handleClick(options.value[0]);
      });

    onBeforeMount(() => {
      if (renderType === "WEBGL") {
        options.value = [
          {
            label: "晴",
            value: "Sunny",
            weatherCode: ["00"],
            img: "tianqi/00.png",
          },
          {
            label: "多云",
            value: "Cloudy",
            weatherCode: ["01"],
            img: "tianqi/01.png",
          },
          {
            label: "雾",
            value: "Foggy",
            weatherCode: ["18", "53"],
            img: "tianqi/18.png",
          },
          {
            label: "雨",
            value: "Rain",
            weatherCode: ["03", "04", "05", "09"],
            img: "tianqi/03.png",
          },
          {
            label: "雪",
            value: "Snow",
            weatherCode: ["16", "17"],
            img: "tianqi/16.png",
          },
        ];
        piniaStoreHead.weatherSelected = options.value[0];
      }
    });

    function handleClick(item): void {
      if (piniaStoreHead.weatherSelected === item.value) {
        return;
      }
      eventInstance.emitEvent("changeModelWeather", item);
    }

    return (): JSX.Element => (
      <>
        <Dropdown
          getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          v-slots={{
            overlay: () => (
              <div class={styles.list}>
                {options.value.map((item) => (
                  <div
                    class={styles["list-item"]}
                    key={item.value}
                    onClick={() => {
                      handleClick(item);
                    }}
                  >
                    <img src={getAssetsImage(item.img)} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            ),
          }}
        >
          <div class={styles.box}>
            <img src={getAssetsImage(piniaStoreHead.weatherSelected.img)} />
            <span>{piniaStoreHead.weatherSelected.label}</span>
          </div>
        </Dropdown>
      </>
    );
  },
});
