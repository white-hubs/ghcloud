import { cubeSecureEduPublicService } from '@/api/server'
import { getThemePage } from '@/api/theme'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  readonly?: boolean;
  public?: boolean;
  tenant?: number;
  value?: string;
  options?: { label: string; value: string; }[];
}

export default defineComponent({
  props: ['readonly', 'value', 'options', 'tenant', 'public'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])
    onMounted(async () => {
      if (props.options) {
        options.value = props.options
      } else {
        if (props.public && props.tenant) {
          // 外链采用公共接口
          const data = await cubeSecureEduPublicService.getThemePage({ pageNumber: 1, pageSize: 1000, tenant: props.tenant })
          options.value = data.map(item => {
            return { label: item.name, value: item.id }
          })
        } else {
          const res = await getThemePage({ pageNumber: 1, pageSize: 1000 })
          if (res.data) {
            options.value = res.data.records.map((e) => {
              const item = e as { id: string; name: string; }
              return { label: item.name, value: item.id }
            })
          }
        }
      }
    })
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
    })

    return (): JSX.Element | string => {
      if (props.readonly) {
        return options.value.find(e => e.value === props.value)?.label ?? '--'
      }
      return <Select options={options.value} placeholder='请选择' v-model:value={value.value} allowClear />
    }
  }
})
