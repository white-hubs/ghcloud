import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './alarm-situation-statistics.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue"
import DisplayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { statisticsSituation } from '@/api/alarm'
import { completionRate, finishedRatio, handleRatio, projectNumStatistics } from '@/api/maintain'
import { useStateStore } from '@/pages/state/use-state-store';

export const AlarmSituationStatistics = defineComponent({
  name: 'AlarmSituationStatistics',
  props: {
    title: {
      type: String,
      default: '报警情况统计'
    },
  },
  setup(props) {
    const { globalState } = useStateStore()

    const alarmtimeType = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    });

    const contentList = ref([
      {
        name: "报警处理率",
        field: "handlerRatio",
        value: 0,
      },
      {
        name: "隐患处理率",
        field: "ratio",
        value: 0,
      },
      {
        name: "巡检任务完成率",
        field: "confirmedRatio",
        value: 0,
      },
      {
        name: "巡更任务完成率",
        field: "actualRatio",
        value: 0,
      },
      {
        name: "小散工程异常率",
        field: "timeoutRatio",
        value: 0,
      },
    ]);

    const changeDate = async () => {
      const { ratio } = await completionRate({ period: alarmtimeType.value.dateRange.join(",") })
      const res = await projectNumStatistics({ period: alarmtimeType.value.dateRange.join(",") })
      contentList.value[2].value = await finishedRatio({ period: alarmtimeType.value.dateRange.join(",") })
      contentList.value[1].value = await handleRatio({ period: alarmtimeType.value.dateRange.join(",") })
      contentList.value[3].value = ratio
      contentList.value[4].value = res.total ? res.abnormal / res.total * 100 : 0
      const data = await statisticsSituation({
        areaId: globalState.business.currentAreaId,
        period: alarmtimeType.value.dateRange.join(","),
        deviceTags: [globalState.business.currentMenu],
      });
      contentList.value[0].value = Number(data.handlerRatio);
    }

    onMounted(() => {
      changeDate();
    })

    return (): JSX.Element => (
      <SubPanelTemplate title={props.title} v-slots={{
        extra: () => (
          <DateInlineForm 
            v-model:modelValue={alarmtimeType.value} 
            onSearch={changeDate}
          />
        )
      }}>
        <div class={styles.panelContainer}>
          <DisplayPanel bg-img="overView16.png" content-list={contentList.value} showimg={false} />
        </div>
      </SubPanelTemplate>
    )
  }
})
