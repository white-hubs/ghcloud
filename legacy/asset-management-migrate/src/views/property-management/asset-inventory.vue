<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <div class="header-btn">
        <Button type="primary" style="margin-right: 10px" :loading="downloadTplLoading" @click="downLoadTpl">下载模板</Button>
        <Upload :before-upload="beforeUpload" :max-count="1" :accept="'.xls,.xlsx,.csv'">
          <Button type="primary" :loading="exportInLoading" style="margin-right: 10px">导入</Button>
        </Upload>
        <Button type="primary" style="margin-right: 10px" :loading="codeLoading" @click="downLoadQRcode">下载二维码</Button>
        <Button type="primary" :loading="exportOutLoading" @click="exportOut">导出</Button>
      </div>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="使用部门">
          <Select v-model:value="formState.receiveDepId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="资产状态">
          <Select v-model:value="formState.status" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetStatus" :key="item.value" :value="item.value">{{ item.label }} </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="购入日期">
          <DatePicker v-model:value="formState.purchaseDate" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="入库日期">
          <DatePicker v-model:value="formState.startTime" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem label="来源">
          <Select v-model:value="formState.sourceId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetSourceOptions" :key="item.id" :value="item.id">{{ item.name }} </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="资产类别">
          <Select v-model:value="formState.typeId" placeholder="请选择" style="width: 180px">
            <SelectOption v-for="item in assetTypeOptions" :key="item.id" :value="item.id">{{ item.name }} </SelectOption>
          </Select>
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="资产编码、资产名称" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="queryForm">查询</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="reset"> 重置 </Button>
        </FormItem>
      </Form>
    </template>
    <template #content-table>
      <AliasTable
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        size="small"
        bordered
        :loading="loading"
        row-key="id"
        :applicationCode="applicationCode"
        tableCode="ASSET_INVENTORY"
        :scrollX="tableScroll.x"
        :scrollY="tableScroll.y"
        :row-selection="{ onSelect: onSelect, onSelectAll: onSelectAll, onChange: onChange, selectedRowKeys: selectedRowKeysState }"
      />
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="pagination.pageNumber"
        v-model:pageSize="pagination.pageSize"
        show-size-changer
        :total="pagination.total"
        :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
    <GModalForm
      v-model="modalVisible"
      :form-source="formSource"
      :form-state="modalFormState"
      :rule="modalFormRules"
      title="编辑资产编码"
      :submit-loading="submitLoading"
      label-width="110px"
      @ok="handleOk"
    />
    <GModalForm
      v-model="modalFinanceVisible"
      :form-source="formSourceFinance"
      :form-state="modalFormFinanceState"
      :rule="modalFormFinanceRules"
      title="编辑财务编码"
      :submit-loading="submitLoading"
      label-width="110px"
      @ok="handleOk"
    />
  </GLayout>
</template>
<script lang="ts" setup>
import { Button, Popconfirm, type TableColumnType, Pagination, Popover, message } from "ant-design-vue";
import { Input } from "ant-design-vue/es";
import type { Rule } from "ant-design-vue/es/form";
import dayjs from "dayjs";
import { h, onMounted, reactive, ref } from "vue";

import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  detailedDel,
  detailedUpdateCode,
  getAssemblyClassifyPage,
  getPropertyDetailedPage,
  type DetailedDetail,
  type OSSFile,
  detailedTplDownload,
  QRcodeDownload,
  detailedExcelOut,
  detailedExcelIn,
} from "@/api/asset-management/asset-management";
import { deptList } from "@/api/ouaa/ouaa";
import { cubeAssetManagementService } from "@/api/service";
import GLayout from "@/components/common/g-layout.vue";
import { historyPush } from "@/utils/historyPush";
import { assetStatus } from "@/views/enum";

