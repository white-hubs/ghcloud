<template>
  <a-spin :spinning="allLoading" wrapper-class-name="full-screen-loading">
    <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
      <template #content-left>
        <a-menu v-model:selectedKeys="selectedKeys" style="width: 256px">
          <a-menu-item v-for="item in approvalList" :key="item.code">
            {{ item.name }}
          </a-menu-item>
        </a-menu>
      </template>

      <template #content-table>
        <div style="display: flex; align-items: center; margin: 10px 0; margin-left: 5px">
          <div class="label">表单流程:</div>
          <a-select v-model:value="flowSelectValue" style="width: 218px" :options="options!"
            :field-names="{ label: 'name', value: 'id' }" @change="handleChange" />
        </div>
        <div>
          <a-table v-if="dataSource.length" :data-source="tableSelectOption!" :columns="columns"
            :scroll="{ y: tableScrollY }" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'businessField'">
                <span v-if="record.required" class="require-tip">*</span>
                {{ record.name }}
              </template>
              <template v-if="column.key === 'title'">
                <a-cascader 
                  changeOnSelect
                  v-model:value="record.formItemId" 
                  :field-names="{ label: 'title', value: 'controlId', children: 'children' }"
                  :options="dataSource" placeholder="请选择"
                  />
              </template>
            </template>
          </a-table>
        </div>
      </template>

      <template #footer-page>
        <a-button type="primary" :loading="isLoading" @click="save"
          v-if="!permission || hasPermission(permission.save)">保存</a-button>
      </template>
    </GLayout>
  </a-spin>
</template>

<script setup lang="ts">
import GLayout from "../../components/common/gLayout.vue";
import {
  getApprovalType,
  GetFlowformField,
  getFlowformField,
  getFormFlowBusinessFlow,
  getFormFlowbyId,
  getFormFlowList,
  saveFormFlowBusiness,
} from "../../api/flow-config";
import type { SelectProps, TableColumnsType } from "ant-design-vue";
import { message } from "ant-design-vue";
import type { SelectValue } from "ant-design-vue/lib/select";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { hasPermission } from '@ghcloud/cube-permission-codes'
import { appFunctionCodes } from '@/permission'
import { mapControlIdsToList, mapIdsToBusinessFields } from './index'
import { usePageName } from "@ghcloud/cube-utils";

interface ApprovalListItem {
  code: string;
  name: string;
}
interface SaveForm {
  formDefinitionId: string;
  id: string;
}
interface TableDataItem {
  controlType?: string;
  title: string;
  businessField: string | null;
  controlId: string;
  children?:TableDataItem[]
}

const { pageTitle } = usePageName()
const permission = appFunctionCodes.flowSetting ?? null
const selectedKeys = ref<string[]>(["REPAIR_CLOCK"]);
const options = ref<SelectProps["options"]>([]);
const tableSelectOption = ref<SelectProps["options"]>([]);
const isLoading = ref(false);
const allLoading = ref(false);
const saveForm = ref<SaveForm>({ formDefinitionId: "", id: "" });
const tableScrollY = ref(400);
/**
 * api 接口前缀
 * code 业务应用code 可不传
 */
let { api, code } = useRoute().query;

