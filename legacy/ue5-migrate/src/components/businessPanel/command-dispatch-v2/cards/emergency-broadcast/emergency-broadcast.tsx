import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue';
import DeviceStatistics from '@/components/businessPanel/security-monitoring-safty/device-statistics.vue';
import ElevatorAnalysisPie from '@/components/businessPanel/public/charts/pie/elevator-analysis-pie.vue';
import ElevatorAnalysisList from '@/components/businessPanel/public/elevator-analysis-list.vue';
import ModalBroadcastTable from '@/components/businessPanel/command-dispatchNew/components/modal-broadcast-table.vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { playStatistics } from '@/api/broadcast';
import { useStateStore } from '@/pages/state/use-state-store';
import styles from './emergency-broadcast.module.less';

export const EmergencyBroadcast = defineComponent({
  name: 'EmergencyBroadcast',
  setup() {
    const { globalState } = useStateStore();

    const eventTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: [],
    });

    const deviceStatisticsData = reactive({
      title: '广播记录数',
      total: 0,
    });

    const detectionData = ref<any[]>([]);
    const BroadcastShow = ref(false);
    const parameterBroadcast = reactive({
      templateId: '',
      period: [],
    });

    const alarmEventTop = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: eventTime.value.dateRange.join(','),
      };
      const res = await playStatistics(params);
      const colorList = ['#328BF7', '#FFC700', '#74AEE7', '#00F27B', '#29C2FF', '#EF424A'];
      deviceStatisticsData.total = 0;
      detectionData.value = res.map((item: any, index: number) => {
        deviceStatisticsData.total += item.totalNum;
        return {
          id: item.id,
          name: item.name,
          value: item.totalNum,
          color: colorList[index],
        };
      });
    };

    const openBroadcast = (value: any) => {
      parameterBroadcast.period = eventTime.value.dateRange.join(',') as any;
      if (value) {
        parameterBroadcast.templateId = detectionData.value.find((e) => e.name === value.name).id;
      }
      BroadcastShow.value = true;
    };

    watch(() => globalState.business.currentAreaId, () => {
      alarmEventTop();
    });

    onMounted(() => {
      alarmEventTop();
    });

    return () => (
      <SubPanelTemplate title="应急广播使用情况"  class={styles['alarm-event']} v-slots={{
        extra: () => (
          <DateInlineForm
            v-model:modelValue={eventTime.value}
            onSearch={alarmEventTop}
          ></DateInlineForm>
        )
      }}>
        <DeviceStatistics
          onHandelClickItemize={() => openBroadcast(false)}
          imgPath="business-icon/triage-queue/11.png"
          statistic={deviceStatisticsData}
        ></DeviceStatistics>
        <div class={styles['elevator-analysis']}>
          <div class={styles.chart}>
            <ElevatorAnalysisPie onClickbar={openBroadcast} pieData={detectionData.value}>
              <div style={{ color: '#fff', textAlign: 'center', fontSize: '14px' }}>{deviceStatisticsData.total}</div>
              <div style={{ color: '#fff', textAlign: 'center', fontSize: '14px' }}>广播记录</div>
            </ElevatorAnalysisPie>
          </div>
          <ElevatorAnalysisList
            onHandlecurrent={openBroadcast}
            contentList={detectionData.value}
            class={styles.pie_list}
          ></ElevatorAnalysisList>
        </div>
        <ModalBroadcastTable
          showModal={BroadcastShow.value}
          onClose={() => (BroadcastShow.value = false)}
          parameter={parameterBroadcast}
        ></ModalBroadcastTable>
      </SubPanelTemplate>
    );
  },
});
