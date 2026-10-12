import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { PZService } from '../../../card-service/service'
import NoData from '@/components/businessPanel/public/noData.vue'

export const EnergyConsumptionAlarmTime = defineComponent({
  setup () {
    const data = ref([
      {
        desc: '白天（6:00 - 18:00）',
        count: 50
      },
      {
        desc: '黑夜（18:00 - 6:00）',
        count: 30
      },
      {
        desc: '全天',
        count: 80
      }
    ])
    const getData = async (): Promise<void> => {
      data.value = await PZService.energy.getAlarmTimeAnalysis()
    }
    getData()

    return (): JSX.Element => (
      <SubPanelTemplate >
        <div class='card-container-3'>
          {
            data.value.map((item, index) => (
              <div key={item.desc} style={{
                backgroundColor: (index + 1) / 2 === 1 ? '#5470c6' : '#91cc75',
                padding: '0.104rem',
                borderRadius: '0.042rem',
                marginBottom: '0.104rem',
                color: '#ffffff',
                fontSize: '0.075rem'
              }}
              >
                {item.desc}: {item.count}
              </div>
            ))
          }
          {
            data.value.length === 0 && (
              <NoData />
            )
          }
        </div>
      </SubPanelTemplate>
    )
  }
})