interface FormState {
  receiveDepId: string | undefined;
  keyword: string;
  status: string | undefined;
  startTime: string;
  purchaseDate: string;
  sourceId: string | undefined;
  typeId: string | undefined;
  areaId: string | undefined;
}
const { pageTitle } = usePageName();
const formState = reactive<FormState>({
  receiveDepId: undefined,
  keyword: "",
  status: undefined,
  startTime: "",
  purchaseDate: "",
  sourceId: undefined,
  typeId: undefined,
  areaId: undefined,
});
const applicationCode = __ENV__.applicationCode;
const submitLoading = ref(false);
const nowEditRow = ref();
const codeLoading = ref(false);
//资产编码
const modalVisible = ref(false);
const modalFormState = ref({
  serialNumber: "",
});
const formSource = ref<{ value: string | number; label: string; component: unknown; props?: unknown }[]>([
  {
    label: "资产编码",
    value: "serialNumber",
    component: Input,
    props: {
      placeholder: "请输入资产编码",
      maxLength: 200,
    },
  },
]);
const modalFormRules: Record<string, Rule[]> = {
  serialNumber: [{ required: true, message: "请输入资产编码", trigger: "blur" }],
};
const handleEdit = (record: { serialNumber: string }) => {
  modalFormState.value = {
    serialNumber: record.serialNumber,
  };
  nowEditRow.value = record;
  modalVisible.value = true;
};

// 财务编码
const modalFinanceVisible = ref(false);
const modalFormFinanceState = ref({
  financeNumber: "",
});
const formSourceFinance = ref<{ value: string | number; label: string; component: unknown; props?: unknown }[]>([
  {
    label: "财务编码",
    value: "financeNumber",
    component: Input,
    props: {
      placeholder: "请输入财务编码",
      maxLength: 200,
    },
  },
]);
const modalFormFinanceRules: Record<string, Rule[]> = {
  financeNumber: [{ required: true, message: "请输入财务编码", trigger: "blur" }],
};
const handleEditFinance = (record: { financeNumber: string }) => {
  modalFormFinanceState.value = {
    financeNumber: record.financeNumber,
  };
  nowEditRow.value = record;
  modalFinanceVisible.value = true;
};

const selectedRowKeysState = ref<Key[]>([]);
type Key = string | number;
const selectedList = ref<any[]>([]);
const onChange = (selectedRowKeys: Key[], _selectedRows: any) => {
  selectedRowKeysState.value = selectedRowKeys;
};
const onSelect = (record: any, selected: any) => {
  if (selected) {
    selectedList.value.push(record);
  } else {
    const delIndex = selectedList.value.findIndex((val) => {
      return val.id === record.id;
    });
    selectedList.value.splice(delIndex, 1);
  }
};
const onSelectAll = (selected: any, _selectionRows: any, changeRows: any[]) => {
  if (selected) {
    selectedList.value = selectedList.value.concat(changeRows);
  }
  if (!selected) {
    let selectionRows = JSON.parse(JSON.stringify(selectedList.value));
    const delIndex: any[] = [];
    selectionRows.forEach((item: any, index: number) => {
      changeRows.forEach((val: { id: any }) => {
        if (item.id === val.id) {
          delIndex.push(index);
        }
      });
    });
    delIndex.forEach((item) => {
      delete selectionRows[item];
    });
    selectionRows = selectionRows.filter((item: any) => {
      return item !== undefined;
    });
    selectedList.value = selectionRows;
  }
};

const deptOptions = ref<{ id: string; name: string }[]>([]);
const assetSourceOptions = ref<{ id: string; name: string }[]>([]);
const assetTypeOptions = ref<{ id: string; name: string }[]>([]);

