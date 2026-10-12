<template>
  <Spin :spinning="allLoading" wrapper-class-name="full-screen-loading">
    <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
      <template #content-left>
        <Menu v-model:selectedKeys="selectedKeys" style="width: 256px">
          <MenuItem v-for="item in approvalList" :key="item.code">
          {{ item.name }}
          </MenuItem>
        </Menu>
      </template>
      <template #content-table>
        <div class="content-table-bar" style="display: flex; align-items: center; margin-left: 5px">
          <div class="label">表单流程:</div>
          <Select v-model:value="flowSelectValue" style="width: 218px" :options="options!"
            :field-names="{ label: 'name', value: 'id' }" @change="handleChange" />
        </div>
        <div>
          <Table v-if="dataSource.length" :data-source="tableSelectOption!" :columns="columns" :scroll="{ y: scrollY }"
            :pagination="false">
            <template #bodyCell="{ column, record, }">
              <template v-if="column.key === 'businessField'">
                {{ record.name }}
              </template>
              <template v-if="column.key === 'title'">
                <Select v-model:value="record.formItemId" style="width: 218px" allow-clear>
                  <SelectOption v-for="item in dataSource" :key="item.controlId" :value="item.controlId">{{ item.title }}
                  </SelectOption>
                </Select>
              </template>
            </template>
          </Table>
        </div>
      </template>
      <template #footer-page>
        <Button type="primary" :loading="isLoading" @click="save">保存</Button>
      </template>
    </GLayout>
  </Spin>
</template>
<script setup lang="ts">
import GLayout from '@/components/common/g-layout.vue'
import {
  getApprovalType,
  getFlowformField,
  getFormFlowBusinessFlow,
  getFormFlowbyId,
  getFormFlowList,
  saveFormFlowBusiness
} from '@/api/flow-config'
import type { SelectProps, TableColumnsType } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import type { SelectValue } from 'ant-design-vue/lib/select'
import { onMounted, ref, watch } from 'vue'
import { usePageName } from '@ghcloud/cube-utils'
interface ApprovalListItem {
  code: string;
  name: string;
}
interface SaveForm {
  formDefinitionId: string;
  id: string;
}
interface TableDataItem {
  title: string;
  businessField: string | null;
  controlId: string;
}
const { pageTitle } = usePageName()
const selectedKeys = ref<string[]>(['REPAIR_CLOCK'])
const options = ref<SelectProps['options']>([])
const tableSelectOption = ref<SelectProps['options']>([])
const isLoading = ref(false)
const allLoading = ref(false)
const saveForm = ref<SaveForm>({ formDefinitionId: '', id: '' })
const columns: TableColumnsType = [
  {
    title: '业务流程',
    dataIndex: 'businessField',
    key: 'businessField',
    width: 380
  },
  {
    title: '表单字段',
    dataIndex: 'title',
    key: 'title'
  }
]
const dataSource = ref<TableDataItem[]>([])
const approvalList = ref<ApprovalListItem[]>([])
const flowSelectValue = ref<string>('')
// 初始化获取业务审批类型
const initData = async () => {
  allLoading.value = true
  try {
    // 获取业务审批类型
    const approvalReslut = await getApprovalType()
    approvalList.value = approvalReslut.data ?? []
    selectedKeys.value = approvalList.value.length ? [approvalList.value[0].code] : []
    allLoading.value = false
  } catch (error: unknown) {
    allLoading.value = false
  }
}
onMounted(async () => {
  await initData()
  getScrollY()
})
const scrollY = ref(500)
const getScrollY = () => {
      const layoutContentHeight =
        document.getElementsByClassName("layout-content")[0] as HTMLDivElement;
      const tableBar = document.getElementsByClassName("content-table-bar")[0] as HTMLDivElement;
      scrollY.value =
        layoutContentHeight.offsetHeight -
        tableBar.offsetHeight-
        100;
};
const getDataSource = async (val: string) => {
  const reslut = await getFormFlowbyId({ id: val })
  const { data } = reslut
  if (data) {
    const {
      formBizFieldMapList = [],
      formDefinitionId = '',
      id = '',
      formJson = ''
    } = data
    const formFieldsList = formJson ? JSON.parse(formJson) as {id:string;name:string; props:{items:unknown[];};title:string;baseOn:string|undefined;}[] : []
    const tableData: TableDataItem[] = []
    const pushTableData = (formItem: { id: string; title: string; }, preTitle = ''): void => {
      let businessField: string | null = null
      if (formBizFieldMapList.length) {
        const data = formBizFieldMapList.find((i) => i.controlId === formItem.id)
        const find = tableSelectOption.value?.find((item) => {
          return item.id === data?.businessField
        })
        businessField = data && find ? data.businessField : null
      }
      tableData.push({
        controlId: formItem.id,
        title: `${preTitle ? preTitle + '-' : ''}` + formItem.title,
        businessField
      })
    }

    formFieldsList.forEach(item => {
      if (item.name === 'GroupList') {
        if (item.props.items?.length) {
          item.props.items.forEach(element => pushTableData(element as { id: string; title: string; }, item.title))
        }
      } else {
        pushTableData(item)
      }
    })
    // 组装表格数据
    saveForm.value = { formDefinitionId, id }
    dataSource.value = tableData
    tableSelectOption.value?.forEach(e => {
      const index = tableData?.findIndex(ele => e.id === ele.businessField) ?? -1
      if (index !== -1) {
        e.formItemId = tableData[index].controlId
      }
    })
  }
}
const handleChange = (value: SelectValue) => {
  getDataSource(value as string)
}

