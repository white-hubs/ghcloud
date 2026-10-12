<template>
  <a-spin :spinning="allLoading">
    <gLayout :title="pageTitle">
      <template #content-left>
        <a-menu style="width: 256px" v-model:selectedKeys="selectedKeys">
          <a-menu-item :key="item.code" v-for="item in approvalList">
            {{ item.name }}
          </a-menu-item>
        </a-menu>
      </template>
      <template #content-table>
        <div style="display: flex; align-items: center; margin-left: 5px">
          <div class="label">表单流程:</div>
          <a-select v-model:value="flowSelectValue" style="width: 218px" :options="options"
            :field-names="{ label: 'name', value: 'id' }" @change="handleChange">
          </a-select>
        </div>
        <div>
          <AliasTable 
          tableCode="GOVERNMENT_FLOW_CONFIG" 
          applicationCode="OFFICIAL_MANAGEMENT" :dataSource="dataSource" :columns="columns" :scroll="{ x: 1000, y: 520 }" :pagination="false">
          </AliasTable>
        </div>
      </template>
      <template #footer-page>
        <a-button type="primary" v-if="hasPermission(permission.save)" @click="save" :loading="isLoading">保存</a-button>
      </template>
    </gLayout>
  </a-spin>
</template>
<script setup lang="ts">
import {
getApprovalType,
getFlowformField,
getFormFlowBusinessFlow,
getFormFlowbyId,
getFormFlowList,
saveFormFlowBusiness
} from "@/api/flowConfig";
import { AliasTable } from '@ghcloud/generic-component'
import gLayout from "@/components/common/gLayout.vue";
import type { SelectProps, TableColumnsType } from "ant-design-vue";
import { message, Select } from "ant-design-vue";
import { onMounted, ref, watch,h } from "vue";
import { appFunctionCodes } from '@/permission'
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { usePageName } from '@ghcloud/cube-utils'
const { pageTitle } = usePageName()
const permission=appFunctionCodes.flowSetting
interface approvalListItem {
  code: string;
  name: string;
}
interface saveForm {
  formDefinitionId: string;
  id: string;
}
interface TableDataItem {
  title: string;
  businessField: string;
  controlId: string;
}
const selectedKeys = ref<Array<string>>(["REPAIR_CLOCK"]);
const options = ref<SelectProps["options"]>([]);
const tableSelectOption = ref<SelectProps["options"]>([]);
const isLoading = ref(false);
const allLoading = ref(false);
const saveForm = ref<saveForm>({ formDefinitionId: "", id: "" });
const columns: TableColumnsType = [
  {
    title: "表单字段",
    dataIndex: "title",
    key: "title",
    width: 380,
  },
  {
    title: "业务流程",
    dataIndex: "businessField",
    key: "businessField",
    customRender: ({ record }) => {
      return [
      h(
        Select,
        {
          onChange: (value:string)=>{record.businessField = value;}, 
          value: record.businessField , 
          style: { width: '218px' },
          getPopupContainer: (triggerNode) => triggerNode.parentNode,
          options: tableSelectOption.value,
          'field-names': { label: 'name', value: 'id' }
        }
      )
      ]
    }
  },
];
let dataSource = ref<Array<any>>([]);
const approvalList = ref<approvalListItem[]>([]);
const flowSelectValue = ref<string>("");
onMounted(async () => {
  await initData();
});
// 初始化获取业务审批类型
const initData = async () => {
  allLoading.value = true;
  try {
    // 获取业务审批类型
    const approvalReslut = await getApprovalType();
    approvalList.value = approvalReslut.data || [];
    selectedKeys.value = [approvalReslut.data[0].code];

    // 获取当前选中的类型
    await getFormFlowBusinessFlowAndOption();
    allLoading.value = false;
  } catch (error: unknown) {
    allLoading.value = false;
  }
};
// 获取选中类型及流程表单选项
const getFormFlowBusinessFlowAndOption = async () => {
  allLoading.value = true;
  try {
    // 获取表单业务字段
    const tableSelectOptionResult = await getFlowformField({
      type: selectedKeys.value[0],
    });
    // 表单下拉框
    tableSelectOption.value = tableSelectOptionResult.data || [];
    const selectValueResult = await getFormFlowBusinessFlow(
      selectedKeys.value[0]
    );
    flowSelectValue.value = selectValueResult.data || "";
    const optionResult = await getFormFlowList({
      enable: true,
      application: "OFFICIAL_MANAGEMENT",
    });
    options.value = optionResult.data || [];
    if (selectValueResult.data) {
      handleChange(selectValueResult.data);
    }
    allLoading.value = false;
  } catch (error) {
    allLoading.value = false;
  }
};
const handleChange = async (val: string) => {
  const reslut = await getFormFlowbyId({ id: val });
  const { data } = reslut;
  const {
    formBizFieldMapList = [],
    formFieldList = [],
    formDefinitionId = "",
    id = "",
    formJson = "",
  } = data;
  const formFieldsList = JSON.parse(formJson);
  const tableData: TableDataItem[] = []
  formFieldsList.forEach((item: any) => {
    if (item.name === 'GroupList' && item.props.items && item.props.items.length) {
      item.props.items.forEach((element: { id: string; title: string }) => {
        pushTableData(element, item.title)
      });
    } else {
      pushTableData(item)
    }
    function pushTableData(formItem: { id: any; title: string }, preTitle: string = ''): void {
      let businessField: string | null = null;
      if (formBizFieldMapList.length) {
        const data = formBizFieldMapList.find(
          (i: any) => i.controlId === formItem.id
        );
        const find = tableSelectOption.value?.find((item: any) => {
          return item.id === data?.businessField
        })
        businessField = (data && find) ? data.businessField : null;
      }
      tableData.push({
        controlId: formItem.id,
        title: `${preTitle ? preTitle + '-' : ''}` + formItem.title,
        businessField: businessField!,
      })
    }
  });
  // 组装表格数据
  saveForm.value = { formDefinitionId, id };
  dataSource.value = tableData;
};
const save = async () => {
  isLoading.value = true;
  try {
    const business = approvalList.value.find(
      (d) => d.code === selectedKeys.value[0]
    );
    const params = {
      formDefinitionId: saveForm.value.formDefinitionId,
      businessType: business?.code,
      businessTypeName: business?.name,
      formFlowId: saveForm.value.id,
      fieldMapList: dataSource.value,
    };
    await saveFormFlowBusiness(params);
    message.success("保存成功");
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
};
watch(
  () => selectedKeys.value,
  () => {
    saveForm.value = { formDefinitionId: "", id: "" };
    dataSource.value = [];
    getFormFlowBusinessFlowAndOption();
  }
);
</script>

<style scoped lang="less">
.label {
  margin-right: 5px;
}

::v-deep(.content-left) {
  overflow: overlay !important;
}

::v-deep(.content-table) {
  overflow: overlay !important;
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
</style>
