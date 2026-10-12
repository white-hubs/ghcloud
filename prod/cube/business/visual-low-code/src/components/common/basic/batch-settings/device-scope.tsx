import { getDeviceGenreList } from '@/apis/business/device'
import { logger } from '@/logger'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { Select } from '@ghcloud/visual-view-ui'
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'device-scope',
  setup () {
    const chartEditStore = useChartEditStore()
    const oldSearchJobType = ref<string[] | string>([''])
    const searchJobType = ref<string[] | string>([])
    const deviceRangeOption = ref<{ label: string; value: string; }[]>([{ label: '全部', value: 'ALL_SELECT' }])

    // 获取设备类型列表
    const requestDeviceGenreList = async (): Promise<void> => {
      const { data } = await getDeviceGenreList()
      data.forEach((item: { name: string; id: string; }) => {
        deviceRangeOption.value.push({
          label: item.name,
          value: item.id
        })
      })
    }
    watch(() => chartEditStore.active.pageId, () => {
      requestDeviceGenreList()
    }, { immediate: true, deep: true })
    const updateDeviceRange = (val: string | string[]): void => {
      if (chartEditStore.getCurrentBlock) {
        const allValues = []
        // 保留所有值
        for (const item of deviceRangeOption.value) {
          allValues.push(item.value)
        }
        // 用来储存上一次的值，可以进行对比
        const oldVal = oldSearchJobType.value.length === 1 ? oldSearchJobType.value[0] : ['']
        // 若是全部选择
        if (val.includes('ALL_SELECT')) searchJobType.value = allValues
        // 取消全部选中 上次有 当前没有 表示取消全选
        if (oldVal.includes('ALL_SELECT') && !val.includes('ALL_SELECT')) searchJobType.value = []
        // 点击非全部选中 需要排除全部选中 以及 当前点击的选项
        // 新老数据都有全部选中
        if (oldVal.includes('ALL_SELECT') && val.includes('ALL_SELECT')) {
          const index = val.indexOf('ALL_SELECT')
          val.splice(index, 1) // 排除全选选项
          searchJobType.value = val
        }
        // 全选未选 但是其他选项全部选上 则全选选上 上次和当前 都没有全选
        if (!oldVal.includes('ALL_SELECT') && !val.includes('ALL_SELECT')) {
          if (val.length === allValues.length - 1) searchJobType.value = ['ALL_SELECT'].concat(val)
        }
        // 储存当前最后的结果 作为下次的老数据
        oldSearchJobType.value[0] = searchJobType.value
        chartEditStore.getCurrentBlock.config.deviceRange = searchJobType.value
        logger.debug('chartEditStore.getCurrentBlock.config.deviceRange', searchJobType.value)
      }
    }
    return () =>
      <Select v-model:value={searchJobType.value} multiple clearable options={deviceRangeOption.value} onUpdateValue={updateDeviceRange} />
  }
})
