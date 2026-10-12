import { computed, defineComponent, onBeforeUnmount, onMounted, type PropType, reactive, ref, watch } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { recordStatus } from "@/infrastructure/api/alarm";
import { getTenantDetails } from "@/infrastructure/api/ouaa";
import bus from "@/infrastructure/utils/bus";
import { getNowDateTime } from "@/infrastructure/utils/common";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import Fullscreen from "@/shared-ui/basic/header/fullscreen";
import { modelWeather, webGLWeather } from "@/shared-ui/basic/header/header";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./header.module.less";

interface Option {
  label: string;
  value: string;
  img?: string;
  time?: string;
}

export const Header = defineComponent({
  name: "Scada2DHeader",
  props: {
    cameraOptions: {
      type: Array as PropType<Option[]>,
      default: () => [],
    },
  },
  emits: [
    "setWeather",
    "setTime",
    "setTimeType",
    "initCameraView",
    "roamingEvent",
    "viewAlarmList",
    "displayLabel",
    "tiggleBusinessNav",
    "changWebGlRoam",
    "tourStatus",
  ],
  setup(_props, { emit, expose }) {
    const { globalState } = useStateStore();

    const modelType = computed(() => {
      const entry = window.config?.entry ?? "views";
      if (["views", "views-old-area"].includes(entry)) {
        return "UE5";
      }
      if (["views-2d", "views-2d-old-area"].includes(entry)) {
        return "2D";
      }
      if (["views-three", "views-3d"].includes(entry)) {
        return "WEBGL";
      }
      return "UE5";
    });

    const fullscreenFef = ref();
    const showBusinessNav = ref(true);
    const weather = ref(null);
    const count = ref(0);
    const marketOverview = ref<{ logo?: { path?: string } }>({ logo: { path: "" } });

    const modelTimeTypeOptions = [
      { label: "自动时间", value: true },
      { label: "手动时间", value: false },
    ];

    const modelTimeOptions: Option[] = [
      { label: "自动", value: "auto", img: "time1.png" },
      { label: "上午", value: "9:00:00", time: "day", img: "time1.png" },
      { label: "下午", value: "15:00:00", time: "dusk", img: "time2.png" },
      { label: "晚上", value: "22:00:00", time: "night", img: "time3.png" },
    ];

    const webGlModelTimeOptions: Option[] = [
      { label: "白天", value: "day", img: "time1.png" },
      { label: "黄昏", value: "dusk", img: "time3.png" },
      { label: "夜晚", value: "night", img: "time3.png" },
    ];

    const timeOptions = computed(() => (modelType.value === "WEBGL" ? webGlModelTimeOptions : modelTimeOptions));

    const state = reactive({
      date: "",
      time: "",
      selectedModelTimeType: modelTimeTypeOptions[0],
      selectedModelWeather: modelWeather[0],
      selectedModelTime: modelTimeOptions[0],
      systemName: window.config?.systemName ?? "",
    });

    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        location.reload();
      }
    };

    watch(
      () => modelType.value,
      () => {
        if (modelType.value === "WEBGL") {
          state.selectedModelWeather = webGLWeather[0];
          state.selectedModelTime = webGlModelTimeOptions[0];
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      window.addEventListener("keydown", handleEsc);
      void getAlarmCount();
      nowTime();
      void getTenantInfo();
      setInterval(() => {
        nowTime();
      }, 1000);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEsc);
      bus.off("cube-ai-command");
    });

    const tiggleBusinessNav = (): void => {
      showBusinessNav.value = !showBusinessNav.value;
      emit("tiggleBusinessNav", showBusinessNav.value);
      globalState.menuVisible = showBusinessNav.value;
    };

    const nowTime = (): void => {
      const nowDateTime = getNowDateTime();
      state.date = nowDateTime.split(" ")[0];
      state.time = nowDateTime.split(" ")[1];
    };

    const handelTimeClick = (item: Option): void => {
      const data = timeOptions.value.find((entry) => entry.value === item.value || entry.time === item.value);
      if (!data) {
        return;
      }
      state.selectedModelTime = data;
      emit("setTime", data.value);
    };

    const getAlarmCount = async (): Promise<void> => {
      const res = await recordStatus();
      count.value = res.alarmUnresolvedHandlerNum;
    };

    const getTenantInfo = async (): Promise<void> => {
      marketOverview.value = await getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant);
    };

    const viewAlarmList = (): void => {
      emit("viewAlarmList");
    };

    expose({
      weather,
      selectFirstCameraView: (): void => {},
      getAlarmCount,
      resetRoaming: (): void => {},
    });

    return (): JSX.Element => (
      <>
        <div class="header">
          <div class="left-container flex-start">
            <div class="now-time">
              <div class="date">{state.date}</div>
              <div class="time">{state.time}</div>
            </div>
            <div class="model-time-option">
              <a-dropdown getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}>
                {{
                  overlay: () => (
                    <div class="list">
                      {timeOptions.value.map((item, index) => (
                        <div
                          class="list-item flex-center"
                          key={index}
                          onClick={() => {
                            handelTimeClick(item);
                          }}
                        >
                          <img src={getAssetsImage(item.img ?? "time1.png")} alt="" />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ),
                  default: () => (
                    <div class="btn flex-center">
                      <img src={getAssetsImage(state.selectedModelTime.img ?? "time1.png")} alt="" />
                      <span>{state.selectedModelTime.label}</span>
                    </div>
                  ),
                }}
              </a-dropdown>
            </div>
          </div>

          <div class="center-container">
            <div class="center-container-box">
              {marketOverview.value?.logo?.path && <img width="18" src={marketOverview.value.logo.path} alt="" />}
              <span title={state.systemName}>{state.systemName}</span>
            </div>
          </div>

          <div class="right-container flex-end">
            <Fullscreen ref={fullscreenFef} />
            <div class="business-name" onClick={tiggleBusinessNav}>
              {showBusinessNav.value ? "隐藏菜单" : "显示菜单"}
            </div>
            <div class="alarm" onClick={viewAlarmList}>
              <a-badge count={count.value} title="Custom hover text">
                <img src={getAssetsImage("alarm.png")} alt="" />
              </a-badge>
            </div>
          </div>
        </div>
      </>
    );
  },
});

export default Header;
