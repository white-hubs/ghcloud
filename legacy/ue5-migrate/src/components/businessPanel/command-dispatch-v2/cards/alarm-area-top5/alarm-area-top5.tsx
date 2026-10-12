import { defineComponent, onMounted, reactive, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from '@/components/businessPanel/public/dateInlineForm.vue';
import EventAlarmItem from '@/components/businessPanel/public/eventAlarmItem.vue';
import NoData from '@/components/businessPanel/public/noData.vue';
import ModalAlarmTable from '@/components/modal-table/modal-alarm-table.vue';
import { statisticsAreaTop } from '@/api/alarm';
import { useStateStore } from '@/pages/state/use-state-store';
import styles from './alarm-area-top5.module.less';

// 报警区域TOP5
export const AlarmAreaTop5 = defineComponent({
  name: 'AlarmAreaTop5',
  setup() {
    const { globalState } = useStateStore();

    const handleTime = ref({
      timeType: 'THIS_YEAR',
      dateRange: [],
    });

    const alarmRank = reactive<{ list: any[] }>({ list: [] });
    const alarmModalShow = ref(false);
    const parameter = reactive({
      areaIds: '',
      filterAlarmStatus: '',
      alarmStatus: '',
      dateRange: [],
    });

    const changeHandleTime = () => {
      getAlarmHandlTop();
    };

    const getAlarmHandlTop = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: handleTime.value.dateRange.join(','),
        type: handleTime.value.timeType,
      };
      alarmRank.list = await statisticsAreaTop(params);
    };

    const handleClickItem = (item: any) => {
      parameter.areaIds = item.id;
      parameter.filterAlarmStatus = '';
      parameter.dateRange = [];
      parameter.alarmStatus = '';
      alarmModalShow.value = true;
    };

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    onMounted(() => {
      getAlarmHandlTop();
    });

    return () => (
      <SubPanelTemplate title="报警区域TOP5" v-slots={{
        extra: () => (
          <DateInlineForm
            v-model:modelValue={handleTime.value}
            onSearch={changeHandleTime}
          ></DateInlineForm>
        )
      }}>
        <div class={styles.body} style={{ minHeight: '250px' }} v-show={alarmRank.list.length > 0}>
          {alarmRank.list.map((item, index) => (
            <div key={item.id} onClick={() => handleClickItem(item)}>
              <EventAlarmItem
                key={item.id}
                sort={index + 1}
                name={item.name}
                linkRatio={item.chainRatio}
                count={item.alarmNum}
                ratio={item.ratio + '%'}
              />
            </div>
          ))}
        </div>
        <div class={styles.body} style={{ minHeight: '150px' }} v-show={alarmRank.list.length <= 0}>
          <NoData />
        </div>
        <ModalAlarmTable
          show-modal={alarmModalShow.value}
          onClose={closeModal}
          parameter={parameter}
        ></ModalAlarmTable>
      </SubPanelTemplate>
    );
  },
});