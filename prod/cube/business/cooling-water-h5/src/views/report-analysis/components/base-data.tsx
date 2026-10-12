import { defineComponent, onMounted, reactive } from 'vue'
import { Skeleton } from 'vant'
import '../report-analysis.less'
import type { BasicState } from '@/api/index.i'
import { getDeviceBasicStatistic } from '@/api'

/** 基础数据 */
export const BaseData = defineComponent({

  setup: () => {
    const state = reactive<{ loading: boolean;basicData: BasicState; }>({
      loading: false,
      basicData: {
        frontController: 0,
        gearPosition: 0,
        wholesaler: 0
      }
    })
    const getBasicData = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getDeviceBasicStatistic()
        state.basicData = data
      } catch (error) {
      } finally {
        state.loading = false
      }
    }

    onMounted(() => {
      getBasicData()
    })

    return () =>
      <div class='base-data'>
        <div class='title'>基础数据</div>
        <div class='items'>

          <div class='item'>
            <Skeleton row='3' loading={state.loading}>
              <img src='./img/base-data-1.png' />
              <div class='data-title'>档位总数(个)</div>
              <span>{state.basicData.gearPosition}</span>
            </Skeleton>
          </div>
          <div class='item'>
            <Skeleton row='3' loading={state.loading}>
              <img src='./img/base-data-2.png' />
              <div class='data-title'>商户总数(个)</div>
              <span>{state.basicData.wholesaler}</span>
            </Skeleton>
          </div>
          <div class='item'>
            <Skeleton row='3' loading={state.loading}>
              <img src='./img/base-data-3.png' />
              <div class='data-title'>控制终端(台)</div>
              <span>{state.basicData.frontController}</span>
            </Skeleton>
          </div>
        </div>
      </div>
  }
})
