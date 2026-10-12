import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { policeStatisticsCount, criminalStatisticsCount } from "@/infrastructure/api/lingchuanhik";
import RoundPie from "@/shared-ui/panel/charts/roundPie/roundPie";
import deviceModule from "@/shared-ui/panel/deviceModule";
import pieList from "@/shared-ui/panel/pieList";
import { AlarmRateList } from "@/shared-ui/panel/types";

import styles from "./overview-police-force.module.less";

export const OverviewPoliceForce = defineComponent({
  name: "OverviewPoliceForce",
  setup(_props, ctx) {
    const eventNum = ref<number>(0);
    const roundPieData: any = ref([
      {
        label: "老师",
        value: 0,
        color: "#00ff00",
      },
      {
        label: "学生",
        value: 0,
        color: "#ff0000",
      },
    ]);

    const dataList = reactive<AlarmRateList[]>([
      {
        title: "老师总数",
        value: "0人",
        ringRatio: false,
      },
      {
        title: "学生总数",
        value: "0人",
        ringRatio: false,
      },
    ]);

    const getData = async () => {
      const police = await policeStatisticsCount();
      const criminal = await criminalStatisticsCount();
      dataList[0].value = police + "人";
      dataList[1].value = criminal + "人";
      roundPieData.value[0].value = police;
      roundPieData.value[1].value = criminal;
      eventNum.value = police + criminal;
    };
    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="师生比例">
          <deviceModule data-list={dataList}></deviceModule>
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

export default OverviewPoliceForce;
