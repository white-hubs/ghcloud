<template>
  <GLayout ref="table_layout_ref" :title="pageTitle" showfooter>
    <template #header-btn>
      <Button v-if="hasPermission(permission.download)" type="primary" @click="templateDownload" style="margin-right: 10px"
        >模版下载</Button
      >
      <Upload :customRequest="batchUpload" :showUploadList="false" accept=".xlsx,.xls">
        <Button type="primary" v-if="hasPermission(permission.upload)" style="margin-right: 10px">批量导入</Button>
      </Upload>
    </template>
    <template #content-search>
      <Form layout="inline" :model="formState">
        <FormItem label="仓库">
          <Select v-model:value="formState.storeId" :placeholder="'请选择'" style="width: 180px">
            <SelectOption v-for="item in storeHouseOptions" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="耗材分类">
          <TreeSelect v-model:value="formState.categoryId" :tree-data="treeData" placeholder="请选择" style="width: 180px" />
        </FormItem>
        <FormItem>
          <Input v-model:value="formState.keyword" placeholder="耗材编码、耗材名称" />
        </FormItem>
        <FormItem>
          <Button type="primary" @click="queryForm">查询</Button>
        </FormItem>
        <FormItem>
          <Button @click="reset"> 重置 </Button>
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
        :loading="loading"
        :applicationCode="applicationCode"
        tableCode="JUST_IN_TIME"
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
</template>
<script lang="ts" setup>
import { Image, message, Popover, type TableColumnType, type TreeProps, type TreeSelectProps } from "ant-design-vue";
import type { DefaultOptionType } from "ant-design-vue/es/vc-tree-select/TreeSelect";
import type { UploadRequestOption } from "ant-design-vue/lib/vc-upload/interface";
import { h, onMounted, reactive, ref } from "vue";

import { hasPermission } from "@ghcloud/cube-permission-codes";
import { useListQueryCache, usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import {
  consumableImport,
  consumableStockImport,
  getConsumableCategoryTree,
  getConsumableStoreStock,
  getDownloadExcelStockTemplate,
  getDownloadExcelTemplate,
  getStorehousePage,
  type OSSFile,
} from "@/api/asset-management/asset-management";
import GLayout from "@/components/common/g-layout.vue";
import { appFunctionCodes } from "@/permission/index";
import { translateAmount } from "@/utils/tool";
const { pageTitle } = usePageName();
const formState = reactive<{
  storeId: string | undefined;
  categoryId: string | undefined;
  keyword: string;
}>({
  storeId: undefined,
  categoryId: undefined,
  keyword: "",
});
const applicationCode = __ENV__.applicationCode;
const permission = appFunctionCodes.consumables;
const columns: TableColumnType[] = [
  {
    title: "序号",
    width: 70,
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
    fixed: "left",
  },
  {
    title: "图片",
    dataIndex: "files",
    fixed: "left",
    align: "center",
    ellipsis: true,
    customRender: ({ text }: { text: OSSFile[] }) => {
      const file: OSSFile[] = text || [];
      if (file.length === 0) {
        return "暂无图片";
      }
      return h(Image, { src: file[0].path, style: { maxHeight: "50px", maxWidth: "50px" } });
    },
  },
  {
    title: "所在仓库",
    dataIndex: "storeName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材名称",
    dataIndex: "name",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "耗材编码",
    dataIndex: "code",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "分类名称",
    dataIndex: "categoryName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "规格型号",
    dataIndex: "model",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "品牌",
    dataIndex: "brand",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "商品条码",
    dataIndex: "goodsCode",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "单位",
    dataIndex: "unit",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "单价（加权平均）",
    dataIndex: "avgPrice",
    ellipsis: true,
    customRender: ({ text }) => {
      text = translateAmount(text);
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
    width: 140,
  },
  {
    title: "实际库存",
    dataIndex: "storeNum",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) ?? "--" })];
    },
  },
  {
    title: "库存金额",
    dataIndex: "storeAmount",
    ellipsis: true,
    customRender: ({ text }) => {
      const money = translateAmount(text);
      return [h(Popover, { content: money }, { default: () => money })];
    },
  },
  {
    title: "库存上限",
    dataIndex: "stockMax",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "库存下限",
    dataIndex: "stockMin",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
];
const storeHouseOptions = ref<{ id: string; name: string }[]>([]);
const treeData = ref<DefaultOptionType[]>([]);
const loading = ref(false);
const dataSource = ref<unknown[]>([]);
const pagination = ref({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const queryCache = useListQueryCache({
  defaults: {
    ...formState,
    pageNumber: 1,
    pageSize: 10,
  },
  getState: () => ({
    ...formState,
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
  }),
  setState: (next) => {
    const { pageNumber, pageSize, ...rest } = next;
    Object.assign(formState, rest);
    pagination.value.pageNumber = Number(pageNumber ?? 1);
    pagination.value.pageSize = Number(pageSize ?? 10);
  },
});

const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    ...formState,
  };
  loading.value = true;
  try {
    const res = await getConsumableStoreStock(params);
    if (res.data) {
      const { records, total } = res.data;
      dataSource.value.length = 0;
      dataSource.value = records;
      pagination.value.total = total;
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
const queryForm = async () => {
  pagination.value.pageNumber = 1;
  await getTableData();
  await queryCache.sync();
};
const reset = async () => {
  formState.storeId = undefined;
  formState.categoryId = undefined;
  formState.keyword = "";
  await queryCache.reset();
  await getTableData();
};
const tableScroll = ref({ x: 1000, y: document.querySelector(".content-table")?.clientHeight ?? 435 });

onMounted(async () => {
  // 仓库查询
  getStorehousePage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res.data) {
      storeHouseOptions.value = res.data.records as { id: string; name: string }[];
    }
  });

  // 耗材分类
  getConsumableCategoryTree({}).then((res) => {
    const getTreeSelectoptions = (tree: TreeProps["treeData"] = []): TreeSelectProps["treeData"] => {
      return tree.map((e) => {
        return {
          title: e.name,
          value: e.id,
          children: e.children?.length ? getTreeSelectoptions(e.children)! : [],
        };
      });
    };
    if (res.data) {
      treeData.value = getTreeSelectoptions(res.data as TreeProps["treeData"]) as DefaultOptionType[];
    }
  });

  await queryCache.hydrateAndQuery(getTableData);
  tableScroll.value.y = document.querySelector(".content-table")!.clientHeight - 39;
});

//模版下载
const templateDownload = async () => {
  try {
    message.loading("开始下载");
    await getDownloadExcelStockTemplate()
      .then((res) => {
        const { data } = res;
        const link = document.createElement("a");
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "耗材入库导入模版.xlsx");
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
/** 批量上传 需要特性开关 */
const batchUpload = (fileObj: UploadRequestOption<any>) => {
  const formData = new FormData();
  formData.append("file", fileObj.file);
  loading.value = true;
  consumableStockImport(formData)
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
<style scoped>
.editable-cell-text-wrapper {
  cursor: pointer;
}
</style>
