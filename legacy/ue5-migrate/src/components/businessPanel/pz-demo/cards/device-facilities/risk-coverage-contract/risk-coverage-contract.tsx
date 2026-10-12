import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { PZService } from '../../../card-service/service'
import dayjs from 'dayjs'

export const RiskCoverageContract = defineComponent({
  setup () {
    // 表格列定义
    const columns = [
      {
        title: '合同编号',
        dataIndex: 'name',
        key: 'name',
        width: '20%'
      },
      {
        title: '保险类型',
        dataIndex: 'type',
        key: 'type',
        width: '25%'
      },
      {
        title: '保额(万元)',
        dataIndex: 'coverage',
        key: 'coverage',
        width: '20%'
      },
      {
        title: '起止时间',
        dataIndex: 'startingTime',
        key: 'startingTime',
        width: '35%'
      }
    ]

    // 表格数据
    const tableData = ref([
      {
        key: '1',
        name: 'BX-2023-001',
        type: '设备综合保险',
        coverage: '500',
        startDate: '2023-01-01 至 2023-12-31'
      },
      {
        key: '2',
        name: 'BX-2023-001',
        type: '设备综合保险',
        coverage: '500',
        startDate: '2023-01-01 至 2023-12-31'
      },
      {
        key: '3',
        name: 'BX-2023-001',
        type: '设备综合保险',
        coverage: '500',
        startDate: '2023-01-01 至 2023-12-31'
      },

    ])
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceInsuranceContract({
        type: '',
        period: ''
      })
      if (!result) return
      tableData.value = result.map(item=>{
        return {
          ...item,
          startDate: dayjs(item.startingTime).format('YYYY-MM-DD'),
          key: item.name
        }
      })
    }
    onMounted(()=>{
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="风险覆盖合同">
        <div class='card-container-2' >
          <RollTable column={columns} data={tableData.value}> </RollTable>
        </div>
      </SubPanelTemplate>
    )
  }
})