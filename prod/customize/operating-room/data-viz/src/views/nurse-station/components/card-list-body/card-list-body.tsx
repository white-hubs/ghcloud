import { defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import './card-list-body.less'
import { Card } from './card'
import { Page, Spin } from '@ghcloud/cube-ui'
import { service } from '@/api/service'
import { debounce } from 'lodash'
import type { RealTimeMonitorVO } from '@ghcloud/cube-operating-room-service'
import { message } from 'ant-design-vue/es'

/** 卡片列表 */
export const CardListBody = defineComponent({
  emits: ['changeDataSource'],
  props: ['area', 'showRequest'],
  setup (props: { area: string[];showRequest: boolean; }, { emit }) {
    const page = reactive({
      pageSize: 6,
      pageNumber: 1
    })
    const loading = ref(false)
    const total = ref(0)
    const dataSource = ref<RealTimeMonitorVO[]>([])
    const getData = async (): Promise<void> => {
      // 发起求助弹窗打开的时候就不再获取数据了
      if (props.showRequest) {
        return
      }
      const params = {
        ...page,
        areaId: props.area ? props.area.join('-') : ''
      }
      try {
        loading.value = true
        await service.cubeOperatingRoomService.getTimePage(params).then((res) => {
          total.value = res.total
          dataSource.value = res.records
          loading.value = false
          emit('changeDataSource', dataSource.value)
        })
      } catch {
        message.error('获取数据失败')
      } finally {
        loading.value = false
      }
    }
    const handleAreaChange = debounce(getData, 500)
    const pageChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber || 1
      page.pageSize = pageSize
      getData()
    }

    let timer: NodeJS.Timeout | null = null
    onMounted(() => {
      handleAreaChange()
      timer = setInterval(() => {
        handleAreaChange()
      }, 2000)
    })

    onBeforeUnmount(() => {
      timer && clearInterval(timer)
    })

    watch(() => props.area, () => {
      handleAreaChange()
    })

    return (): JSX.Element =>
      <>
        <div class='card-list-body'>
          {
            dataSource.value.map(e => {
              return <Card key={e.id} originalData={e} />
            })
          }
          <Spin spinning={loading.value} size='large' />
        </div>
        <div class='page'>
          <Page showQuickJumper showSizeChanger={false} pageSize={6} showTotal={() => ''} total={total.value} onPageChange={pageChange} />
        </div>
      </>
  }
})