// 获取选中类型及流程表单选项
const getFormFlowBusinessFlowAndOption = async () => {
  allLoading.value = true
  // 获取表单业务字段
  try {
    const optionResult = await getFormFlowList({
      enable: true,
      application: 'PROPERTY_MANAGEMENT'
    })
    options.value = optionResult.data || []

    const tableSelectOptionResult = await getFlowformField({ type: selectedKeys.value[0] })
    tableSelectOption.value = tableSelectOptionResult.data || []
    const selectValueResult = await getFormFlowBusinessFlow(
      selectedKeys.value[0]
    )
    flowSelectValue.value = selectValueResult.data || ''
    if (selectValueResult.data) {
      handleChange(selectValueResult.data)
    }
    allLoading.value = false
  } catch (error) {
    allLoading.value = false
  }
}

const save = async () => {
  if (!flowSelectValue.value) return message.error('请选择表单流程')
  isLoading.value = true
  try {
    const business = approvalList.value.find(
      (d) => d.code === selectedKeys.value[0]
    )
    const params = {
      formDefinitionId: saveForm.value.formDefinitionId,
      businessType: business?.code,
      businessTypeName: business?.name,
      formFlowId: saveForm.value.id,
      fieldMapList: dataSource.value
    }
    dataSource.value.forEach(e => {
      e.businessField = ''
    })
    tableSelectOption.value?.forEach(e => {
      const index = dataSource.value.findIndex(ele => ele.controlId === e.formItemId)
      if (index !== -1) {
        dataSource.value[index].businessField = e.id
      }
    })
    await saveFormFlowBusiness(params)
    message.success('保存成功')
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  }
}
watch(
  () => selectedKeys.value,
  () => {
    saveForm.value = { formDefinitionId: '', id: '' }
    dataSource.value = []
    getFormFlowBusinessFlowAndOption()
  }
)
</script>

<style scoped lang="less">
.label {
  margin-right: 5px;
}

.label::before {
  display: inline-block;
  margin-right: 4px;
  color: #ff4d4f;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
  content: "*";
}

::deep(.content-table) {
  overflow: overlay !important;
}
</style>
<style lang="less">
.full-screen-loading {
  height: 100%;

  .asset-management-spin-container {
    height: 100% !important;
  }
}
</style>
