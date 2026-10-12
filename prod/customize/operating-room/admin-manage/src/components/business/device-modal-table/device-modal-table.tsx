import { Input, PopOver } from '@ghcloud/cube-ui'
import { computed, defineComponent, ref, watch } from 'vue'
import { cubeDeviceCenterService } from '@/api/service'
import { ModalTable } from '@ghcloud/generic-component'

/** 设备弹窗 */
interface Props {
  title: string;
  value: { id: string; name: string; }[];
  searchParams: Record<string, unknown>;
  multiple?: boolean;
  tenant: string | undefined;
}

export const DeviceModalTable = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple', 'tenant'],
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
        dataIndex: 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text ?? '--'}>{text ?? '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'productInfo',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { productInfo: { name: string; }; }; }): JSX.Element => {
          return <PopOver content={record?.productInfo?.name ?? '--'}>{record?.productInfo?.name ?? '--'}</PopOver>
        }
      },
      {
        title: '维护部门',
        dataIndex: 'department',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { department: { name: string; }; }; }): JSX.Element => {
          return <PopOver content={record?.department?.name ?? '--'}>{record?.department?.name ?? '--'}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'area',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { area: { pathName: string; }; }; }): JSX.Element => {
          return <PopOver content={record?.area?.pathName ?? '--'}>{record?.area?.pathName ?? '--'}</PopOver>
        }
      },
    ]
    const selectModelValue = ref<string[]>(props.value ? props.value.map(e => {
      return e.id
    }) : [])
    const selectValue = ref<{ id: string; name: string; department?: { id: string;name: string; }; }[]>(props.value ?? [])
    const ok = async (values: { id: string; name: string; department?: { id: string;name: string; }; }[]): Promise<void> => {
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
          return e.id
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
        width='1300px'
        search={search.value}
        multiple={props.multiple ?? true}
        apiFunction={async (params: {
          applicationCode: string;
          pageSize: number;
          pageNumber: number;
          productId?: string | undefined;
          tagCodes?: string[] | undefined;
        }): Promise<{ records: unknown[]; total: number; }> => {
          return cubeDeviceCenterService.getDeviceInstancePageAll(params, props.tenant)
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
