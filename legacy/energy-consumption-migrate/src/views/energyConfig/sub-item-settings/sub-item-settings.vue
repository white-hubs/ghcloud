<template>
  <GLayout title="分项设置">
    <template #header-btn>
      <Button type="primary" @click="toSubItem" style="margin-right: 10px">能耗分类设置</Button>
      <Button type="primary" @click="() => openSubItem('add')">新增分项</Button>
    </template>
    <template #content-data>
      <Tabs @change="tabsChange" v-model:activeKey="activeKey">
        <TabPane key="0" tab="列表">
          <div style="margin-bottom: 20px">
            <Form layout="inline" :model="queryState.state" style="margin-top: 10px">
              <FormItem label="能耗分类">
                <Select
                  placeholder="请选择"
                  v-model:value="queryState.state.instrumentType"
                  style="width: 180px"
                  :options="classifyList"
                  allowClear
                  :field-names="{ label: 'categoryName', value: 'categoryCode' }"
                ></Select>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="getTableList">查询</Button>
                <Button style="margin-left: 10px" @click="reset">重置</Button>
              </FormItem>
            </Form>
          </div>
          <Table :columns="listColumns" :data-source="tableList" :pagination="false" :loading="listLoading" :scroll="{ y: scrollY }">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'action'">
                <div>
                  <a class="ml-10px" @click="() => openSubItem('edit', record)">编辑</a>
                  <Popconfirm title="确定删除该分项？" ok-text="删除" cancel-text="取消" @confirm="deleteData(record)">
                    <a class="ml-10px color-red">删除</a>
                  </Popconfirm>
                  <a class="ml-10px" @click="toDetail(record)">关联设备</a>
                </div>
              </template>
            </template>
          </Table>
          <Pagination
            v-model:current="queryState.state.pageNumber"
            v-model:pageSize="queryState.state.pageSize"
            show-size-changer
            :show-total="(total: any) => `共 ${total} 条 第${queryState.state.pageNumber}/${queryState.state.pages}页`"
            :total="queryState.state.total"
            @change="tableChange"
            style="margin-top: 10px; float: right"
          ></Pagination>
        </TabPane>
        <TabPane key="1" tab="结构图">
          <div style="margin-bottom: 20px">
            <Form layout="inline" :model="queryState.state" style="margin-top: 10px">
              <FormItem label="能耗分类">
                <Select
                  placeholder="请选择"
                  v-model:value="queryState.state.instrumentType"
                  style="width: 180px"
                  :options="classifyList"
                  allowClear
                  :field-names="{ label: 'categoryName', value: 'categoryCode' }"
                >
                </Select>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="getStructureTableList">查询</Button>
                <Button style="margin-left: 10px" @click="reset">重置</Button>
              </FormItem>
            </Form>
          </div>
          <div v-if="structureTableList[0] && structureTableList[0].length === 0" class="noData">暂无数据！</div>
          <div v-else class="contractTable">
            <table border="1" class="table">
              <thead class="thead" v-if="structureTableHead.length > 0">
                <tr>
                  <th v-for="item in structureTableHead">{{ item }}</th>
                </tr>
              </thead>
              <tbody class="tbody">
                <tr v-for="(row, i) in structureTableList" :key="i">
                  <template v-for="(cell, j) in row">
                    <td v-if="cell.rowspan" :key="j" :rowspan="cell.rowspan" :colspan="cell.colspan">
                      <div class="cell">{{ cell.projectName }}</div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </TabPane>
      </Tabs>
    </template>
  </GLayout>
  <!-- 新增分项 -->
  <Modal width="560px" v-model:visible="subItemVisible" @ok="submitSubItem" :title="isAddSubItem ? '新增分项' : '编辑分项'">
    <Form ref="formRef" class="sub-item-form" :model="deviceForm" :rules="rules">
      <FormItem name="projectName" label="分项名称：">
        <Input v-model:value="deviceForm.projectName" placeholder="请输入分项名称" />
      </FormItem>
      <FormItem name="instrumentType" label="能耗分类：">
        <Select
          v-model:value="deviceForm.instrumentType"
          allowClear
          placeholder="请选择能耗分类"
          :options="classifyList"
          :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          @change="changeClassify"
        >
        </Select>
      </FormItem>
      <FormItem name="parentId" label="上级分项：">
        <Select
          v-model:value="deviceForm.parentId"
          allowClear
          placeholder="请选择上级分项"
          :disabled="!isAddSubItem"
          :options="subItemOptions"
          :field-names="{ label: 'projectName', value: 'id' }"
          @change="changeParent"
        >
        </Select>
      </FormItem>
      <FormItem name="remark" label="分项说明：" class="sub-item-form__remark">
        <Textarea v-model:value="deviceForm.remark" placeholder="请输入分项说明" :maxlength="50" />
      </FormItem>
    </Form>
  </Modal>
