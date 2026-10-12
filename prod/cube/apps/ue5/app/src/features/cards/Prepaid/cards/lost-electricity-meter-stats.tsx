import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { ammeterStatStatus } from "@/infrastructure/api/prepaid";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./lost-electricity-meter-stats.module.less";

export const LostElectricityMeterStats = defineComponent({
  name: "LostElectricityMeterStats",
  setup(_props, ctx) {
    const roundPieData = ref([
      {
        value: 0,
        label: "未失联",
        color: "rgba(3, 182, 21, 1)",
      },
      {
        value: 0,
        label: "已失联",
        color: "rgba(245, 154, 35, 1)",
      },
    ]);
    const column = reactive([
      {
        title: "电表编号",
        dataIndex: "meterId",
        width: 120,
      },
      {
        title: "商铺号",
        dataIndex: "roomId",
      },
      {
        title: "型号",
        dataIndex: "model",
      },
    ]);
    const listData = ref([]);

    const getAmmeterPage = async () => {
      const res = await ammeterStatStatus();
      listData.value = res.unConnectList;
      roundPieData.value[1].value = res.unConnect;
      roundPieData.value[0].value = res.connect;
    };

    onMounted(() => {
      getAmmeterPage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="失联电表实时统计">
          <div class="equipmentAlarm">
            <PlanPie pieData={roundPieData.value}>
              <div class="content">
                <div class="total-num"> {roundPieData[1].value + roundPieData[0].value}</div>
                <div> 设备总数</div>
              </div>
            </PlanPie>
            <pieList roundPieData={roundPieData.value}></pieList>
          </div>
          <div class="footer">
            <div class="header"> 失联电表明细</div>
            <RollTable column={column} data={listData.value}></RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LostElectricityMeterStats;
