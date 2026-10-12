import { computed, defineComponent, onMounted, ref, type PropType } from "vue";

import modalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";

import "./grid-container.module.less";

interface GridItem {
  alarmStatusName: string | number;
  alarmNum: number;
  alarmStatus?: string;
  color?: string;
}

export const GridContainer = defineComponent({
  name: "GridContainer",
  props: {
    data: { type: Array as PropType<GridItem[]>, required: true },
    parameter: { type: Object as PropType<object>, default: () => ({}) },
  },
  emits: ["clickItem"],
  setup(props, { emit }) {
    const alarmModalShow = ref(false);
    const alarmParameter = ref<Record<string, unknown>>({ ...props.parameter });

    const valueStyle = (color: string) => ({
      fontSize: "18px",
      color,
      paddingLeft: "16px",
    });

    const boxStyle = (color: string) => ({
      width: "4px",
      height: "4px",
      background: color,
    });

    const columnNum = computed(() => props.data.length);

    const handelClickDeviceNum = (item: GridItem): void => {
      const obj: Record<string, string> = {
        待接收: "ALARM_UN_CONFIRMED",
        处理中: "ALARM_PROGRESS_CONFIRMED",
        已挂起: "ALARM_SUSPEND",
        已处理: "ALARM_HANDLER",
      };
      const alarmStatus =
        (typeof item.alarmStatus === "string" && item.alarmStatus.startsWith("ALARM_") && item.alarmStatus) ||
        obj[String(item.alarmStatusName)] ||
        "";
      alarmParameter.value = {
        ...props.parameter,
        ...(alarmStatus ? { alarmStatus } : {}),
      };
      if (alarmParameter.value.alarmStatus) {
        alarmModalShow.value = true;
      }
      emit("clickItem", item);
    };

    const closeModal = (): void => {
      alarmModalShow.value = false;
    };

    onMounted(() => {});

    return (): JSX.Element => (
      <>
        <div class="grid-container" style={{ gridTemplateColumns: `repeat(${columnNum.value}, 1fr)` }}>
          {props.data.map((item) => (
            <div
              class="grid-item"
              key={String(item.alarmStatusName)}
              onClick={() => {
                handelClickDeviceNum(item);
              }}
            >
              <a-statistic valueStyle={valueStyle(String(item.color ?? ""))} value={item.alarmNum}>
                {{
                  title: () => (
                    <div class="title flex-start">
                      <div class="box" style={boxStyle(String(item.color ?? ""))} />
                      <span>{item.alarmStatusName}</span>
                    </div>
                  ),
                }}
              </a-statistic>
            </div>
          ))}
        </div>
        {alarmModalShow.value ? (
          <modal-alarm-table
            alarmStatus={alarmParameter.value.alarmStatus}
            showModal={alarmModalShow.value}
            onClose={closeModal}
            parameter={alarmParameter.value}
          />
        ) : null}
      </>
    );
  },
});

export default GridContainer;
