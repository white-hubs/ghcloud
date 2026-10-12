import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue';
import RollTable from '@/components/businessPanel/public/rollTable/index.vue';
import ModalAlarmTable from '@/components/modal-table/modal-alarm-table.vue';
import { eventTypeHandlerSearch } from '@/api/alarm';
import { useStateStore } from '@/pages/state/use-state-store';
import styles from './alarm-event-handling.module.less';

export const AlarmEventHandling = defineComponent({
  name: 'AlarmEventHandling',
  setup() {
    const { globalState } = useStateStore();

    const alarmEventTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: [],
    });

    const alarmEventData = ref<any[]>([]);
    const alarmModalShow = ref(false);
    const parameter = reactive({
      alarmEventTypeId: '',
      dateRange: [],
      deviceTags: [
        'builtin.app::SECURITY_MONITORING',
        'builtin.app::ELECTRICMANAGE',
        'builtin.app::FIRECONTROL',
        'builtin.app::GAS_MANAGEMENT',
        'builtin.app::ROTATINGMANAGE',
      ].toString(),
    });

    const columns = ref([
      {
        title: '报警事件',
        dataIndex: 'name',
        width: 120,
      },
      {
        title: '报警数',
        dataIndex: 'totalNum',
      },
      {
        title: '平均处理时长（分钟）',
        dataIndex: 'processingTime',
      },
    ]);

    const alarmEventTimetTop = async () => {
      const params = {
        areaId: globalState.business.currentAreaId,
        period: alarmEventTime.value.dateRange.join(','),
        deviceTags: [
          'builtin.app::SECURITY_MONITORING',
          'builtin.app::ELECTRICMANAGE',
          'builtin.app::FIRECONTROL',
          'builtin.app::GAS_MANAGEMENT',
          'builtin.app::ROTATINGMANAGE',
        ],
      };
      const res = await eventTypeHandlerSearch(params);
      alarmEventData.value = res.map((item: any) => ({
        ...item,
        processingTime: item.processingTime ? (item.processingTime / 3600).toFixed(2) + '时' : '0时',
      }));
    };

    const clickRow = (row: any) => {
      parameter.alarmEventTypeId = row.id;
      parameter.dateRange = alarmEventTime.value.dateRange as any;
      alarmModalShow.value = true;
    };

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    watch(() => globalState.business.currentAreaId, () => {
      alarmEventTimetTop();
    });

    onMounted(() => {
      alarmEventTimetTop();
    });

    return () => (
      <SubPanelTemplate title="报警事件处理情况" v-slots={{
        extra: () => (
          <DateInlineForm
            v-model:modelValue={alarmEventTime.value}
            onSearch={alarmEventTimetTop}
          ></DateInlineForm>
        )
      }}>
        <RollTable onClickRow={clickRow} column={columns.value} data={alarmEventData.value} showLength={6}></RollTable>
        <ModalAlarmTable
          show-modal={alarmModalShow.value}
          onClose={closeModal}
          parameter={parameter}
        ></ModalAlarmTable>
      </SubPanelTemplate>
    );
  },
});
