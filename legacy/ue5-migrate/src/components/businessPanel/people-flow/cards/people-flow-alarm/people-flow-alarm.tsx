
import { defineComponent, reactive, onMounted, ref, computed } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './people-flow-alarm.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import ModalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { getstatus, groupTotalSearch } from '@/api/alarm';
import { useStateStore } from '@/pages/state/use-state-store';

export const PeopleFlowAlarm = defineComponent({
  name: 'PeopleFlowAlarm',
  setup() {
    const { globalState } = useStateStore();
    const eventTime = ref({
      timeType:'THIS_YEAR',
      dateRange:[]
    })
    const alarmLevelCode = ref('');
    const alarmModalShow = ref<boolean>(false);
    const detectionData = ref([
      {
        name: '正常',
        color: '#2AE8BD',
        value: 317
      }, {
        name: '故障',
        color: '#FFC700',
        value: 23
      }, {
        name: '关闭',
        color: '#3590FF',
        value: 30
      },
    ])
    const deviceStatisticsData = reactive({
      title: "报警总数",
      total: 0,
      itemize: [
        {
          name: "处理中",
          label: "挂起",
          value: 0,
          offline: 0,
          key: "OFFLINE1",
        },
        {
          name: "已处理",
          label: "待确认",
          value: 0,
          offline: 0,
          key: "OFFLINE2",
        },
      ],
    });
    const parameter = reactive({
      alarmEventTypeId:'',
      dateRange:[],
      alarmStatus:''
    })
    const closeModal = () => {
      alarmModalShow.value = false;
    };
    const alarmEventTop =async () => {
      const res = await getstatus({
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType
      })
      deviceStatisticsData.total = res?.alarmNum
      deviceStatisticsData.itemize[0].value = res?.alarmStatusStatistics?.find(e=>e?.alarmStatus==="ALARM_SUSPEND")?.alarmNum
      deviceStatisticsData.itemize[0].offline = res?.alarmStatusStatistics?.find(e=>e?.alarmStatus==="ALARM_PROGRESS_CONFIRMED")?.alarmNum
      deviceStatisticsData.itemize[1].value = res?.alarmStatusStatistics?.find(e=>e?.alarmStatus==="ALARM_UN_CONFIRMED")?.alarmNum
      deviceStatisticsData.itemize[1].offline = res?.alarmStatusStatistics?.find(e=>e?.alarmStatus==="ALARM_HANDLER")?.alarmNum
      const data = await groupTotalSearch({
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        sceneType:globalState.business.currentMenu
      })
      const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A","#29C2FF", "#74AEE7", "#655DD1", "#B9D9FF", "#6EE3E1"];
      detectionData.value = data.map((item,index)=>{
        return {
          id: item?.id,
          name: item?.name,
          value: item?.totalNum,
          color: colors[index]
        }
      })
    }
    const handelClickItemize = (value)=>{
      const obj={
        '挂起':"ALARM_SUSPEND",
        '处理中':"ALARM_PROGRESS_CONFIRMED",
        '待确认':"ALARM_UN_CONFIRMED",
        '已处理':"ALARM_HANDLER",
      }
      parameter.alarmStatus = obj[value]
      parameter.alarmEventTypeId = undefined
      parameter.dateRange = eventTime.value.dateRange
      alarmModalShow.value = true;
    }
    const alarmClickBar = (value)=>{
     parameter.alarmStatus = undefined
     parameter.alarmEventTypeId = value.id
     parameter.dateRange = eventTime.value.dateRange
     alarmModalShow.value = true;
    }
    onMounted(() => {
      alarmEventTop();
    });
    return () => (
      <SubPanelTemplate title="报警事件统计" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={eventTime.value} onSearch={alarmEventTop} />
        )
      }}>
        <DeviceStatistics onHandelClickItemize={handelClickItemize} imgPath="business-icon/triage-queue/10.png" statistic={deviceStatisticsData}></DeviceStatistics>
        <div class={styles['elevator-analysis']}>
          <ElevatorAnalysisPie onClickbar={alarmClickBar} pieData={detectionData.value} style="width: 50%;height: 1rem;">
            <div style="color: #fff;text-align: center;font-size: calc(var(--font-size-scale) * 0.082rem)">{deviceStatisticsData?.total ?? 0}</div>
            <div style="color: #fff;text-align: center;font-size: calc(var(--font-size-scale) * 0.072rem)">报警总数（个）</div>
          </ElevatorAnalysisPie>
          <ElevatorAnalysisList onHandlecurrent={alarmClickBar} showRatio={true} contentList={detectionData.value} class="pie_list"></ElevatorAnalysisList>
        </div>
        <ModalAlarmTable show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></ModalAlarmTable>
      </SubPanelTemplate>
    );
  },
});
