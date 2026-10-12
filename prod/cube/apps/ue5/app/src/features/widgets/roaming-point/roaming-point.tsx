import { CaretRightOutlined, PauseOutlined, PoweroffOutlined } from "@ant-design/icons-vue";
import { RadioGroup, RadioButton } from "ant-design-vue";
import { defineComponent, onBeforeUnmount, onMounted, type PropType, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { commandMap } from "@/visualization-core/ai/ai-command";
import { roamingDevices } from "@/visualization-core/stores/roamingDevices";
import { storeHead } from "@/visualization-core/stores/use-state-head";

import styles from "./roaming-point.module.less";

export type RoamingPointItem = {
  perspective: string;
  pointName: string;
  speed: string;
};

let pauseRoamRegistered = false;

export const RoamingPoint = defineComponent({
  name: "RoamingPoint",
  props: {
    point: {
      type: Array as PropType<RoamingPointItem[]>,
      default: () => [],
    },
  },
  emits: ["closeRoam"],
  setup(props, { emit, expose }) {
    const ueClient = UeClient.getInstance();
    const piniaRoamingDevices = roamingDevices();
    const headStore = storeHead();
    const pointSelect = ref(props.point?.[0]?.pointName);
    const suspendFlag = ref(true);
    const radioStyle = reactive({
      display: "flex",
      height: "30px",
      lineHeight: "30px",
    });

    const roamingEvents = (speed = 0.3): void => {
      const current = props.point[piniaRoamingDevices.cameraViewSuccess];
      if (!current?.perspective) {
        return;
      }
      pointSelect.value = current.pointName;
      ueClient.send("changeCameraView", {
        ...JSON.parse(current.perspective),
        speed: piniaRoamingDevices.cameraViewSuccess === 0 ? 50 : (current.speed ?? speed),
      });
      ueClient.send("stopFlashAll");
      piniaRoamingDevices.roamingDevicesArr = [];
    };

    const goPoint = (): void => {
      props.point.forEach((item, index) => {
        if (JSON.stringify(pointSelect.value) === JSON.stringify(item.pointName)) {
          piniaRoamingDevices.cameraViewSuccess = index;
        }
      });
      ueClient.send("stopCameraView");
      roamingEvents();
    };

    const suspend = (): void => {
      if (suspendFlag.value) {
        ueClient.send("stopCameraView");
      } else {
        goPoint();
      }
      suspendFlag.value = !suspendFlag.value;
    };

    const closeRoam = (): void => {
      ueClient.send("stopCameraView");
      piniaRoamingDevices.cameraViewSuccess = 0;
      piniaRoamingDevices.roamingDevicesArr = [];
      ueClient.send("stopFlashAll");
      emit("closeRoam");
    };

    watch(
      () => piniaRoamingDevices.isRoaming,
      (newVal) => {
        if (newVal && suspendFlag.value) {
          goPoint();
        } else {
          ueClient.send("stopCameraView");
        }
      },
    );

    watch(
      () => piniaRoamingDevices.cameraViewSuccess,
      (newVal, oldVal) => {
        if (newVal !== oldVal && piniaRoamingDevices.isRoaming && suspendFlag.value) {
          roamingEvents();
        }
      },
    );

    onMounted(() => {
      headStore.registerRoamingCloseHandler(closeRoam);
      if (!pauseRoamRegistered) {
        pauseRoamRegistered = true;
        commandMap.set("togglePauseRoam", suspend);
      }
      roamingEvents(20);
    });

    onBeforeUnmount(() => {
      headStore.registerRoamingCloseHandler(null);
    });

    expose({ closeRoam });

    return (): JSX.Element => (
      <div class={styles["roaming-point"]}>
        <div class={styles["button-style"]} onClick={suspend}>
          {suspendFlag.value ? <PauseOutlined /> : <CaretRightOutlined />}
          {suspendFlag.value ? "暂停" : "开始"}
        </div>
        <div class={styles["button-style"]} onClick={closeRoam}>
          <PoweroffOutlined />
          退出
        </div>
        <RadioGroup
          class={styles["radio-list"]}
          value={pointSelect.value}
          onUpdate:value={(value: string) => {
            pointSelect.value = value;
            goPoint();
          }}
          size="small"
        >
          {props.point.map((item) => (
            <RadioButton key={item.pointName} title={item.pointName} style={radioStyle} value={item.pointName}>
              {item.pointName}
            </RadioButton>
          ))}
        </RadioGroup>
      </div>
    );
  },
});
