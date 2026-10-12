import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import stackedBarChart from "@/features/cards/Information-release/stacked-bar-chart";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { equipmentTotal } from "@/infrastructure/api/equipment";
import { statusNum } from "@/infrastructure/api/securitymanagement";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import EventAlarmItem from "@/shared-ui/panel/eventAlarmItem";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";
import useCommon from "@/visualization-core/hooks/useCommon";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./left.module.less";

export const Left = defineComponent({
  name: "Left",
  setup(_props, ctx) {
    const { getEventTop } = useCommon();
    const { globalState } = useStateStore();
    const eventInfo = ref<ModelValueItf>();
    const barXData = ref<string[]>(["1号楼", "2号楼", "3号楼"]);
    const alarmTop = reactive({ arr: [] });
    const barYData = ref<{ name: string; data: number[]; color: string }[]>([
      {
        name: "正常",
        data: [1, 2, 3, 4],
        color: "#2AE8BD",
      },
      {
        name: "离线",
        data: [1, 2, 3, 4],
        color: "#2989FF",
      },
    ]);
    const deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const colorList = ["#2F8DFF", "#D0DEEE", "#FFAB10", "#F14545"];
    const alarmTotal = ref(0);
    const pieData = ref([]);
    // 设备实时数据
    const deviceDataInfo = async () => {
      let params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
      };
      let res: any = await equipmentTotal(params);
      if (!res.deviceNum) {
        return;
      }
      pieData.value.length = 0;
      alarmTotal.value = 0;
      res.deviceStatusNums.forEach((item, index) => {
        alarmTotal.value += item.num;
        let obj = {
          label: deviceStatusType[item.name],
          color: colorList[index],
          value: item.num,
        };
        pieData.value.push(obj);
      });
    };
    // 报警事件Top5
    const alarmEventTop = async () => {
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventInfo.value.dateRange.join(","),
        type: eventInfo.value.timeType,
      };
      let res = await getEventTop(param);
      alarmTop.arr = res;
    };
    const getStatusNum = async () => {
      const res = await statusNum({ applicationCode: "TRAFFIC_CONTROL" });
      barXData.value = res.areaStatusNum.map((item) => {
        return item.areaName;
      });
      barYData.value[0].data = res.areaStatusNum.map((item) => {
        return item.onNum;
      });
      barYData.value[1].data = res.areaStatusNum.map((item) => {
        return item.offlineNum;
      });
    };
    onMounted(() => {
      deviceDataInfo();
      getStatusNum();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="设备状态分布">
            <div class="flex-between">
              <PlanPie pieData={pieData.value}>
                <div class="content">
                  <div class="total-num"> {alarmTotal.value}</div>
                  <div> 设备总数</div>
                </div>
              </PlanPie>
              <PieList roundPieData={pieData.value}></PieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="报警事件top5">
            <template>
              {" "}
              <DateInlineForm
                modelValue={eventInfo.value}
                onUpdate:modelValue={(v) => {
                  eventInfo.value = v;
                }}
                onSearch={alarmEventTop}
              ></DateInlineForm>
            </template>
            <div class="body" style="min-height: 250px">
              {alarmTop.arr.map((item, index) => (
                <EventAlarmItem key={item.id} sort={index + 1} name={item.name} count={item.alarmNum} ratio={item.ratio + "%"} />
              ))}
            </div>
            <div class="body" style="min-height: 150px">
              {" "}
              <noData></noData>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="设备在线情况">
            {" "}
            <div class="charts">
              {" "}
              <stackedBarChart x-data={barXData.value} y-data={barYData.value}></stackedBarChart>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Left;