const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const queryCache = useListQueryCache({
  defaults: { ...formState, pageNumber: 1, pageSize: 10 },
  getState: () => ({ ...formState, pageNumber: pagination.value.pageNumber, pageSize: pagination.value.pageSize }),
  setState: (next) => {
    const { pageNumber, pageSize, ...rest } = next as Record<string, unknown>;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});
const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getPropertyDetailedPage(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
      //获取当前页的选中项
      const currentSelect = dataSource.value.filter((obj1: any) => selectedList.value.some((obj2) => obj2.id === obj1.id));
      selectedRowKeysState.value = currentSelect.map((x: any) => x.id);
    }
    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData().then(() => queryCache.sync());
};
const editRow = (record: { id: string }, action: "detail" | "edit") => {
  historyPush({ action, id: record.id }, "/inventoryDetail");
};
const delRow = async (record: { id: string; status: string }) => {
  if (!["WEED_OUT"].includes(record.status)) {
    message.error("仅有报废资产支持删除操作");
    return;
  }
  try {
    loading.value = true;
    await detailedDel({ id: record.id });
    if (dataSource.value.length === 1 && pagination.value.pageNumber > 1) {
      pagination.value.pageNumber--;
    }
    getTableData();
  } catch (error) {
    loading.value = false;
  } finally {
    loading.value = false;
  }
};
// 校验资产编码是否重复
const validateSerialNumber = async (newSerialNumber: string, originalSerialNumber: string, rowId: string): Promise<boolean> => {
  if (!newSerialNumber) {
    message.error("请输入资产编码");
    return false;
  }
  if (originalSerialNumber !== newSerialNumber) {
    const checkParams = { checkSerialNumberList: [{ key: rowId, value: newSerialNumber }] };
    try {
      const res = await cubeAssetManagementService.checkPropertyCode(checkParams);
      if (res && Array.isArray(res) && res.includes(newSerialNumber)) {
        message.error(`资产编码 ${newSerialNumber} 已存在，请重新输入`);
        return false;
      }
    } catch {
      message.error("校验资产编码时发生错误，请稍后重试");
      return false;
    }
  }
  return true;
};

const handleOk = async () => {
  try {
    submitLoading.value = true;
    let isSerialNumberValid = true;
    if (modalVisible.value) {
      isSerialNumberValid = await validateSerialNumber(
        modalFormState.value.serialNumber,
        nowEditRow.value.serialNumber,
        nowEditRow.value.id,
      );
      if (!isSerialNumberValid) {
        submitLoading.value = false;
        return;
      }
    }
    const params = {
      ...nowEditRow.value,
      serialNumber: modalFormState.value.serialNumber || nowEditRow.value.serialNumber,
      financeNumber: modalFormFinanceState.value.financeNumber || nowEditRow.value.financeNumber,
    } as DetailedDetail;
    params.imgs = (params.imgs as OSSFile[]).map((e) => {
      return e.id.toString();
    });
    params.file = (params.file as OSSFile[]).map((e) => {
      return e.id.toString();
    });
    await detailedUpdateCode(params);
    message.success("操作成功");
    modalVisible.value = false;
    modalFinanceVisible.value = false;
    submitLoading.value = false;
    modalFormState.value.serialNumber = "";
    modalFormFinanceState.value.financeNumber = "";
    getTableData();
  } catch (error) {
    submitLoading.value = false;
  }
};
const columns: TableColumnType[] = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "资产编码",
    dataIndex: "serialNumber",
    width: 120,
    ellipsis: true,
    customRender: ({ text, record }) => {
      return [
        h(
          Popover,
          { content: text },
          {
            default: () => h(Button, { type: "link", onClick: () => handleEdit(record) }, { default: () => (text as string) || "--" }),
          },
        ),
      ];
    },
  },
  {
    title: "财务编码",
    dataIndex: "financeNumber",
    width: 250,
    ellipsis: true,
    customRender: ({ text, record }) => {
      return [
        h(
          Popover,
          { content: text },
          {
            default: () =>
              h(Button, { type: "link", onClick: () => handleEditFinance(record) }, { default: () => (text as string) || "--" }),
          },
        ),
      ];
    },
  },
  {
    title: "模型编码",
    dataIndex: "deviceNumber",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产名称",
    dataIndex: "name",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "资产类别",
    dataIndex: "typeName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "norms",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "计量单位",
    dataIndex: "unit",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "原值",
    dataIndex: "price",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "来源",
    dataIndex: "sourceName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "购入日期",
    dataIndex: "purchaseDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "入库日期",
    dataIndex: "startTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "维保到期时间",
    dataIndex: "maintenanceDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "剩余维保时间（月）",
    dataIndex: "maintenanceTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text ? text + "月" : "--") })];
    },
  },
  {
    title: "资产逾龄时间",
    dataIndex: "usageDate",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "剩余使用期限",
    dataIndex: "usageTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text ? text + "月" : "--") })];
    },
  },
  {
    title: "资产状态",
    dataIndex: "statusName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) ?? "--" })];
    },
  },
  {
    title: "管理员",
    dataIndex: "adminName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "区域",
    dataIndex: "area",
    width: 120,
    ellipsis: true,
    customRender: ({ text }: { text: { name: string }[] }) => {
      const areaName = text.map((e) => e.name).join("/") || "--";
      return [h(Popover, { content: areaName }, { default: () => areaName })];
    },
  },
  {
    title: "使用部门",
    dataIndex: "receiveDepName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "维护部门",
    dataIndex: "maintenanceDepName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建人",
    dataIndex: "createByName",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    width: 120,
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    width: 200,
    customRender: ({ record }) => {
      return [
        h(Button, { type: "link", size: "small", onClick: () => editRow(record, "detail") }, { default: () => "详情" }),
        h(Button, { type: "link", size: "small", onClick: () => editRow(record, "edit") }, { default: () => "编辑" }),
        h(
          Popconfirm,
          {
            title: "确定要删除该项？",
            danger: true,
            onConfirm: () => {
              delRow(record);
            },
          },
          {
            default: () => h(Button, { type: "link", size: "small", danger: true }, { default: () => "删除" }),
          },
        ),
      ];
    },
  },
];

