import { Cascader, Input, PopOver, Select } from '@ghcloud/cube-ui'
import { ModalTable } from '../modal-table/modal-table'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { cubeDeviceCenterService, cubeMdataService, cubeOuaaService, cubeSecurityManagementService } from '../api/service'
import type { DeviceInstancePageParamsAll, DeviceTagDetail, ProductIotCategoryTree, ProductState } from '@ghcloud/cube-iot-center-service'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { DeptTreeSelect } from '../dept-tree-select/dept-tree-select'

/** 设备弹窗 */
interface Props {
  title: string;
  value: { id: string; name: string; }[];
  searchParams: Record<string, unknown>;
  multiple?: boolean;
  applicationCode?: string;
  filterTagCodes?: string[];
  tagCodes?: string[];
  securityDevice?: boolean;
}
interface SearchType {
  categoryCode: string | undefined;
  anyMatchedAreaId: string | undefined;
  anyMatchedDepartmentId: string | undefined;
  tagCodes: string[] | undefined;
  productId: string | undefined;
}
export const DeviceModalTable = defineComponent({
  props: ['title', 'value', 'searchParams', 'multiple', 'applicationCode', 'filterTagCodes', 'securityDevice','tagCodes'],
  emits: ['update:value', 'ok'],
  setup (props: Props, { emit, expose }) {
    const filterTagCodes = props.filterTagCodes ?? []
    const tagCodes = props.tagCodes ?? []
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const loading = ref(false)
    const productCategoryOptions = ref<ProductIotCategoryTree[]>([])
    const productOptions = ref<ProductState[]>([])
    const areaOptions = ref<AreaTree[]>([])
    const deptOptions = ref<DeptList[]>([])
    const customerTagOptions = ref<DeviceTagDetail[]>([])
    const searchState = ref<SearchType>({
      categoryCode: '',
      productId: '',
      anyMatchedAreaId: '',
      anyMatchedDepartmentId: '',
      tagCodes: [],
    })
    const search = computed(() => {
      let res = [
        {
          label: '所属产品',
          key: 'productId',
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
          label: '产品品类',
          key: 'categoryCode',
          component: Cascader,
          componentProps: {
            options: productCategoryOptions.value,
            changeOnSelect: true,
            fieldNames: { label: 'categoryName', value: 'categoryCode', children: 'children' },
            placeholder: '请选择产品品类',
            style: { width: '180px' },
            showSearch: true,
            optionFilterProp: 'categoryName'
          }
        },
        {
          label: '所在区域',
          key: 'anyMatchedAreaId',
          component: Cascader,
          componentProps: {
            options: areaOptions.value,
            changeOnSelect: true,
            fieldNames: { label: 'name', value: 'id', children: 'children' },
            placeholder: '请选择所在区域',
            style: { width: '180px' },
            showSearch: true,
            optionFilterProp: 'name'
          }
        },
        {
          label: '维护部门',
          key: 'anyMatchedDepartmentId',
          component: DeptTreeSelect,
          componentProps: {
            style: { width: '180px' },
            placeholder: '请选择维护部门',
            showSearch: true,
            treeNodeFilterProp: 'name'
          }
        },
        {
          label: '设备标签',
          key: 'tagCodes',
          component: Select,
          componentProps: {
            options: customerTagOptions.value,
            mode: 'multiple',
            maxTagCount: 1,
            fieldNames: { label: 'tagName', value: 'tagCode' },
            placeholder: '请选择设备标签',
            style: { width: '280px' },
            showSearch: true,
            optionFilterProp: 'tagName',
            defaultValue: tagCodes
          }
        },
        { label: '', key: 'keyword', component: Input, componentProps: { placeholder: '设备名称', style: { width: '180px' } } }
      ]
      props.securityDevice && res.splice(0, 3)
      if (props.tagCodes) {
        res = res.filter(e => (e as {key: string;}).key !== 'tagCodes')
      }
      return res
    })
    const columns = [
      {
        title: '设备编号',
        dataIndex: 'code',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: props.securityDevice ? 'deviceName' : 'name',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属产品',
        dataIndex: 'productInfo',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { productInfo: { name: string; };}; }) => {
          const res = record.productInfo?.name
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        },
      },
      {
        title: '产品品类',
        dataIndex: 'productInfo',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { productInfo: { productCategory: { name: string; }; }; deviceProdCategoryName: string; }; }) => {
          const res = props.securityDevice ? record.deviceProdCategoryName : record.productInfo?.productCategory?.name
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        }
      },
      {
        title: '维护部门',
        dataIndex: 'department',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { department: { name: string; }; }; }) => {
          const res = record.department ? (record.department?.name || '--') : '--'
          return <PopOver content={res}>{res}</PopOver>
        }
      },
      {
        title: '所在区域',
        dataIndex: 'areaName',
        align: 'center',
        ellipsis: true,
        customRender: ({ record }: { record: { area: { pathName: string; }; areaName: string; }; }) => {
          const res = props.securityDevice ? record.areaName : record.area?.pathName
          return <PopOver content={res || '--'}>{res || '--'}</PopOver>
        }
      },
    ]
    props.securityDevice && columns.splice(3, 1)
    const selectModelValue = ref<string[]>(props.value ? props.value.map(e => { return e.id }) : [])
    const selectValue = ref<{ id: string; name: string; }[]>(props.value ?? [])
    const ok = async (values: { id: string; name: string; }[]): Promise<void> => {
      try {
        loading.value = true
        modalVisible.value = false
        emit('update:value', values)
        emit('ok', values)
      } catch (error) {
      } finally {
        loading.value = false
      }
    }
    let apiFunction = async (params: DeviceInstancePageParamsAll): Promise<{ records: unknown[]; total: number; }> => { return cubeDeviceCenterService.getDeviceInstancePageAll(params) }
    if (props.securityDevice) {
      // @ts-expect-error
      apiFunction = async (params: {
        applicationCode: string;
        pageSize: number;
        pageNumber: number;
        areaId?: string;
        keyword?: string;
      }): Promise<{ records: unknown[]; total: number; }> => { return cubeSecurityManagementService.getSecurityDevicePage(params) }
    }

    watch(() => props.value, () => {
      if (props.value) {
        selectModelValue.value = props.value.map(e => { return e.id })
        selectValue.value = props.value
      }
    }, { deep: true, immediate: true })

    onMounted(async () => {
      cubeDeviceCenterService.getIotProductCategoryTree().then(res => { productCategoryOptions.value = res })
      cubeDeviceCenterService.getProductListAll().then(res => { productOptions.value = res })
      cubeMdataService.getAreaTree().then(res => { areaOptions.value = res })
      cubeOuaaService.getDeptList().then(res => { deptOptions.value = res })
      cubeDeviceCenterService.getCustomerTagListAll({ status: 1 }).then(res => { customerTagOptions.value = res })
    })
    expose({
      openModal
    })

    return () =>
      <ModalTable
        v-model:show={modalVisible.value}
        columns={columns}
        title={props.title ?? '设备列表'}
        width='1300px'
        search={search.value}
        multiple={props.multiple ?? true}
        apiFunction={apiFunction}
        onOk={ok}
        selectRowKeysValue={selectModelValue.value}
        selectRowValue={selectValue.value}
        loading={loading.value}
        searchParams={(value: SearchType) => {
          const searchData = JSON.parse(JSON.stringify(value))
          searchState.value.categoryCode = searchData.categoryCode ? searchData.categoryCode.join('-') : undefined
          searchState.value.anyMatchedAreaId = searchData.anyMatchedAreaId ? searchData.anyMatchedAreaId.join('-') : undefined
          searchState.value.anyMatchedDepartmentId = searchData.anyMatchedDepartmentId
          searchState.value.tagCodes = props.tagCodes ? props.tagCodes : searchData.tagCodes
          searchState.value.productId = searchData.productId
          return { ...props.searchParams, ...searchState.value, applicationCode: props.applicationCode, filterTagCodes }
        }}
      />
  }
})
