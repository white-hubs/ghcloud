import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { waterMeterPage } from "@/infrastructure/api/prepaid";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import pieList from "@/shared-ui/panel/pieList";

import styles from "./lost-water-meter-stats.module.less";

export const LostWaterMeterStats = defineComponent({
  name: "LostWaterMeterStats",
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
        title: "水表编号",
        dataIndex: "meterId",
        width: 120,
      },
      {
        title: "商品号",
        dataIndex: "roomId",
      },
      {
        title: "失联状态",
        dataIndex: "lostState",
      },
    ]);
    const listData = ref([]);

    const getWaterMeterPage = async () => {
      const contact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
      const noContact = await waterMeterPage({ unConnect: true, pageSize: 50, pageNumber: 1 });
      listData.value = contact.records.map((item) => {
        return {
          ...item,
          lostState: "已失联",
        };
      });
      roundPieData.value[1].value = contact.total;
      roundPieData.value[0].value = noContact.total;
    };

    onMounted(() => {
      getWaterMeterPage();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="失联水表实时统计">
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
            <div class="header"> 失联水表明细</div>
            <RollTable column={column} data={listData.value}></RollTable>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default LostWaterMeterStats;
