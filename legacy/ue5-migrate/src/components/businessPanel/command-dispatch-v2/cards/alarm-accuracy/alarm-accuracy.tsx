
import { defineComponent, onMounted, ref } from 'vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import DisplayPanel from "@/components/businessPanel/public/display-panelsafty.vue";
import { deviceTagGroupSearch } from '@/api/alarm'
import { useStateStore } from '@/pages/state/use-state-store';

// 报警正确率
export const AlarmAccuracy = defineComponent({
  name: 'AlarmAccuracy',
  setup() {
    const { globalState } = useStateStore();
    const alarmtimeType = ref({
      timeType: 'THIS_YEAR',
      dateRange: []
    });
    const contentList = ref([]);

    const changeDate = async () => {
      let params = {
        areaId: globalState.business.currentAreaId,
        type: alarmtimeType.value.timeType,
        period: alarmtimeType.value.dateRange.join(","),
        deviceTags: ['builtin.app::SECURITY_MONITORING', 'builtin.app::ELECTRICMANAGE', 'builtin.app::FIRECONTROL', 'builtin.app::GAS_MANAGEMENT', 'builtin.app::ROTATINGMANAGE']
      };
      const res = await deviceTagGroupSearch(params)
      const obj = {
        'builtin.app::SECURITY_MONITORING': '安防监控',
        'builtin.app::ELECTRICMANAGE': '电气安全',
        'builtin.app::FIRECONTROL': '消防安全',
        'builtin.app::GAS_MANAGEMENT': '用气安全',
        'builtin.app::ROTATINGMANAGE': '动环监控',
      }
      contentList.value = res.map(item => {
        return {
          name: obj[item.code],
          value: item.ratio,
        }
      })
    }

    onMounted(() => {
      changeDate();
    });

    return () => (
      <SubPanelTemplate title="报警正确率" v-slots={{
        extra: () => (
          <DateInlineForm
            v-model:modelValue={alarmtimeType.value}
            onSearch={changeDate}
          ></DateInlineForm>
        )
      }}>
        <DisplayPanel
          bgImg={'overView16.png'}
          contentList={contentList.value}
          showimg={false}
        ></DisplayPanel>
      </SubPanelTemplate>
    );
  },
});