const columns: TableColumnsType = [
  {
    title: "业务流程",
    dataIndex: "businessField",
    key: "businessField",
    width: 380,
  },
  {
    title: "表单字段",
    dataIndex: "title",
    key: "title",
  },
];
const dataSource = ref<TableDataItem[]>([]);
const approvalList = ref<ApprovalListItem[]>([]);
const flowSelectValue = ref<string>("");
// 初始化获取业务审批类型
const initData = async () => {
  allLoading.value = true;
  const applicationCode = getApplicationCode()
  if(applicationCode==='COMPLAINT' || applicationCode==='FAULT'){
    api = 'maintain/fault'
  }

  try {
    // 获取业务审批类型
    const approvalResult = await getApprovalType(api as string, applicationCode) as unknown as { code: string; name: string; }[];
    approvalList.value = approvalResult ?? [];
    selectedKeys.value = approvalList.value.length ? [approvalList.value[0].code] : [];
    allLoading.value = false;
  } catch (error: unknown) {
    allLoading.value = false;
  }
};
onMounted(async () => {
  await initData();
});
const getDataSource = async (val: string) => {
  const reslut = await getFormFlowbyId({ id: val });
  const  data  = reslut  as unknown as GetFlowformField;
  if (data) { 
    const {
      formBizFieldMapList = [],
      formDefinitionId = "",
      id = "",
      formJson = "",
    } = data;
    const formFieldsList = formJson
      ? (JSON.parse(formJson) as {
          id: string;
          name: string;
          props: { items: unknown[] };
          title: string;
          baseOn: string | undefined;
        }[])
      : [];
    const tableData: TableDataItem[] = [];
    const pushTableData = (
      formItem: { id: string; title: string,name:string },
      parent?: { id: string; title: string,name:string },
    ): void => {
      let businessField: string | null = null;
      if (formBizFieldMapList.length) {
        const data = formBizFieldMapList.find(
          (i: { controlId: string }) => i.controlId === formItem.id
        );
        const find = tableSelectOption.value?.find((item) => {
          return item.id === data?.businessField;
        });
        businessField = data && find ? data.businessField : null;
      }
      if(formItem.name === "GroupList"){
        tableData.push({
          controlId: formItem.id,
          title: formItem.title,
          children: [],
          businessField
        });
      }else if(parent){
        const father=tableData.find(x=>x.controlId===parent.id) as TableDataItem
        father.children?.push({
        controlId: formItem.id,
        title: formItem.title,
        businessField,
      });
      }else{
        tableData.push({
          controlId: formItem.id,
          title: formItem.title,
          businessField
        });
      }
      tableScrollY.value = document.querySelector(".content-table")!.clientHeight - 107;
    };
    formFieldsList.forEach((item) => {
      if (item.name === "GroupList") {
        pushTableData(item)
        if (item.props.items?.length) {
          item.props.items.forEach((element) =>
          pushTableData(
            element as { id: string, title: string,name:string },
            item as { id: string,title: string,name:string })
          );
        }
      } else {
        pushTableData(item)
      }
    });
    // 组装表格数据
    saveForm.value = { formDefinitionId, id };
    dataSource.value = tableData;
    mapControlIdsToList(tableSelectOption.value,tableData)
  }
};
const handleChange = (value: SelectValue) => {
  getDataSource(value as string);
};

const  getApplicationCode = ()=>{
  const currentApplication = JSON.parse(
    sessionStorage.getItem("GH-currentApplication") as string
  );
  return code ?? currentApplication.code;
}

// 获取选中类型及流程表单选项
const getFormFlowBusinessFlowAndOption = async () => {

  allLoading.value = true;
  // 获取表单业务字段
  try {
    const optionResult = await getFormFlowList({
      enable: true,
      application: getApplicationCode()
    }) as unknown as SelectProps["options"];
    options.value = optionResult;

    const tableSelectOptionResult = await getFlowformField(api as string, {
      type: selectedKeys.value[0],
    }) as unknown as SelectProps["options"];
    tableSelectOption.value = tableSelectOptionResult;
    const selectValueResult = await getFormFlowBusinessFlow(selectedKeys.value[0]);
    flowSelectValue.value = selectValueResult || "";
    if (selectValueResult) {
      handleChange(selectValueResult);
    }
    allLoading.value = false;
  } catch (error) {
    allLoading.value = false;
  }
};

const save = async () => {
  if (!flowSelectValue.value) return message.error("请选择表单流程");
  isLoading.value = true;
  try {
    const business = approvalList.value.find((d) => d.code === selectedKeys.value[0]);
    const params = {
      formDefinitionId: saveForm.value.formDefinitionId,
      businessType: business?.code,
      businessTypeName: business?.name,
      formFlowId: saveForm.value.id,
      fieldMapList: dataSource.value,
    };
    dataSource.value.forEach((e) => {
      e.businessField = "";
    });
    tableSelectOption.value?.forEach(x=>{
      if(x.formItemId&&typeof x.formItemId ==='object'){
        x.formItemId=x.formItemId.join(',');
      }
    })
    mapIdsToBusinessFields(dataSource.value,tableSelectOption.value)
    await saveFormFlowBusiness(params);
    getFormFlowBusinessFlowAndOption()
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
.require-tip{
  display: inline-block;
  color: #ff4d4f;
  font-size: 14px;
}
</style>

<style lang="less">
.full-screen-loading {
  height: 100%;

  .content-search {
    display: none;
  }

  .template-spin-container {
    height: 100% !important;
  }
}
</style>
