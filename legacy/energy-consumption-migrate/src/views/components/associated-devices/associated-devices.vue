<template>
  <GLayout showFooter title="关联设备" content-table-scrollable>
    <template #content-table>
      <div>
        <span>{{ route.query.page === "sub-item" ? "分项名称：" : "区域名称：" }}</span
        >{{ route.query.name ?? "--" }}
      </div>
      <div>
        <Button type="primary" @click="addDevice" style="margin: 10px 0px">添加</Button>
      </div>
      <Table :columns="deviceColumns" :data-source="dataSource" :rowKey="'code'" :pagination="false">
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.dataIndex === 'shareNum'">
            <InputNumber v-model:value="record.shareNum" />
          </template>
          <template v-if="column.dataIndex === 'action'">
            <Popconfirm title="你确定删除当前数据?" ok-text="确定" cancel-text="取消" @confirm="deletedata(record)">
              <a class="ml-10px color-red">移除</a>
            </Popconfirm>
          </template>
        </template>
      </Table>
      <Pagination
        style="float: right; margin-top: 20px"
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        show-size-changer
        :total="pagination.total"
        :show-total="(total: any) => `共 ${total} 条 第${pagination.current}/${pagination.pages}页`"
        @change="pageChange"
      ></Pagination>
    </template>
    <template #footer-page>
      <Button @click="goBack" class="mr-15px">返回</Button>
      <Button type="primary" @click="submit" :loading="loading"> 保存 </Button>
    </template>
  </GLayout>
  <!-- 关联设备 -->
  <association-modal v-if="associatedModel.visible" :visible="associatedModel.visible" @close="closeModal"> </association-modal>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue/es";
import { Popconfirm } from "ant-design-vue/es";
import { onMounted, reactive, ref } from "vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

import associationModal from "./association-modal.vue";
import { DeviceList, SubItemReferDevice, AreaReferDevice, AreaReferDeviceById, SubItemReferDeviceById } from "@/api/energyOverview";
import GLayout from "@/components/common/gLayout.vue";

const route = useRoute();
const dataSource = ref();
onMounted(async () => {
  if (route.query.page === "area") {
    const { data } = await AreaReferDeviceById(route.query.id as string);
    totalDevice.value = data;
    dataSource.value = totalDevice.value.slice(0, pagination.pageSize);
    pagination.total = totalDevice.value.length;
    pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
    Object.assign(model, data);
  }
  if (route.query.page === "sub-item") {
    const { data } = await SubItemReferDeviceById(route.query.id as string);
    totalDevice.value = data;
    dataSource.value = totalDevice.value.slice(0, pagination.pageSize);
    pagination.total = totalDevice.value.length;
    pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
    Object.assign(model, data);
  }
});
const deviceColumns: any = computed(() => {
  const list = [
    {
      title: "设备编号",
      dataIndex: "code",
      ellipsis: true,
      customRender: ({ text }: { text: string }) => {
        return text;
      },
    },
    {
      title: "当前关联设备名称",
      dataIndex: "deviceName",
      ellipsis: true,
      customRender: ({ text }: { text: string }) => {
        return text;
      },
    },
    {
      title: "设备所在区域",
      dataIndex: "deviceArea",
      ellipsis: true,
      customRender: ({ text }: { text: string }) => {
        return text || "--";
      },
    },
    {
      title: "分摊比例",
      dataIndex: "shareNum",
      ellipsis: true,
    },
    {
      title: "操作",
      dataIndex: "action",
      ellipsis: true,
      width: "140px",
    },
  ];
  return list;
});
const pagination = reactive({
  total: 0,
  position: "bottom",
  pages: 1,
  pageSize: 10,
  current: 1,
});
const pageChange = (current: number, pageSize: number) => {
  pagination.current = current;
  pagination.pageSize = pageSize;
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
  dataSource.value = totalDevice.value.slice(
    pagination.current * pagination.pageSize - pagination.pageSize,
    pagination.current * pagination.pageSize,
  );
};
//设备列表===============================================================================================================================
const loading = ref(false);
const deletedata = (record: { id: string }) => {
  totalDevice.value = totalDevice.value.filter((item: { id: string }) => item.id !== record.id);
  dataSource.value = totalDevice.value.slice(
    pagination.current * pagination.pageSize - pagination.pageSize,
    pagination.current * pagination.pageSize,
  );
  if (dataSource.value.length === 0 && pagination.current !== 1) {
    dataSource.value = totalDevice.value.slice(0, pagination.pageSize);
    pagination.current = 1;
  }
  pagination.total = totalDevice.value.length;
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
};
//保存关联设备
const submit = async () => {
  if (route.query.page === "sub-item") {
    loading.value = true;
    //能耗分项关联设备
    const list = totalDevice.value.map(
      (item: {
        projectId: string;
        deviceAreaId: string;
        deviceArea: string;
        shareNum: any;
        deviceId: string;
        deviceName: string;
        deviceType: string;
        code: string;
        parentId: string;
      }) => {
        return {
          bindType: "ITEM",
          projectId: item.projectId,
          shareNum: item.shareNum,
          deviceId: item.deviceId,
          deviceAreaId: item.deviceAreaId,
          deviceArea: item.deviceArea,
          deviceName: item.deviceName,
          deviceType: item.deviceType,
          code: item.code,
          parentId: item.parentId,
        };
      },
    );
    await SubItemReferDevice(route.query.id as string, list);
    loading.value = false;
    message.success("操作成功");
    goBack();
  } else if (route.query.page === "area") {
    //区域设置关联设备
    loading.value = true;
    const list = totalDevice.value.map(
      (item: {
        projectId: any;
        deviceAreaName: string;
        shareNum: any;
        deviceId: any;
        deviceName: any;
        deviceType: any;
        code: any;
        parentId: any;
      }) => {
        return {
          bindType: "AREA",
          projectId: item.projectId,
          shareNum: item.shareNum,
          deviceId: item.deviceId,
          deviceName: item.deviceName,
          deviceArea: item.deviceAreaName,
          deviceType: item.deviceType,
          code: item.code,
          parentId: item.parentId,
        };
      },
    );
    await AreaReferDevice(route.query.id as string, list);
    loading.value = false;
    message.success("操作成功");
    goBack();
  } else {
    goBack();
  }
};
const goBack = () => {
  history.back();
};

