import type { GenreList } from '@/views/device-relation/device-relation-i'
import { Button, Cascader, Checkbox, Form, FormItem, Input, Page, Table } from '@ghcloud/cube-ui'
import { cubeDeviceCenterService } from '@ghcloud/generic-component/src/api/service'
import { defineComponent, reactive, ref, type PropType, watch, onMounted } from 'vue'
import styles from '../../device-association/device-association.module.less'
export const DeviceModal = defineComponent({
  props: {
    menuSelectedValue: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
  },
  setup: (props, { expose }) => {
    const selectTableColumn = [
      {
        dataIndex: 'code',
        title: '设备编码',

      },
      {
        dataIndex: 'name',
        title: '设备名称',
      },
      {
        dataIndex: 'deviceProdCategoryName',
        title: '产品品类',
      },
      {
        dataIndex: 'deviceProdName',
        title: '产品名称',
      },
      {
        dataIndex: 'brandName',
        title: '设备品牌',
      },
      {
        dataIndex: 'areaName',
        title: '所属区域',
      }
    ]
    const selectTableLoading = ref(false)
    const selectTableData = ref<unknown>([])
    const checkAll = ref<boolean>(false)
    const styleRowKeysData = ref<string[]>([])
    const genreList = ref<GenreList[]>([])
    const formData = reactive({
      categoryCode: [],
      keyword: '',
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const styleRowSelection = reactive({
      selectedRowKeys: styleRowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: string []) => {
        styleRowKeysData.value.length = 0
        styleRowKeysData.value.push(...selectedRowKeys)
      },
    })
    const selectDevicePage = async (): Promise<void> => {
      selectTableLoading.value = true
      const res = await cubeDeviceCenterService.getDeviceInstancePageAll({ ...formData, filterTagCodes: [`custom.app::visual.${props.menuSelectedValue}`], categoryCode: formData.categoryCode?.join('-') })
      selectTableData.value = res.records.map(e => {
        return {
          ...e,
          deviceProdCategoryName: e.productInfo?.productCategory?.name,
          deviceProdName: e.productInfo?.name,
          brandName: e.productInfo?.brandName,
          areaName: e.area?.pathName,
        }
      })
      formData.total = res.total
      selectTableLoading.value = false
    }
    const reset = (): void => {
      Object.assign(formData, {
        categoryCode: [],
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      })
      selectDevicePage()
    }
    const selectChangePage = (page: number, pageSize: number): void => {
      formData.pageNumber = page
      formData.pageSize = pageSize
      selectDevicePage()
    }
    // 获取产品品类树列表
    const requestProjectGenreList = async (): Promise<void> => {
      genreList.value = await cubeDeviceCenterService.getIotProductCategoryTree()
    }
    onMounted(() => {
      selectDevicePage()
      requestProjectGenreList()
    })
    watch(() => props.visible, () => {
      if (props.visible) {
        selectDevicePage()
        checkAll.value = false
      }
    })
    const getDeviceData = (): { checkAll: boolean;styleRowKeysData: string[]; categoryCode: string[];keyword: string; } => {
      return {
        checkAll: checkAll.value,
        styleRowKeysData: styleRowKeysData.value,
        categoryCode: formData.categoryCode ?? '',
        keyword: formData.keyword,
      }
    }
    expose({
      getDeviceData,
    })
    return (): JSX.Element =>
      <>
        <Form layout='inline' model={formData}>
          <FormItem label='产品分类:' name='categoryCode'>
            <Cascader
              style={{ width: '150px' }}
              changeOnSelect
              fieldNames={{ label: 'categoryName', value: 'categoryCode', children: 'children' }}
              v-model:value={formData.categoryCode} options={genreList.value} placeholder='请选择产品分类'
            />
          </FormItem>
          <FormItem label='设备名称:' name='keyword'>
            <Input
              maxlength={20}
              placeholder='请输入设备名称'
              v-model:value={formData.keyword}
            />
          </FormItem>
          <FormItem label='勾选当前所有' name='instanceName'>
            <Checkbox v-model:checked={checkAll.value} />
          </FormItem>
          <FormItem>
            <Button class={styles.ml10} type='primary' onClick={selectDevicePage}>查询</Button>
            <Button class={styles.ml10} type='primary' onClick={reset}>重置</Button>
          </FormItem>
        </Form>
        <Table
          style={{ marginTop: '10px' }}
          columns={selectTableColumn}
          dataSource={selectTableData.value}
          loading={selectTableLoading.value}
          pagination={false}
          scrollY={440}
          rowKey='id'
          rowSelection={styleRowSelection}
        />
        <Page
          style='margin-top:20px;text-align: right;'
          v-model:current={formData.pageNumber}
          v-model:pageSize={formData.pageSize}
          v-model:total={formData.total}
          onPageChange={selectChangePage}
        />
      </>
  }
})