</template>
<script setup lang="ts">
import { Modal, Textarea } from "ant-design-vue";
import { Popconfirm } from "ant-design-vue/es";
import { message } from "ant-design-vue/es";
import type { ColumnsType } from "ant-design-vue/es/table/Table";
import type { SelectValue } from "ant-design-vue/lib/select";
import { ref, onMounted, reactive } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import {
  EnergyCollectConfigList,
  EnergyProjectAdd,
  EnergyProjectUpdate,
  SubItemList,
  SubItemPage,
  EnergyProjectDelete,
  SubItemTreePage,
} from "@/api/energyOverview";
import GLayout from "@/components/common/gLayout.vue";

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    instrumentType: undefined as string | undefined,
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["instrumentType", "keyword", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    return raw;
  },
});
const scrollY = ref<number>(200);
const scrollHandle = () => {
  let tableHeight = 0;
  const clientHeight = document.querySelector(".layout-content")?.clientHeight;
  if (clientHeight) {
    tableHeight = clientHeight - 240;
  }
  scrollY.value = tableHeight;
};
onMounted(async () => {
  // 设置表格滚动
  scrollHandle();
  window.addEventListener("resize", function () {
    scrollHandle();
  });
  let { data } = await EnergyCollectConfigList();
  classifyList.value = data;
});
const activeKey = ref("0");
const tabsChange = (value: any) => {
  activeKey.value === "0" ? getTableList() : getStructureTableList();
  activeKey.value = value;
};
//查询==================================================================================================================
const classifyList = ref([]);
const reset = () => {
  queryState.clearCache();
  queryState.update({
    instrumentType: undefined,
    keyword: "",
  });
  queryState.resetPage();
  getTableList();
};
//新增分项==================================================================================================
const subItemVisible = ref(false);
const formRef = ref();
const subItemOptions = ref([]);
const deviceForm = reactive({
  projectName: "",
  remark: "", //类型名称
  instrumentType: undefined as string | undefined,
  parentId: undefined as string | undefined,
  id: "",
  code: "",
});
const changeClassify = async (instrumentType: SelectValue) => {
  if (instrumentType && instrumentType !== "") {
    const { data } = await SubItemList({ instrumentType });
    deviceForm.parentId = undefined;
    subItemOptions.value = data;
  } else {
    const { data } = await SubItemList();
    deviceForm.parentId = undefined;
    subItemOptions.value = data;
  }
};
const changeParent = async (_value: SelectValue, option: any) => {
  deviceForm.instrumentType = option?.instrumentType;
  formRef.value?.clearValidate();
  if (!deviceForm.parentId) {
    const { data } = await SubItemList();
    subItemOptions.value = data;
  }
};
const rules = ref({
  projectName: [
    { required: true, message: "请输入分项名称" },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
      message: "请输入正确的分项名称",
    },
  ],
  instrumentType: [{ required: true, message: "请选择能耗分类" }],
});
const isAddSubItem = ref(true);
const openSubItem = (type: string, item?: any) => {
  formRef.value?.resetFields();
  SubItemList().then((res) => {
    subItemOptions.value = res.data;
  });
  if (type === "edit") {
    isAddSubItem.value = false;
    deviceForm.projectName = item.projectName;
    deviceForm.remark = item.remark;
    deviceForm.instrumentType = item.instrumentType;
    deviceForm.parentId = item.parentId;
    deviceForm.id = item.id;
    deviceForm.code = item.code;
  } else {
    isAddSubItem.value = true;
    deviceForm.projectName = "";
    deviceForm.remark = "";
    deviceForm.instrumentType = undefined;
    deviceForm.parentId = undefined;
    deviceForm.id = "";
  }
  subItemVisible.value = true;
};
const submitSubItem = () => {
  formRef.value.validate().then(async () => {
    if (deviceForm.id === "") {
      await EnergyProjectAdd(deviceForm);
      message.success("操作成功");
    } else {
      await EnergyProjectUpdate(deviceForm);
      message.success("操作成功");
    }
    getTableList();
    subItemVisible.value = false;
  });
};

//关联设备==================================================================================================================

//列表========================================================================================================
const tableList = ref([]);
const listLoading = ref(true);
const listColumns: ColumnsType<any> = [
  {
    title: "分项编码",
    dataIndex: "code",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "分项名称",
    dataIndex: "projectName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "分项说明",
    dataIndex: "remark",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "能耗分类",
    dataIndex: "instrumentTypeName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "上级分项",
    dataIndex: "parentName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return text || "--";
    },
  },
  {
    title: "关联设备数量",
    dataIndex: "metersNum",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: number }) => {
      return text;
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    width: "200px",
  },
];
const getTableList = async () => {
  listLoading.value = true;
  const { data } = await SubItemPage({
    instrumentType: queryState.state.instrumentType,
    pageNumber: queryState.state.pageNumber,
    pageSize: queryState.state.pageSize,
  });
  tableList.value = data.records;
  queryState.state.total = data.total;
  queryState.state.pages = data.pages;
  queryState.writeCache();
  listLoading.value = false;
};
getTableList();
const tableChange = (current: number, pageSize: number) => {
  queryState.setPage(current || 1, pageSize);
  getTableList();
};
const deleteData = async (data: { id: string }) => {
  await EnergyProjectDelete(data.id);
  message.success("操作成功");
  getTableList();
};
const toDetail = (record: { projectName: any; id: string }) => {
  history.pushState({}, "", `/portal/energy-consumption/associated-devices?&id=${record.id}&page=sub-item&name=${record.projectName}`);
};

