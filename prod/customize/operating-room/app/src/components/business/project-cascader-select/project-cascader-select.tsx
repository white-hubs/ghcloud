import { cubeOperatingRoomService } from '@/api/service'
import type { StandardTreeVO } from '@ghcloud/cube-operating-room-service'
import { Cascader } from '@ghcloud/cube-ui'
import { SHOW_CHILD } from 'ant-design-vue/es/vc-cascader'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  multiple: boolean;
  value: string[];
  placeholder: string;
  readonly: boolean;
  width?: string;
  prodId?: string;
}

/** 选择检测项目 */
export const ProjectCascaderSelect = defineComponent({
  props: ['multiple', 'value', 'prodId', 'placeholder', 'readonly', 'width'],
  emits: ['update:value', 'change', 'click'],
  setup (props: Props, { emit }) {
    const select = ref(props.value ?? [])
    const options = ref<StandardTreeVO[]>([])
    const standardTreeSource = ref<StandardTreeVO[]>([])

    const getOptions = async (): Promise<void> => {
      const productIdList = props.prodId ? Array.isArray(props.prodId) ? props.prodId : [props.prodId ?? ''] : []
      const res = await cubeOperatingRoomService.getDetectionStandardTree({ productIdList })
      if (res && Array.isArray(res)) {
        standardTreeSource.value = res
        options.value = res?.map(item => {
          return {
            ...item,
            children: item.propertyList?.map(property => {
              return {
                ...property,
                name: property.productPropertyName,
              }
            })
          } as StandardTreeVO
        }) ?? []
      } else {
        options.value = []
      }
    }

    onMounted(() => {
      getOptions()
    })

    watch(() => props.value, () => {
      select.value = props.value ?? []
    })
    watch(() => props.prodId, () => {
      select.value = []
      getOptions()
      emit('update:value', [])
      emit('change', [])
    })
    return (): JSX.Element =>
      <Cascader
        placeholder={props.placeholder ?? '请选择检测项目'}
        fieldNames={ { label: 'name', value: 'id', children: 'children' } }
        options={options.value}
        v-model:value={select.value}
        onChange={async (val: string[], selectedOptions: StandardTreeVO[]) => {
          emit('update:value', val)
          emit('change', selectedOptions)
        }}
        disabled={props.readonly}
        multiple={props.multiple ?? false}
        style={{ width: props.width || '180px' }}
        allowClear
        showSearch
        optionFilterProp='name'
        maxTagCount={props.multiple ? 3 : null}
        showCheckedStrategy={SHOW_CHILD}
        onClick={() => {
          emit('click')
        }}
      />
  }
})
