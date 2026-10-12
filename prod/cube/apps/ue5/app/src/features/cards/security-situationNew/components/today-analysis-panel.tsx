import { defineComponent } from "vue";
import { ref } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import OperateDays from "@/features/panel-shell/metrics/operate-days/operate-days";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { expiredChain, expiredPage } from "@/infrastructure/api/device";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./today-analysis-panel.module.less";

export const TodayAnalysisPanel = defineComponent({
  name: "TodayAnalysisPanel",
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();

    const { globalState } = useStateStore();
    const stateList = {
      SPLIT: "待拆解",
      ACCEPT: "待接收",
      EXECUTING: "进行中",
      OVER: "已完成",
      EXPIRE: "已过期",
    };
    const timeFrame = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });
    const listData = ref([]);
    const alarmCon = ref({
      totalNumber: 0,
      chainRatio: 0,
    });
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "设备类型",
        dataIndex: "genreName",
      },
      {
        title: "使用年限",
        dataIndex: "usefulLifeYear",
      },
      {
        title: "操作",
        dataIndex: "deviceStatus",
        slots: {
          customRender: "deviceStatus",
        },
        width: 80,
      },
    ];
    const clickRow = (value) => {
      ueClient.send("focusActor", { id: value.code });
    };
    // 设备统计
    const changeTopTimeFrame = async () => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
      };
      const { records } = await expiredPage(param);
      listData.value = records.map((item) => {
        return {
          ...item,
          expireStatus: stateList[item.expireStatus],
        };
      });
      alarmCon.value = await expiredChain(param);
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="消防到期设备统计">
          <template>
            {" "}
            <DateInlineForm
              modelValue={timeFrame.value}
              onUpdate:modelValue={(v) => {
                timeFrame.value = v;
              }}
              onSearch={changeTopTimeFrame}
            ></DateInlineForm>
          </template>
          <OperateDays title="设备数" value={alarmCon.value.totalNumber} class="body-bum">
            <div class="extra flex-start">
              <div class="mode"> 环比</div>
              <div class={["downtriangle", alarmCon.chainRatio > 0 && "uptriangle"]}></div>
              <div class={[alarmCon.chainRatio < 0 ? "down" : "up"]}>{alarmCon.chainRatio}%</div>
            </div>
          </OperateDays>
          <RollTable column={alarmColumn} data={listData.value} limitScrollNum={4}>
            {" "}
            <template>
              {" "}
              <span class="details" onClick={clickRow(record)}>
                {" "}
                定位
              </span>
            </template>
          </RollTable>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TodayAnalysisPanel;
