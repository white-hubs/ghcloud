import { Input, PopOver, Select, Tag } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from '@/api/service'
import type { ProductState } from '@ghcloud/cube-iot-center-service'
import { ModalTable } from '@ghcloud/generic-component'
import { statusOptions } from '@/types/device-type'

/** 子设备弹窗 */
interface Props {
  title: string;
  value: { id: string; name: string; }[];
  searchParams: Record<string, unknown>;
  multiple?: boolean;
  applicationCode?: string;
  filterTagCodes?: string[];
  securityDevice?: boolean;
  getCheckboxProps?: (record: unknown) => { disabled: boolean; };
}
interface SearchType {
  categoryCode: string | undefined;
  anyMatchedAreaId: string | undefined;
  anyMatchedDepartmentId: string | undefined;
  tagCodes: string[] | undefined;
  prodId: string | undefined;
}

export const SubDeviceModalTable = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple', 'applicationCode', 'filterTagCodes', 'securityDevice', 'getCheckboxProps'],
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const filterTagCodes = props.filterTagCodes ?? []
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const loading = ref(false)
    const productOptions = ref<ProductState[]>([])
    const searchState = ref({
      prodId: '',
      deviceNameOrNumber: '',
      status: '',
    })
    const search = computed(() => {
      const res = [
        {
          label: '所属产品',
          key: 'prodId',
          component: Select,
          componentProps: {
            options: productOptions.value,
            changeOnSelect: true,
            fieldNames: { label: 'prodName', value: 'id' },
            placeholder: '请选择所属产品',
            style: { width: '180px' },
            showSearch: true,
            optionFilterProp: 'prodName'
          }
        },
        {
          label: '设备状态',
          key: 'status',
          component: Select,
          componentProps: {
            options: statusOptions,
            changeOnSelect: true,
            placeholder: '请选择设备状态',
            style: { width: '180px' },
          }
        },
        { label: '', key: 'deviceNameOrNumber', component: Input, componentProps: { placeholder: '设备名称/设备序列号', maxlength: 200, showCount: false, style: { width: '180px' } } }
      ]
      props.securityDevice && res.splice(0, 3)
      return res
    })
    const columns = [
      {
        title: '设备序列号',
        dataIndex: 'deviceNumber',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'productName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '节点类型',
        dataIndex: 'nodeTypeName',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最后连接时间',
        dataIndex: 'onlineTimeStr',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备状态',
        dataIndex: 'status',
        ellipsis: true,
        width: 120,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element=> {
          const curState = statusOptions.find(e => e.value === text)
          return (
            <>
              <PopOver content={curState?.label || '--'}>
                {curState?.label ? <Tag color={curState?.color}>{curState?.label}</Tag> : '--'}
              </PopOver>
            </>
          )
        }
      },
      {
        title: '是否有子设备',
        dataIndex: 'slaveDeviceIds',
        ellipsis: true,
        width: 120,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          const haveSubDevice = text ? (text?.split(',').length > 0 ? '是' : '否') : ''
          return (
            <>
              <PopOver content={haveSubDevice || '--'}>
                {haveSubDevice || '--'}
              </PopOver>
            </>
          )
        }
      },
    ]
    props.securityDevice && columns.splice(3, 1)
    const selectModelValue = ref<string[]>(props.value ? props.value.map(e => {
      return e.id
    }) : [])
    const selectValue = ref<{ id: string; name: string; }[]>(props.value ?? [])
    const ok = async (values: { id: string; name: string; }[]): Promise<void> => {
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
    let apiFunction = async (params: Record<string, unknown>): Promise<{ records: unknown[]; total: number; }> => {
      return cubeDeviceCenterInternalService.getDevicePage(params)
    }
    watch(() => props.value, () => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => {
          return e.id
        })
        selectValue.value = props.value
      }
    }, { deep: true, immediate: true })

    onMounted(async () => {
      cubeDeviceCenterService.getProductListAll().then(res => {
        productOptions.value = res
      })
    })
    expose({
      openModal
    })

    return (): JSX.Element =>
      <ModalTable
        v-model:show={modalVisible.value}
        columns={columns}
        title={props.title ?? '子设备列表'}
        width='1300px'
        search={search.value}
        multiple={props.multiple ?? true}
        apiFunction={apiFunction}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
        getCheckboxProps={props?.getCheckboxProps}
        loading={loading.value}
        searchParams={(value: SearchType) => {
          const searchData = JSON.parse(JSON.stringify(value))
          searchState.value.prodId = searchData.prodId
          searchState.value.status = searchData.status
          searchState.value.deviceNameOrNumber = searchData.deviceNameOrNumber
          return { ...props.searchParams, ...searchState.value, applicationCode: props.applicationCode, filterTagCodes }
        }}
      />
  }
})
