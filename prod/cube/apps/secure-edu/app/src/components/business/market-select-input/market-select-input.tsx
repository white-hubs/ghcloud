import { cubeDataIntegrateService } from '@/api/server'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

/** 市场下拉选择 */
export const MarketSelectInput = defineComponent({
  emits: ['update:modelValue'],
  setup: () => {
    const options = ref<{ label: string; value: number; }[]>([])
    cubeDataIntegrateService.getMarketConfigList().then(res => {
      options.value = res.map(e => {
        return {
          label: e.marketName,
          value: e.marketTenant
        }
      })
    })

    return (): JSX.Element => <Select
      options={options.value}
      placeholder='请选择'
      allowClear
      showSearch
      optionFilterProp='label'
      onChange={(value: string[]) => {
      }}
    />
  }
})