const queryForm = async () => {
  pagination.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};
const reset = async () => {
  await queryCache.reset();
  await getTableData();
};
onMounted(async () => {
  deptList().then((res) => {
    if (res.data) {
      deptOptions.value = res.data as { id: string; name: string }[];
    }
  });

  // 资产来源
  getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: "assetSource" }).then((res) => {
    if (res.data) {
      assetSourceOptions.value = res.data.records as { id: string; name: string }[];
    }
  });
  // 资产分类
  getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: "assetType" }).then((res) => {
    if (res.data) {
      assetTypeOptions.value = res.data.records as { id: string; name: string }[];
    }
  });
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});
const downloadTplLoading = ref(false);
const exportInLoading = ref(false);
const exportOutLoading = ref(false);

/** 下载模板 */
const downLoadTpl = async (): Promise<void> => {
  try {
    downloadTplLoading.value = true;
    await detailedTplDownload()
      .then((res) => {
        const { data } = res;
        const link = document.createElement("a");
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "资产清单(模板).xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((res: unknown) => {
        message.warn("未查询到数据");
      });
  } catch (error) {
  } finally {
    setTimeout(() => {
      downloadTplLoading.value = false;
    }, 1000);
  }
};
//获取二维码列表
const getQrcodeList = () => {
  const entityInfo = selectedList.value.map((x: any) => {
    return { entityId: x.id, entityName: x.name, serialNumber: x.serialNumber };
  });
  codeLoading.value = true;
  QRcodeDownload({ entityType: "PROPERTY", styleId: "1727209257265602562", entityInfo: entityInfo })
    .then(async (res) => {
      const data = (res as { data?: Blob } | Blob)?.data ?? res;
      if (data) {
        saveQrcodeZip(data);
      }
      codeLoading.value = false;
    })
    .catch((res: unknown) => {
      codeLoading.value = false;
    });
};
const saveQrcodeZip = (data: unknown): void => {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: "application/zip" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = "二维码.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
//下载二维码
const downLoadQRcode = async (): Promise<void> => {
  if (selectedRowKeysState.value.length === 0) {
    message.warn("请选择要下载的二维码");
    return;
  }
  //生成二维码
  getQrcodeList();
};
/** 导出 */
const exportOut = async (): Promise<void> => {
  try {
    exportOutLoading.value = true;
    await detailedExcelOut({ ...formState })
      .then((res) => {
        const { data } = res;
        const link = document.createElement("a");
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "资产清单.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((res: unknown) => {
        message.warn("未查询到数据");
      });
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportOutLoading.value = false;
    }, 1000);
  }
};

/** 导入 */
const beforeUpload = async (file: File) => {
  try {
    exportInLoading.value = true;
    const formData = new FormData();
    formData.append("file", file);
    await detailedExcelIn(formData);
    message.success("导入成功");
    reset();
  } catch (error) {
  } finally {
    setTimeout(() => {
      exportInLoading.value = false;
    }, 1000);
  }
  return false;
};
</script>
<style scoped lang="less">
.header-btn {
  display: flex;

  :deep(.asset-management-upload-list) {
    display: none;
  }
}

.editable-cell-text-wrapper {
  cursor: pointer;
}

.asset-management-form {
  .asset-management-form-item:first-child {
    margin-bottom: 10px;
  }
}

.down-load {
  opacity: 0;
}
</style>
