import { Input, PopOver } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref, watch } from 'vue'
import { cubeSecurityManagementService } from '@/api/service'
import { ModalTable } from '@ghcloud/generic-component'

/** 会议设备弹窗 */
interface Props {
  title: string;
  value: { deviceId: string; deviceName: string; }[];
  searchParams: Record<string, unknown>;
  multiple?: boolean;
}

export const DeviceModalTable = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple'],
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const loading = ref(false)
    const search = computed(() => {
      return [
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '设备名称', style: { width: '180px' } } }
      ]
    })
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'deviceProdName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '产品品类',
        dataIndex: 'deviceProdCategoryName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
    ]
    const selectModelValue = ref<string[]>(props.value ? props.value.map(e => {
      return e.deviceId
    }) : [])
    const selectValue = ref<{ deviceId: string; deviceName: string; }[]>(props.value ?? [])
    const ok = async (values: { deviceId: string; deviceName: string; }[]): Promise<void> => {
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

    watch(() => props.value, () => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => {
          return e.deviceId
        })
        selectValue.value = props.value
      }
    }, { deep: true, immediate: true })

    expose({
      openModal
    })

    return (): JSX.Element =>
      <ModalTable
        v-model:show={modalVisible.value}
        columns={columns}
        title={props.title ?? '设备列表'}
        width='1000px'
        rowKey='deviceId'
        search={search.value}
        multiple={props.multiple ?? true}
        apiFunction={async (params: {
          applicationCode: string;
          pageSize: number;
          pageNumber: number;
        }): Promise<{ records: unknown[]; total: number; }> => {
          return cubeSecurityManagementService.getSecurityScreenOutDevicePage(params)
        }}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
        loading={loading.value}
        searchParams={() => {
          return { ...props.searchParams }
        }}
      />
  }
})
