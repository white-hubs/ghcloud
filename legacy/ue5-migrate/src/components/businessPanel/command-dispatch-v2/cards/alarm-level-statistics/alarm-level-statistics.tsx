
import { defineComponent, reactive, onMounted, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './alarm-level-statistics.module.less'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DeviceStatistics from "@/components/businessPanel/security-monitoring-safty/device-statistics.vue";
import ElevatorAnalysisPie from "@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue";
import ElevatorAnalysisList from "@/components/businessPanel/public/elevator-analysis-list.vue";
import ModalAlarmTable from "@/components/modal-table/modal-alarm-table.vue";
import { recordStatus, statisticsLevel } from '@/api/alarm'
import { useStateStore } from '@/pages/state/use-state-store';

// 报警级别统计
export const AlarmLevelStatistics = defineComponent({
  name: 'AlarmLevelStatistics',
  setup() {
    const { globalState } = useStateStore();
    const eventTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    })
    const alarmModalShow = ref<boolean>(false);
    const parameter = reactive({
      alarmLevelCode: '',
      alarmStatus: '',
      dateRange: [],
      departmentId: '',
      deviceTags: ['builtin.app::SECURITY_MONITORING', 'builtin.app::ELECTRICMANAGE', 'builtin.app::FIRECONTROL', 'builtin.app::GAS_MANAGEMENT', 'builtin.app::ROTATINGMANAGE'].toString()
    })
    const deviceStatisticsData = reactive({
      title: "报警总数",
      total: 48,
      itemize: [
        {
          name: "已处理数",
          label: "未处理数",
          value: 23,
          offline: 15,
          key: "OFFLINE",
        },
      ],
    });
    const detectionData = ref([])
    const alarmTotal = ref(370)

    const alarmEventTop = async () => {
      let params = {
        deviceTags: ['builtin.app::SECURITY_MONITORING', 'builtin.app::ELECTRICMANAGE', 'builtin.app::FIRECONTROL', 'builtin.app::GAS_MANAGEMENT', 'builtin.app::ROTATINGMANAGE'] + '',
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(","),
        type: eventTime.value.timeType,
      };
      const res = await statisticsLevel(params)
      const colorList = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A"];
      alarmTotal.value = 0
      detectionData.value = res.map((item, index) => {
        alarmTotal.value += item.alarmNum
        return {
          name: item.name,
          value: item.alarmNum,
          color: colorList[index],
        }
      });
      const data = await recordStatus(params)
      deviceStatisticsData.total = data.alarmNum
      deviceStatisticsData.itemize[0].value = data.alarmUnresolvedHandlerNum
      deviceStatisticsData.itemize[0].offline = data.alarmHandlerNum
    }

    const openAlarm = (value) => {
      if (value === '未处理数') {
        parameter.alarmStatus = 'ALARM_UN_CONFIRMED'
      } else if (value === '已处理数') {
        parameter.alarmStatus = 'ALARM_HANDLER'
      } else {
        parameter.alarmStatus = ''
      }
      parameter.dateRange = eventTime.value.dateRange
      alarmModalShow.value = true;
    }

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    const alarmClickBar = (value) => {
      const obj = {
        '一级': 'one_level',
        '二级': 'two_level',
        '三级': 'three_level',
        '四级': 'four_level',
      }
      parameter.alarmStatus = undefined
      parameter.departmentId = undefined
      parameter.dateRange = eventTime.value.dateRange
      if (value.name) {
        parameter.alarmLevelCode = obj[value.name.substring(0, 2)]
      } else {
        parameter.alarmLevelCode = obj[value.data.name.substring(0, 2)]
      }
      alarmModalShow.value = true;
    }

    onMounted(() => {
      alarmEventTop();
    });

    return () => (
      <SubPanelTemplate title="报警级别统计" class="alarm-event" v-slots={{
        extra: () => (
          <DateInlineForm v-model:modelValue={eventTime.value} onSearch={alarmEventTop}></DateInlineForm>
        )
      }}>
        <DeviceStatistics onHandelClickItemize={openAlarm} imgPath="business-icon/triage-queue/10.png" statistic={deviceStatisticsData}></DeviceStatistics>
        <div class={styles["elevator-analysis"]}>
          <div class={styles["chart"]}>
            <ElevatorAnalysisPie onClickbar={alarmClickBar} pieData={detectionData.value}>
              <div style="color: #fff;text-align: center;font-size: 0.072rem;">{alarmTotal.value}</div>
              <div style="color: #fff;text-align: center;font-size: 0.062rem;">报警总数（个）</div>
            </ElevatorAnalysisPie>
          </div>
          <ElevatorAnalysisList onHandlecurrent={alarmClickBar} showRatio={true} contentList={detectionData.value} class={styles["pie_list"]}></ElevatorAnalysisList>
        </div>
        <ModalAlarmTable show-modal={alarmModalShow.value} onClose={closeModal} parameter={parameter}></ModalAlarmTable>
      </SubPanelTemplate>
    );
  },
});
