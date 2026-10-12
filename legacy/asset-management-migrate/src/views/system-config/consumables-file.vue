<template>
  <Spin :spinning="loading" wrapper-class-name="full-screen-loading">
    <GLayout :title="pageTitle">
      <template #header-btn>
        <Button type="primary" @click="templateDownload" style="margin-right: 10px">模版下载</Button>
        <Upload :customRequest="batchUpload" :showUploadList="false" accept=".xlsx,.xls" v-if="showBatch">
          <Button type="primary" style="margin-right: 10px">批量导入</Button>
        </Upload>
        <Button type="primary" @click="addStuff">新增</Button>
      </template>
      <template #content-left>
        <ConsumableCategoryTree v-model:selected-keys="categorySelect" />
      </template>
      <template #content-search>
        <Form layout="inline" :model="formState">
          <FormItem>
            <Input v-model:value="formState.name" placeholder="耗材名称、编码" />
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
          :scroll="tableScroll"
          size="small"
          bordered
          :applicationCode="applicationCode"
          tableCode="CONSUMABLES_FILE"
          :scrollX="tableScroll.x"
          :scrollY="tableScroll.y"
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
    </GLayout>
    <GModalForm
      v-model="modalVisible"
      :form-source="formSource!"
      :form-state="modalFormState!"
      :rule="modalFormRules!"
      :title="modalTitle"
      :submit-loading="modalLoading"
      label-width="120px"
      @ok="handleOk"
    />
  </Spin>
</template>

<script lang="ts" setup>
import { message, type TableColumnsType, Input, Popover, Button, Popconfirm, InputNumber } from "ant-design-vue";
import { TreeSelect } from "ant-design-vue/es";
import type { UploadRequestOption } from "ant-design-vue/es/vc-upload/interface";
import type { RuleObject } from "ant-design-vue/lib/form";
import { h, onMounted, reactive, ref, watch } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import ConsumableCategoryTree from "./component/consumable-category-tree.vue";
import {
  type Consumable,
  consumableInsert,
  getConsumablePagePermission,
  consumableDel,
  consumableUpdate,
  type OSSFile,
  getConsumableCategoryTree,
  consumableImport,
  getDownloadExcelTemplate,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import GModalForm from "@/components/common/g-modal-form.vue";
const { pageTitle } = usePageName();
const showBatch = !!!((window as any).feature && (window as any).feature.showAssetConsumablesBatchUpload);
const modalVisible = ref(false);
const modalTitle = ref("");
const modalAction = ref<"ADD" | "EDIT">("ADD");
const modalLoading = ref(false);
const applicationCode = __ENV__.applicationCode;

const modalFormState = ref<Record<string, string | number | [] | string[] | undefined>>({});
const formSource = ref<
  {
    value: string | number;
    label: string;
    component: unknown;
    props?: unknown;
  }[]
>();
const modalFormRules = ref<Record<string, RuleObject[]>>();
const initStuffFormSource = ref([
  {
    label: "耗材分类",
    value: "categoryId",
    component: TreeSelect,
    props: {
      placeholder: "请选择耗材分类",
      treeData: [],
      fieldNames: { children: "children", label: "name", value: "id" },
    },
  },
  {
    label: "耗材名称",
    value: "name",
    component: Input,
    props: {
      placeholder: "请输入耗材名称",
      maxLength: 20,
    },
  },
  {
    label: "耗材编码",
    value: "code",
    component: Input,
    props: {
      placeholder: "请输入耗材编码",
      maxLength: 20,
    },
  },
  {
    label: "品牌",
    value: "brand",
    component: Input,
    props: {
      placeholder: "请输入品牌",
      maxLength: 20,
    },
  },
  {
    label: "规格型号",
    value: "model",
    component: Input,
    props: {
      placeholder: "请输入规格型号",
      maxLength: 20,
    },
  },
  {
    label: "商品码",
    value: "goodsCode",
    component: Input,
    props: {
      placeholder: "请输入商品码",
      maxLength: 20,
    },
  },
  {
    label: "单位",
    value: "unit",
    component: Input,
    props: {
      placeholder: "请输入单位",
      maxLength: 20,
    },
  },
  {
    label: "质保期限(月)",
    value: "qualityPeriod",
    component: InputNumber,
    props: {
      placeholder: "请输入",
      maxLength: 20,
    },
  },
  {
    label: "库存上限",
    value: "stockMax",
    component: InputNumber,
    props: {
      placeholder: "请输入库存上限",
      maxLength: 20,
    },
  },
  {
    label: "库存下限",
    value: "stockMin",
    component: InputNumber,
    props: {
      placeholder: "请输入库存下限",
      maxLength: 20,
    },
  },
  {
    label: "限领数量(人/月)",
    value: "useLimit",
    component: InputNumber,
    props: {
      placeholder: "请输入限领数量",
      maxLength: 20,
    },
  },
  {
    label: "附件",
    value: "file",
    component: FileUpload,
    props: {
      valueFormat: "stringArr",
      sceneCode: GLOBAL_SCENE_CODE.propertyManagementConsumable,
      maxCount: 5,
      multiple: true,
      customText: " ",
    },
  },
]);
const initStuffFormRule = {
  code: [{ required: true, message: "请输入耗材编码", trigger: "blur" } as RuleObject],
  name: [{ required: true, message: "请输入耗材名称", trigger: "blur" } as RuleObject],
  unit: [{ required: true, message: "请输入单位", trigger: "blur" } as RuleObject],
  categoryId: [{ required: true, message: "请选择耗材分类", trigger: "change" } as RuleObject],
};

const loading = ref(false);
const formState = reactive({ name: "" });
const categorySelect = ref<string[]>([]);
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
    const { pageNumber, pageSize, ...rest } = next;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});

