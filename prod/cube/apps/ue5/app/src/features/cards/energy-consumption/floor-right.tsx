import { defineComponent, onMounted, onUnmounted, ref } from "vue";

import { EnergySnalysis, getCostInfoData } from "./utils/floor-mock-data";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./floor-right.module.less";

export const FloorRight = defineComponent({
  name: "EnergyConsumptionFloorRight",
  setup() {
    const workOrderTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [""],
    });
    const costTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [""],
    });
    const monitorSituationPieData = ref([
      { label: "电能", value: 120, color: "#FFAB10" },
      { label: "水能", value: 420, color: "#2F8DFF" },
      { label: "燃气", value: 335, color: "#F14545" },
      { label: "蒸汽", value: 450, color: "#19F8F7" },
    ]);
    const energyAnalysis = ref([
      {
        data: [
          { label: "动力用电", value: 30000, color: "#FFAB10" },
          { label: "生活用电", value: 2000, color: "#2F8DFF" },
          { label: "生产用电", value: 748, color: "#F14545" },
          { label: "其他用电", value: 6000, color: "#19F8F7" },
        ],
        title: "电力",
      },
      {
        data: [
          { label: "生活用水", value: 30000, color: "#FFAB10" },
          { label: "生成用水", value: 2000, color: "#2F8DFF" },
          { label: "医疗用水", value: 748, color: "#F14545" },
          { label: "其他用水", value: 6000, color: "#19F8F7" },
        ],
        title: "水",
      },
      {
        data: [
          { label: "生活用气", value: 30000, color: "#FFAB10" },
          { label: "生产用气", value: 2000, color: "#2F8DFF" },
          { label: "动力用气", value: 748, color: "#F14545" },
          { label: "其他用气", value: 6000, color: "#19F8F7" },
        ],
        title: "燃气",
      },
    ]);
    const deviceInfo = ref([
      { name: "设备", state: "在线" },
      { name: "设备", state: "在线" },
      { name: "设备", state: "在线" },
      { name: "设备", state: "离线" },
      { name: "设备", state: "在线" },
      { name: "设备", state: "离线" },
    ]);
    const total = ref(1320);

    let timer: ReturnType<typeof setInterval> | null = null;
    const fakeData = ["TODAY", "THIS_WEEK", "THIS_MONTH", "THIS_YEAR"];
    let fakeIndex = 1;

    const changecostTime = (): void => {
      total.value = 0;
      monitorSituationPieData.value = getCostInfoData(costTime.value.timeType);
      monitorSituationPieData.value.forEach((item) => {
        total.value += item.value;
      });
    };

    const changeAppointmentTime = (): void => {
      energyAnalysis.value = EnergySnalysis(workOrderTime.value.timeType);
    };

    onMounted(() => {
      timer = setInterval(
        () => {
          workOrderTime.value.timeType = fakeData[fakeIndex];
          changeAppointmentTime();
          changecostTime();
          fakeIndex += 1;
          if (fakeIndex > fakeData.length - 1) {
            fakeIndex = 0;
            if (timer) clearInterval(timer);
          }
        },
        (window as Window & { config?: { pageLoopRequestTime?: number } }).config?.pageLoopRequestTime ?? 60000,
      );
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return (): JSX.Element => (
      <div>
        <SubPanelTemplate title="费用信息">
          {{
            extra: () => (
              <DateInlineForm
                modelValue={costTime.value}
                onUpdate:modelValue={(v) => {
                  costTime.value = v;
                }}
                onSearch={changecostTime}
              />
            ),
            default: () => (
              <div class="flex-between">
                <PlanPie pieData={monitorSituationPieData.value}>
                  <div class="content">
                    <div class="total-num">{total.value}元</div>
                    <div>费用金额</div>
                  </div>
                </PlanPie>
                <PieList roundPieData={monitorSituationPieData.value} />
              </div>
            ),
          }}
        </SubPanelTemplate>

        <SubPanelTemplate title="用能分析">
          {{
            extra: () => (
              <DateInlineForm
                modelValue={workOrderTime.value}
                onUpdate:modelValue={(v) => {
                  workOrderTime.value = v;
                }}
                onSearch={changeAppointmentTime}
              />
            ),
            default: () =>
              energyAnalysis.value.map((item) => (
                <div class="flex-between analysis" key={item.title}>
                  <PlanPie pieData={item.data}>
                    <div class="content">
                      <div>{item.title}</div>
                    </div>
                  </PlanPie>
                  <PieList class="pieList" roundPieData={item.data} />
                </div>
              )),
          }}
        </SubPanelTemplate>

        <SubPanelTemplate title="设备信息">
          {{
            default: () => (
              <div class="deviceInfo">
                {deviceInfo.value.map((item, index) => (
                  <div class="deviceInfoBox" key={index}>
                    <img width={30} height={30} src={getAssetsImage("overView5.png")} alt="" />
                    <div class="deviceInfoBox-right">
                      <div>
                        {item.name}
                        {index}
                      </div>
                      <div style={{ color: item.state === "在线" ? "#2AE8BD" : "#F14545" }}>{item.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          }}
        </SubPanelTemplate>
      </div>
    );
  },
});

export default FloorRight;
