import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { areaTodayUserStat, personnelTodayReasonStat } from "@/infrastructure/api/lingchuanhik";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import deviceModule from "@/shared-ui/panel/deviceModule";
import pieList from "@/shared-ui/panel/pieList";
import { AlarmRateList } from "@/shared-ui/panel/types";

import styles from "./overview-external-personnel.module.less";

export const OverviewExternalPersonnel = defineComponent({
  name: "OverviewExternalPersonnel",
  setup(_props, ctx) {
    const colors = ["#306CCA", "#3590FF", "#19F8F7", "#2AE8BD", "#FFC700", "#FF6E23"];
    const eventNum = ref<number>(0);
    const roundPieData: any = ref([
      {
        label: "今日进校",
        value: 0,
        color: "#00ff00",
      },
      {
        label: "当前在校",
        value: 0,
        color: "#ff0000",
      },
    ]);

    const dataList = ref<AlarmRateList[]>([
      {
        title: "今日进校",
        value: "0人",
        ringRatio: false,
      },
      {
        title: "当前在校",
        value: "0人",
        ringRatio: false,
      },
    ]);
    const getData = async () => {
      const data = await areaTodayUserStat({ type: 3 });
      const res = await personnelTodayReasonStat();

      if (data) {
        dataList.value[0].value = (data?.enter || 0) + "人";
        dataList.value[1].value = (data?.leave || 0) + "人";
      }
      eventNum.value = 0;
      roundPieData.value = res.map((e, i) => {
        eventNum.value += e.total;
        return {
          label: e.visitReason,
          value: e.total,
          color: colors[i],
        };
      });
    };
    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="外来人员概况">
          <deviceModule data-list={dataList.value}></deviceModule>
          <div class="equipmentAlarm">
            <RoundPie eventNum={eventNum.value} data={roundPieData}>
              <div class="content">
                <span> {eventNum.value}</span>
                <br />
                总人数
              </div>
            </RoundPie>
            <pieList roundPieData={roundPieData}></pieList>
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default OverviewExternalPersonnel;
