import { defineComponent, onMounted, ref } from 'vue'
import { Cell, CellGroup, Empty, Skeleton, showNotify } from 'vant'
import { useRoute } from 'vue-router'
import { cubeParkingLotService } from '@/api/server'

/** 车辆详情 */
export const CarDetail = defineComponent({
  setup () {
    const carInfo = ref([
      { title: '车牌号', value: '' },
      { title: '车主', value: '' },
      { title: '联系电话', value: '' },
      { title: '车辆类型', value: '' },
    ])
    const noData = ref(false)
    const loading = ref(false)
    const { vehicleNo } = useRoute().query

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeParkingLotService.getCarList({
          pageNumber: 1,
          pageSize: 1,
          vehicleNo: vehicleNo as string,
        })
        if (res.records.length === 0) {
          noData.value = true
        } else {
          noData.value = false
          carInfo.value[0].value = res.records[0].vehicleNo
          carInfo.value[1].value = res.records[0].customerName
          carInfo.value[2].value = res.records[0].customerMobile
          carInfo.value[3].value = res.records[0].vehicleTypeName
        }
      } catch {
        carInfo.value[0].value = ''
        carInfo.value[1].value = ''
        carInfo.value[2].value = ''
        carInfo.value[3].value = ''
        showNotify('获取车辆信息失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      document.title = '车辆详情'
      if (!vehicleNo) {
        noData.value = true
        return
      }
      getData()
    })
    return (): JSX.Element =>
      <>
        <Empty description='暂无数据' v-show={noData.value} />
        <Skeleton title row='4' v-show={loading.value} style={{ marginTop: '20px' }} />
        <CellGroup v-show={!noData.value && !loading.value}>
          {
            carInfo.value.map(e => {
              return <Cell key={e.value} title={e.title} value={e.value || '--'} />
            })
          }
        </CellGroup>
      </>
  }
})
