import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, inject, ref, watch } from 'vue'
import { cubeOuaaService } from '@/api/service'
import type { AreaTree } from '@ghcloud/cube-ouaa-service'

interface Props {
  multiple: boolean;
  value: string;
  placeholder: string;
  readonly: boolean;
  searchParams: Record<string, unknown>;
}

/** 区域选择 */
export const AreaCascaderSelect = defineComponent({
  props: ['multiple', 'value', 'placeholder', 'readonly', 'searchParams'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const select = ref(props.value)
    const areaOptions = ref([])
    const tenantObj: { tenant: string; } | undefined = inject('tenantObj')
    const tenantCode = ref()
    watch(() => tenantObj, () => {
      if (tenantObj?.tenant && tenantCode.value !== tenantObj?.tenant) {
        select.value = ''
        tenantCode.value = tenantObj?.tenant
        getAreaData()
      }
    }, { immediate: true, deep: true })

    const getAreaData = async (): Promise<void> => {
      cubeOuaaService.getAreaTree(tenantObj?.tenant).then((res: AreaTree[]) => {
        areaOptions.value = res as never[]
      })
    }

    watch(() => props.value, () => {
      select.value = props.value ?? ''
    })
    return (): JSX.Element =>
      <Cascader
        fieldNames={{ label: 'name', value: 'id', children: 'children' }}
        placeholder={props.placeholder ?? '请选择'}
        allow-clear
        multiple={props.multiple ?? false}
        options={areaOptions.value}
        v-model:value={select.value}
        onChange={(val: string[]) => {
          emit('update:value', val)
        }}
        disabled={props.readonly}
        changeOnSelect
      />
  }
})