//关联设备弹窗===============================================================================================================================
const addDevice = async () => {
  associatedModel.visible = true;
};
const associatedModel = reactive({
  visible: false,
  search: [
    {
      component: "span",
      value: "applicationCode",
      defaultValue: "SECURITY_MONITORING",
    },
  ],
  columns: [
    {
      dataIndex: "codea",
      title: "编码",
    },
    {
      dataIndex: "name",
      title: "设备名称",
    },
    {
      dataIndex: "genreName",
      title: "产品分类",
      customRender: ({ record }: any) => {
        return record.productInfo.productCategory.name;
      },
    },
    {
      dataIndex: "deviceType",
      title: "设备型号",
      customRender: ({ record }) => {
        return record.productInfo.deviceType;
      },
    },
    {
      dataIndex: "brandName",
      title: "设备品牌",
      customRender: ({ record }) => {
        return record.productInfo.brandName;
      },
    },
    {
      dataIndex: "areaName",
      title: "所属区域",
    },
  ],
});
const model = reactive({
  id: "",
  projectName: "", //类型名称
  remark: "",
  parentId: route.query.parentId,
  instrumentType: route.query.activeKey,
});
const totalDevice = ref<any[]>([]);
const closeModal = async (data: any, selectAll: boolean, searchForm: any) => {
  associatedModel.visible = false;
  if (selectAll) {
    //添加所有
    const total = searchForm.total;
    let list: any[] = [];
    const pageNum = Math.ceil(total / 999);
    for (let i = 1; i <= pageNum; i++) {
      const obj = {
        pageNumber: i,
        pageSize: 999,
        keyword: searchForm.keyword,
        instrumentType: searchForm.instrumentType,
        deviceAreaId: searchForm.deviceAreaId || "",
      };
      const { data } = await DeviceList(obj);
      list.push(...data.records);
    }
    const ids = list.map((x: { code: string }) => x.code);
    const isExist = totalDevice.value.length > 0 ? totalDevice.value.some((x: { code: any }) => ids.some((i: any) => i === x.code)) : false;
    if (isExist) {
      message.error("设备已存在");
      return;
    }
    totalDevice.value = totalDevice.value.concat(list);
    pagination.total = totalDevice.value.length;
    pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
    dataSource.value = totalDevice.value.slice(0, pagination.pageSize);
    return;
  }
  if (data.length === 0) return;
  const ids = data.map((x: { code: any }) => x.code);
  const isExist = totalDevice.value.length > 0 ? totalDevice.value.some((x: { code: any }) => ids.some((i: any) => i === x.code)) : false;
  if (isExist) {
    message.error("设备已存在");
    return;
  }
  totalDevice.value = totalDevice.value.length > 0 ? totalDevice.value.concat(data) : data;
  dataSource.value = totalDevice.value.slice(0, pagination.pageSize);
  pagination.total = totalDevice.value.length;
  pagination.pages = Math.ceil(pagination.total / pagination.pageSize);
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
</style>
(: { code: any; })(: any)(: { code: any; })(: any)(: { code: any; })(: any)(: { code: any; })(: any)
