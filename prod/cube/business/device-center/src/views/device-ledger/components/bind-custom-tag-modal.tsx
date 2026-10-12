import { Input, PopOver } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref, watch } from 'vue'
import { cubeDeviceCenterInternalService } from '@/api/service'
import { ModalTable } from '@ghcloud/generic-component'

/** 关联标签弹窗 */
interface Props {
  title: string;
  value: { id: string; tagName: string; }[];
  searchParams: Record<string, unknown>;
  multiple: boolean;
  isHistory: boolean;
  tagType: 'CUSTOMER' | 'SYSTEM';
}
export const BindCustomTagModal = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple', 'isHistory', 'tagType'],
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const loading = ref(false)
    const search = computed(() => {
      return [
        { label: '', key: 'tagName', component: Input, componentProps: { placeholder: '标签名称', allowClear: true, style: { width: '180px' } } }
      ]
    })
    const columns = [
      {
        title: '标签名称',
        dataIndex: 'tagName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '标签描述',
        dataIndex: 'description',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]
    const selectModelValue = ref<string[]>(props.value ? props.value.map(e => {
      return e.id
    }) : [])
    const selectValue = ref<{ id: string; tagName: string; }[]>(props.value ?? [])
    const ok = async (values: { id: string; tagName: string; tagCode: string; }[]): Promise<void> => {
      try {
        loading.value = true
        modalVisible.value = false
        emit('update:value', values)
        emit('ok', values)
      } catch {
      } finally {
        loading.value = false
      }
    }

    const openModal = (productId?: string): void => {
      modalVisible.value = true
      if (!props.isHistory) {
        selectModelValue.value.length = 0
        selectValue.value.length = 0
      }
      if (props.tagType === 'SYSTEM' && productId) {
        cubeDeviceCenterInternalService.getProductDeviceTags(productId).then((result) => {
          getCheckboxProps.value = (record: { id: string; }): { disabled: boolean; } => {
            const res = {
              disabled: result.some(e => e.id === record.id)
            }
            return res
          }
        })
      } else {
        getCheckboxProps.value = undefined
      }
    }
    const getData = async (params: {
      deviceId?: number;
      pageNumber?: number;
      pageSize?: number;
      period: { begin?: string;end?: string; } | string;
      tagName?: string;
      status?: string | number;
    }): Promise<{ records: unknown[]; total: number; }> => {
      return cubeDeviceCenterInternalService.getTagPageByType(props.tagType ?? 'CUSTOMER',
        {
          ...params,
          status: '1' // 启用
        })
    }

    watch(() => props.value, () => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => {
          return e.id
        })
        selectValue.value = props.value
      }
    }, { deep: true, immediate: true })

    const getCheckboxProps = ref()

    expose({
      openModal,
    })

    return (): JSX.Element =>
      <ModalTable
        v-model:show={modalVisible.value}
        columns={columns}
        title={`关联${props.tagType === 'CUSTOMER' ? '自定义' : '内置'}标签`}
        width='1000px'
        search={search.value}
        multiple={props.multiple}
        apiFunction={getData}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
        loading={loading.value}
        getCheckboxProps={getCheckboxProps.value}
      />
  }
})
