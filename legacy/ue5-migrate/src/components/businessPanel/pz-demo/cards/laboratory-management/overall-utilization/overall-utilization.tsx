import { defineComponent, onMounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { DatePicker } from 'ant-design-vue'
import styles from './overall-utilization.module.less'
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue";
import DeviceModule from "@/components/businessPanel/public/deviceModule.vue";
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

export const OverallUtilization = defineComponent({
  setup () {
    const getData = async (): Promise<void> => {
      let period = dayjs(dateRange.value[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs(dateRange.value[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      if (dateRange.value.length === 0) {
        period = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss') + ',' + dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
      const res = await PZService.laboratory.getOverallUtilization(period)
      faultRate.value = Math.ceil((res.totalUseTime / (res.totalTime ? res.totalTime : 1) * 100) * 100) / 100;
      dataList.value = [
        {
          title: "使用率",
          value: faultRate.value + '%',
          ringRatio: false,
          label: '',
          unit: "%",
        },
      ]
    }
    const faultRate = ref<number>(0);
    const dataList = ref([
      {
        title: "使用率",
        value: '',
        ringRatio: false,
        label: '',
        unit: "%",
      },
    ]);
    const dateRange = ref<string[]>([])
    onMounted(() => {
      getData()
    })
    watch(()=>dateRange.value, getData)


    return (): JSX.Element => (
      <SubPanelTemplate v-slots={{
        extra: () => (
          <DatePicker.RangePicker
            v-model:value={dateRange.value}
            format="YYYY-MM-DD"
            class={styles.datePicker}
            style={{ marginLeft: '0.1rem' }}
          />
        )
      }}>
        <div class='card-container-4' style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <WaterPolo title="" value={faultRate.value} unit="%" bgColor="#FFC700" color="#FFC700"></WaterPolo>
          <DeviceModule dataList={dataList.value}></DeviceModule>
        </div>
      </SubPanelTemplate>
    )
  }
})