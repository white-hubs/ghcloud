import { computed, defineComponent, onMounted, ref } from 'vue'
import './over-limit-detail.less'
import { useRoute } from 'vue-router'
import { cubeOperatingRoomService } from '@/api/server'
import type { MedicalRuleTriggerDetailVO, TriggerNorm } from '@ghcloud/cube-operating-room-service'
import dayjs from 'dayjs'
import { Empty, PullRefresh, showNotify } from 'vant'

export const OverLimitDetail = defineComponent({
  setup: () => {
    document.title = '超限提醒详情'
    const { id, messageId } = useRoute().query as { id: string; messageId: string; }
    const refreshing = ref(false)
    const detail = ref<MedicalRuleTriggerDetailVO>()
    const dataSource = ref<TriggerNorm[]>([])
    const normColumnName = computed(() => {
      const cur = dataSource.value[0]
      return cur ? `${cur?.normName}（${cur?.unit}）` : '--'
    })
    const getTableData = async (id: string | number): Promise<void> => {
      try {
        detail.value = undefined
        dataSource.value = []
        const res = await cubeOperatingRoomService.getMedicalRuleTriggerDetail(`${id}`, messageId)
        if (res) {
          detail.value = res
          dataSource.value = res.norms ?? []
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    const onRefresh = async (): Promise<void> => {
      await getTableData(id)
      refreshing.value = false
    }
    onMounted(() => {
      getTableData(id)
    })
    return (): JSX.Element =>
      <div class='detail-page'>
        <div class='top'>
          <div class='time'>{detail.value?.sendTime ? dayjs(detail.value?.sendTime).format('YYYY-MM-DD HH:mm') : ''}</div>
          <div class='title'>指标超限还未恢复正常，请处理</div>
          <div class='content'>{detail.value?.msgContent}</div>
        </div>
        <div class='desc'>
          <div class='item'>
            <div class='label'>来自医院：</div>
            <div class='value text'>{detail.value?.sourceTenantName ?? '--'}</div>
          </div>
          <div class='item'>
            <div class='label'>所属部门：</div>
            <div class='value text'>{detail.value?.departName ?? '--'}</div>
          </div>
          <div class='item'>
            <div class='label'>超限设备：</div>
            <div class='value text'>{detail.value?.deviceName ?? '--'}</div>
          </div>
        </div>
        <div class='list'>
          <div class='info head'>
            <div class='item'>上报时间</div>
            <div class='item'>{normColumnName.value}</div>
            <div class='item'>设置范围</div>
          </div>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            {
              dataSource.value?.length > 0 && dataSource.value.map((item) => {
                return (
                  <div class='info' key={item.normCode}>
                    <div class='item'>{item.uploadTime ? dayjs(item.uploadTime).format('YYYY-MM-DD HH:mm') : '--'}</div>
                    <div class='item'>{item.normValue ?? '--'}</div>
                    <div class='item'>{`${item.lowerLimit} - ${item.upperLimit}`}</div>
                  </div>
                )
              })
            }
            {
              dataSource.value?.length === 0 && <Empty style='width: 100%' description='暂无数据' />
            }
          </PullRefresh>
        </div>
      </div>
  }
})