const getTableData = async () => {
  try {
    loading.value = true;
    const params = {
      pageSize: pagination.value.pageSize,
      pageNumber: pagination.value.pageNumber,
      categoryId: categorySelect.value[0],
      keyword: formState.name || undefined,
    };
    const res = await getConsumablePagePermission(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value = records;
      pagination.value.total = total;
    }
  } catch (error) {
    loading.value = false;
  } finally {
    loading.value = false;
  }
};

/** 获取当前耗材分类数 */
const getTreeData = async () => {
  const res = await getConsumableCategoryTree({});
  initStuffFormSource.value[0].props.treeData = res.data as never;
};
//模版下载
const templateDownload = async () => {
  try {
    message.loading("开始下载");
    await getDownloadExcelTemplate()
      .then((res) => {
        const { data } = res;
        const link = document.createElement("a");
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "耗材导入模版.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("下载成功");
      })
      .catch((res: unknown) => {
        message.warn("未查询到数据");
        message.destroy();
      });
  } catch (error) {
    message.destroy();
  }
};
/** 添加 编辑 删除 */
const addStuff = () => {
  getTreeData();
  formSource.value = initStuffFormSource.value;
  modalFormState.value = initStuffFormSource.value.reduce((prv: Record<string, string | number | [] | undefined>, cur) => {
    if (cur.value === "file") {
      prv[cur.value] = [];
    } else if (cur.value === "categoryId") {
      prv[cur.value] = undefined;
    } else {
      prv[cur.value] = "";
    }
    return prv;
  }, {});
  modalFormRules.value = initStuffFormRule;
  modalAction.value = "ADD";
  modalTitle.value = "添加耗材";
  modalVisible.value = true;
};
// 判断图片格式是否为常见图片格式
const isImageFormat = (file: OSSFile) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const fileExtension = file.path.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(fileExtension || "");
};
const editRow = (record: Record<string, string | number>) => {
  getTreeData();
  formSource.value = initStuffFormSource.value;
  modalFormState.value = record;
  modalFormRules.value = initStuffFormRule;
  modalAction.value = "EDIT";
  modalTitle.value = "编辑耗材";
  modalVisible.value = true;
};
const delRow = async (record: { id: string }) => {
  try {
    loading.value = true;
    await consumableDel({ id: record.id });
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

const columns: TableColumnsType = [
  {
    title: "序号",
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "图片",
    dataIndex: "file",
    ellipsis: true,
    key: "file",
    align: "center",
    customRender: ({ text }: { text: OSSFile[] }) => {
      const files: OSSFile[] = text || [];
      if (files.length === 0 || !files.some(isImageFormat)) {
        return "暂无图片";
      }
      // 获取第一张图片
      const firstImage = files.find(isImageFormat);
      return h("img", { src: firstImage?.path, style: { maxHeight: "22px", maxWidth: "22px" } });
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    ellipsis: true,
    key: "name",
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    ellipsis: true,
    key: "code",
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "model",
    key: "model",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "品牌",
    dataIndex: "brand",
    key: "brand",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材分类",
    dataIndex: "categoryName",
    ellipsis: true,
    key: "categoryName",
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => text || "--" })];
    },
  },
  {
    title: "单位",
    dataIndex: "unit",
    ellipsis: true,
    key: "unit",
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text }, { default: () => text || "--" })];
    },
  },
  {
    title: "质保期限",
    dataIndex: "qualityPeriod",
    ellipsis: true,
    key: "qualityPeriod",
    customRender: ({ text }: { text: string }) => {
      return [h(Popover, { content: text + "月" }, { default: () => text + "月" || "--" })];
    },
  },
  {
    title: "安全上限",
    dataIndex: "stockMax",
    ellipsis: true,
    key: "stockMax",
    customRender: ({ text, record }: { text: string; record: { unit: string } }) => {
      const res = text !== null ? text + record.unit : "--";
      return [h(Popover, { content: res }, { default: () => res })];
    },
  },
  {
    title: "安全下限",
    dataIndex: "stockMin",
    ellipsis: true,
    key: "stockMin",
    customRender: ({ text, record }: { text: string; record: { unit: string } }) => {
      const res = text !== null ? text + record.unit : "--";
      return [h(Popover, { content: res }, { default: () => res })];
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    ellipsis: true,
    key: "action",
    width: 120,
    customRender: ({ record }) => {
      return [
        h(Button, { type: "link", size: "small", onClick: () => editRow(record) }, { default: () => "编辑" }),
        h(
          Popconfirm,
          {
            title: "档案删除后会将系统内该耗材相关的内容全部清理，确认是否删除",
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
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData().then(() => queryCache.sync());
};

watch(
  () => categorySelect.value,
  () => {
    getTableData();
  },
  { deep: true },
);

// 弹窗确认事件
const handleOk = async () => {
  try {
    modalLoading.value = true;
    const params = {
      ...modalFormState.value,
    };
    if (params.file && Array.isArray(params.file)) {
      params.file = params.file.map((item) => {
        return (item as unknown as OSSFile).id;
      });
    }
    if (modalAction.value === "ADD") {
      await consumableInsert(params as unknown as Consumable);
    } else {
      await consumableUpdate(params as unknown as Consumable & { id: string });
    }
    message.success("操作成功");
    modalVisible.value = false;
    getTableData();
  } catch (error) {
    modalLoading.value = false;
    const errorData = (error as { data: unknown }).data as { code: number; data: { name: string } };
    if (errorData.code === 412) {
      message.destroy();
      message.error(errorData.data.name);
    }
  } finally {
    modalLoading.value = false;
  }
};

const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

/** 批量上传 需要特性开关 */
const batchUpload = (fileObj: UploadRequestOption<any>) => {
  const formData = new FormData();
  formData.append("file", fileObj.file);
  loading.value = true;
  consumableImport(formData)
    .finally(() => {
      reset();
    })
    .then((data: any) => {
      if (data.code == 200) {
        message.success("导入成功");
      }
    });
};
</script>

<style lang="less">
.full-screen-loading {
  height: 100%;
  .asset-management-spin-container {
    height: 100% !important;
  }
}
</style>