//结构图========================================================================================================
const structureTableList = ref<any[]>([]);
const structureTableHead = ref<any[]>([]);
const parseTreeToRow = (node: any, data = [], row = []) => {
  if (!node.children.length) {
    data.push(row);
  } else {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const cell = { projectName: child.projectName };
      /******************添加的代码******************/
      //深度克隆父亲，因为后代共用了该引用数据
      const extendRow = [...JSON.parse(JSON.stringify(row)), cell];
      if (extendRow.length === 1) {
        //第一列
        extendRow[0].rowspan = 1;
      } else if (extendRow.length > 1) {
        //将该行的最后一列的rowspan赋给上一列
        //再将自身置为1(避免最后一列无值)
        extendRow[extendRow.length - 2].rowspan = i === 0 ? computeLeafCount(node) : 0;
        extendRow[extendRow.length - 1].rowspan = 1;
      }
      /******************添加的代码******************/
      parseTreeToRow(child, data, extendRow);
    }
  }
  return data;
};
const computeLeafCount = (node: { children: string | any[]; rowspan: number }) => {
  if (!node.children.length) {
    node.rowspan = 1;
    return 1;
  } else {
    let leafCount = 0;
    for (let i = 0; i < node.children.length; i++) {
      leafCount = leafCount + computeLeafCount(node.children[i]);
    }
    node.rowspan = leafCount;
    return leafCount;
  }
};
const padArrayLength = (arr: any[], fillObject: { projectName: string; rowspan: number }) => {
  // 获取最大长度
  const maxLength = Math.max(...arr.map((subArray: string | any[]) => subArray.length));
  structureTableHead.value = ["能耗分类", "分项名称"];
  if (maxLength > 2) {
    for (let i = 1; i <= maxLength - 2; i++) {
      structureTableHead.value.push(`${i}级子项`);
      // 在循环体中对数字进行处理
    }
  }
  // 使用 map 方法补足长度
  const paddedArray = arr.map((subArray: string | any[]) => {
    if (subArray.length < maxLength) {
      const paddingLength = maxLength - subArray.length;
      const padding = Array(paddingLength).fill(fillObject);
      return [...subArray, ...padding];
    }
    return subArray;
  });
  return paddedArray;
};
const setStructureList = (list: any[]) => {
  let arr = parseTreeToRow({ value: "", children: list });
  const fillArr = padArrayLength(arr, { projectName: "", rowspan: 1 });
  const result: any[] = [];
  const map = new Map();
  arr = JSON.parse(JSON.stringify(fillArr));
  arr.forEach((row) => {
    const key = JSON.stringify(row[0]);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(row);
  });
  map.forEach((value) => {
    result.push(value);
  });
  const dataTable = JSON.parse(JSON.stringify(result));
  dataTable.forEach((item: any[], i: string | number) => {
    item.forEach((child: any[], index: number) => {
      child.forEach((child1: { projectName: any }, index1: string | number) => {
        if (index !== 0) {
          if (result[i][index - 1][index1] && child1.projectName === result[i][index - 1][index1].projectName) {
            result[i][index][index1].rowspan = 0;
          }
        }
      });
    });
  });
  structureTableList.value = result.reduce((acc, curr) => {
    return acc.concat(curr);
  }, []);
};
const getStructureTableList = async () => {
  listLoading.value = true;
  const { data } = await SubItemTreePage({
    instrumentType: queryState.state.instrumentType,
  });
  structureTableList.value = data;
  queryState.state.total = data.total;
  listLoading.value = false;
  setStructureList(structureTableList.value);
};

//能耗分类设置=======================================================================================================
const toSubItem = () => {
  history.pushState({}, "", `/portal/energy-consumption/energyConfig/classify-settings`);
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.contractTable {
  height: calc(100vh - 350px);
  overflow: auto;
}
.table {
  font-size: 14px;
  border: 3px #f0f0f0;
  color: #252525;
  font-weight: 500;
  th,
  td {
    padding: 18px 20px;
  }
}
.thead {
  background-color: #fafafa;
}
.noData {
  width: 100%;
  text-align: center;
}
.sub-item-form {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 10px 16px;

  :deep(.ant-form-item) {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    min-width: 0;
    margin: 0;
  }

  :deep(.ant-form-item-label) {
    width: 120px;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }

  :deep(.ant-input),
  :deep(.ant-select) {
    width: 100%;
  }
}
.sub-item-form__remark {
  grid-column: 1 / -1;
}
</style>
