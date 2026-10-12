<template>
  <div ref="deviceListRef" class="device-list">
    <div class="header">
      <Form layout="inline" :model="queryState.state">
        <FormItem label="仪表类型">
          <Select
            placeholder="请选择仪表类型"
            style="width: 180px"
            v-model:value="queryState.state.instrumentType"
            allowClear
            :options="meterTypeList"
            :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          ></Select>
        </FormItem>
        <FormItem label="所属区域">
          <Cascader
            v-model:value="queryState.state.deviceAreaId"
            :options="areaDataList"
            :fieldNames="{ label: 'areaName', value: 'id' }"
            change-on-select
            placeholder="请选择区域"
          />
        </FormItem>
        <FormItem>
          <Input placeholder="输入设备名称或编号搜索" v-model:value="queryState.state.keyword"></Input>
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            @click="
              () => {
                queryState.resetPage();
                queryState.writeCache();
                getDeviceList();
              }
            "
            >查询</Button
          >
          <Button style="margin-left: 10px" @click="reset">重置</Button>
        </FormItem>
      </Form>
      <div>
        <Button type="primary" style="margin-left: 10px" :loading="batchUpdateReadingLoading" @click="batchUpdateReading"
          >批量更新读数</Button
        >
        <Button
          type="primary"
          style="margin-left: 10px"
          @click="
            () => {
              associatedVisible = true;
              formRef?.resetFields();
            }
          "
          >关联设备</Button
        >
      </div>
    </div>

    <Table
      class="device-list-table"
      :data-source="tableList"
      :columns="deviceColumns"
      :pagination="false"
      size="small"
      :scroll="{ y: scrollY }"
      :rowKey="(record) => record"
      :row-selection="{ selectedRowKeys: selectedRowKeysData, onChange: onSelectChange }"
      :loading="deviceLoading"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'action'">
          <Button type="link" @click="checkDetail(record)" :data-text="text">详情</Button>
          <PopConfirm title="你确定删除当前数据?" ok-text="确定" cancel-text="取消" @confirm="deleteData(record)">
            <Button type="link" danger>移除</Button>
          </PopConfirm>
          <Button type="link" @click="updateReading(record.id)" :data-text="text">更新读数</Button>
          <Button type="link" @click="openChangeDeviceModel(record.deviceId)" :data-text="text">更换设备</Button>
          <Button type="link" @click="openParentDeviceModel(record)" :data-text="text">配置上级</Button>
        </template>
      </template>
    </Table>
    <div ref="footerRef" class="footer">
      <div>
        <span class="mr-10px">已选{{ listLength.length }}项</span>
        <PopConfirm title="你确定删除当前数据?" ok-text="确定" cancel-text="取消" @confirm="batchDeleteData" v-if="listLength.length > 0">
          <Button type="primary" danger :disabled="listLength.length == 0">批量删除</Button>
        </PopConfirm>
      </div>
      <Pagination
        v-model:current="queryState.state.pageNumber"
        v-model:pageSize="queryState.state.pageSize"
        show-size-changer
        :total="queryState.state.total"
        :show-total="(total: any) => `共 ${total} 条 第${queryState.state.pageNumber}/${queryState.state.pages}页`"
        @change="tableChange"
      />
    </div>
    <!-- 关联设备 -->
    <Modal
      v-model:visible="associatedVisible"
      :confirm-loading="associatedLoading"
      @ok="submitAssociated"
      @cancel="cancelAssociated"
      title="关联设备"
    >
      <Form ref="formRef" :model="deviceForm" :rules="deviceRules">
        <FormItem label="仪表类型" name="instrumentType">
          <Select
            v-model:value="deviceForm.instrumentType"
            placeholder="请输入"
            change-on-select
            :options="instrumentTypeOptions"
            allowClear
            :field-names="{ label: 'categoryName', value: 'categoryCode' }"
          >
          </Select>
        </FormItem>
        <FormItem label="选择仪表" name="instrument">
          <div style="display: flex">
            <Select
              mode="multiple"
              v-model:value="deviceForm.instrument"
              :maxTagCount="3"
              :options="instrumentOptions"
              placeholder="请选择"
              :field-names="{ label: 'deviceName', value: 'deviceId' }"
              :open="false"
              :showArrow="false"
              @change="changeInstrument"
            >
            </Select>
            <Button type="primary" @click="() => (searchAssociated.visible = true)">请选择</Button>
          </div>
        </FormItem>
      </Form>
      <association-modal
        v-if="searchAssociated.visible"
        :visible="searchAssociated.visible"
        title="设备"
        rowKey="id"
        url="getDevices"
        :activeId="[]"
        :search="searchAssociated.search"
        :columns="searchAssociated.columns"
        selectionType="checkbox"
        @close="closeModal"
      >
      </association-modal>
    </Modal>
    <!-- 更换设备 -->
    <Modal v-model:visible="deviceVisible" @ok="submitDevice">
      <div style="margin-top: 40px; display: flex; align-items: center">
        <div style="width: 100px">初始读数：</div>
        <Input placeholder="请输入新仪表的初始读数" type="number" v-model:value="initValue"></Input>
      </div>
    </Modal>
    <!-- 配置上级 -->
    <Modal v-model:visible="parentDeviceVisible" @ok="submitParentDevice">
      <div style="margin-top: 40px; display: flex; align-items: center">
        <div style="width: 100px">选择设备：</div>
        <Select
          style="width: 400px"
          show-search
          v-model:value="parentDevice.parentId"
          :options="parentDeviceList"
          allow-clear
          optionFilterProp="deviceName"
          placeholder="请选择"
          :field-names="{ label: 'deviceName', value: 'deviceId' }"
        />
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { Popover, message } from "ant-design-vue";
import { Modal } from "ant-design-vue";
import { Popconfirm as PopConfirm, type FormInstance } from "ant-design-vue/es";
import type { SelectValue } from "ant-design-vue/es/select";
import type { ColumnsType } from "ant-design-vue/es/table/Table";
import type { Key } from "ant-design-vue/lib/_util/type";
import type { Rule } from "ant-design-vue/lib/form";
import { computed, h, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

import associationModal from "./components/association-modal.vue";
import { areaList } from "@/api/access";
import { deviceList, deleteDevices, batchDelete, meterAdd, setParentDevice, getParentList } from "@/api/device";
import { ClassifySettingsPage, TableRecordUpdate, deviceReadUpdate, meterDeviceBatchUpdate } from "@/api/energyOverview";
import { cubeDeviceCenterService } from "@/api/service";
import { timeFormat } from "@/utils/common";

const queryState = useCubeQueryState({
  storage: "url",
  initialState: {
    instrumentType: undefined as string | undefined,
    deviceAreaId: [],
    keyword: "",
    pageNumber: 1,
    pageSize: 10,
    total: 0,
    pages: 1,
  },
  cacheFields: ["instrumentType", "deviceAreaId", "keyword", "pageNumber", "pageSize"],
  resolveValue: (field, raw) => {
    if (field === "pageNumber" || field === "pageSize" || field === "pages") return Number(raw);
    if (field === "deviceAreaId") return raw.split(",");

    return raw;
  },
});
const scrollY = ref<number>(200);
const deviceListRef = ref<HTMLElement>();
const footerRef = ref<HTMLElement>();
const scrollHandle = async () => {
  await nextTick();
  const deviceList = deviceListRef.value;
  const table = deviceList?.querySelector<HTMLElement>(".device-list-table");
  const tableHeader = table?.querySelector<HTMLElement>(".energy-table-thead, .ant-table-thead");
  const contentTable = deviceList?.closest<HTMLElement>(".content-table");
  if (!table || !deviceList) return;

  const availableBottom = Math.min(contentTable?.getBoundingClientRect().bottom ?? window.innerHeight, window.innerHeight);
  const tableTop = table.getBoundingClientRect().top;
  const tableHeaderHeight = tableHeader?.offsetHeight ?? 55;
  const footerHeight = footerRef.value?.offsetHeight ?? 42;

  scrollY.value = Math.max(Math.floor(availableBottom - tableTop - tableHeaderHeight - footerHeight - 50), 0);
};
const handleResize = () => void scrollHandle();
let resizeObserver: ResizeObserver | undefined;
onMounted(async () => {
  window.addEventListener("resize", handleResize);
  await scrollHandle();
  const contentTable = deviceListRef.value?.closest<HTMLElement>(".content-table");
  if (contentTable) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(contentTable);
  }
  getDeviceList();
  const { data } = await ClassifySettingsPage();
  instrumentTypeOptions.value = data.records;
  meterTypeList.value = data.records;
  const { data: areal } = await areaList();
  areaDataList.value = areal;
  await scrollHandle();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  resizeObserver?.disconnect();
});
//更换设备弹窗=============================================================================================================================================
const deviceVisible = ref(false);
const initValue = ref("");
const currentId = ref("");
const submitDevice = async () => {
  await TableRecordUpdate({ deviceId: currentId.value, initValue: initValue.value });
  message.success("操作成功");
  getDeviceList();
  deviceVisible.value = false;
};
const openChangeDeviceModel = (id: string) => {
  initValue.value = "";
  currentId.value = id;
  deviceVisible.value = true;
};
//设备列表=============================================================================================================================================
const deviceLoading = ref(true);
const meterTypeList = ref([]);
const areaDataList = ref([]);
const tableList = ref([]);
const selectedRowKeysData = ref<any[]>([]);
const batchUpdateReadingLoading = ref(false);
const deviceColumns: ColumnsType = [
  {
    title: "仪表编码",
    dataIndex: "code",
    key: "code",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "仪表名称",
    dataIndex: "deviceName",
    key: "deviceName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "仪表类型",
    dataIndex: "instrumentName",
    key: "instrumentName",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "所在区域",
    dataIndex: "deviceArea",
    key: "deviceArea",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return h(Popover, { content: text || "--" }, { default: () => (text as string) || "--" });
    },
  },
  {
    title: "最新采集时间",
    dataIndex: "nowReadeTime",
    key: "nowReadeTime",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: string }) => {
      return timeFormat(text, true);
    },
  },
  {
    title: "当前读数",
    dataIndex: "readeValue",
    key: "readeValue",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: number }) => {
      return h(Popover, { content: text }, { default: () => (text as number) ?? "--" });
    },
  },
  {
    title: "初始读数",
    dataIndex: "initValue",
    key: "initValue",
    ellipsis: true,
    align: "center",
    customRender: ({ text }: { text: number }) => {
      return h(Popover, { content: text }, { default: () => (text as number) ?? "--" });
    },
  },
  {
    dataIndex: "action",
    title: "操作",
    width: "330px",
    fixed: "right",
  },
];
const listLength = computed(() => {
  return selectedRowKeysData.value;
});
const getDeviceList = async () => {
  deviceLoading.value = true;
  const query = {
    instrumentType: queryState.state.instrumentType,
    deviceAreaId:
      queryState.state.deviceAreaId && queryState.state.deviceAreaId.length
        ? queryState.state.deviceAreaId[queryState.state.deviceAreaId.length - 1]
        : "",
    keyword: queryState.state.keyword,
    total: queryState.state.total,
    pageSize: queryState.state.pageSize,
    pageNumber: queryState.state.pageNumber,
  };
  const { data } = await deviceList(query);
  tableList.value = data.records;
  deviceLoading.value = false;
  queryState.state.total = data.total;
  queryState.state.pages = data.pages;
};
const onSelectChange = (_selectedRowKeys: Key[], selectedRows: any[]) => {
  selectedRowKeysData.value = selectedRows;
};
const tableChange = (current: number, pageSize: number) => {
  queryState.setPage(current || 1, pageSize);
  getDeviceList();
};
const reset = () => {
  queryState.clearCache();
  queryState.update({
    instrumentType: undefined,
    deviceAreaId: [],
    keyword: "",
  });
  queryState.resetPage();
  getDeviceList();
};
const deleteData = async (record: { deviceId: string }) => {
  await deleteDevices(record.deviceId);
  message.success("操作成功");
  getDeviceList();
};
const batchDeleteData = async () => {
  const ids = selectedRowKeysData.value.map((x) => x.deviceId);
  await batchDelete(ids as string[]);
  selectedRowKeysData.value = [];
  getDeviceList();
};
//设备详情=============================================================================================================================================
const checkDetail = (record: any) => {
  history.pushState(
    {},
    "",
    `/portal/energy-consumption/device/detail?id=${record.id}&deviceId=${record.deviceId}&instrumentType=${record.instrumentType}`,
  );
};
//关联设备=============================================================================================================================================
const associatedLoading = ref(false);
const deviceForm = reactive({
  instrumentType: "",
  instrument: [] as any[],
});
const formRef = ref<FormInstance>();
const associatedVisible = ref(false);
const instrumentTypeOptions = ref();
const instrumentOptions = ref();
const deviceRules: Record<string, Rule[]> = {
  instrumentType: [{ required: true, message: "请选择仪表类型", trigger: "change" }],
  instrument: [{ required: true, message: "请选择仪表", trigger: "change" }],
};
const searchAssociated = reactive({
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
      dataIndex: "modelName",
      title: "设备型号",
      customRender: ({ record }) => {
        return record.productInfo.modelName;
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
//选择关联设备
const closeModal = async (data: any, selectAll: boolean, searchForm: any) => {
  searchAssociated.visible = false;
  if (selectAll) {
    //勾选所有
    associatedLoading.value = true;
    const obj = {
      ...searchForm,
      pageNumber: 1,
      pageSize: 100,
    };
    const { total } = await cubeDeviceCenterService.getDeviceInstancePageAll(obj);
    const page = Math.ceil((total - 100) / 100);
    let list: any[] = [];
    for (let i = 1; i <= page + 1; i++) {
      obj.pageNumber = i;
      obj.pageSize = 100;
      const { records } = await cubeDeviceCenterService.getDeviceInstancePageAll(obj);
      list = list.concat(records);
    }
    const deviceInfo = list.map((item: any) => {
      return {
        deviceName: item.name,
        deviceId: item.id,
        code: item.code,
        areaId: item.area ? item?.area?.pathId : "",
        areaName: item.area ? item?.area?.pathName : "",
        brandName: item.productInfo?.brandName,
        thirdPartyId: item?.thirdPartyId,
        deviceProdCategoryCode: item?.productInfo?.productCategory?.code,
        deviceProdCategoryCodeConcat: item?.productInfo?.productCategory?.pathCode,
        deviceStatus: item.status.onlineState,
        deviceProdCategoryName: item.productInfo?.productCategory?.name,
        deviceProdId: item.productInfo.id,
        deviceProdName: item.productInfo.name,
        lntAndLat: item.lntAndLat,
      };
    });
    instrumentOptions.value = deviceInfo;
    deviceForm.instrument = deviceInfo.map((x: { deviceId: any }) => x.deviceId);
    associatedLoading.value = false;
    return;
  }
  if (!data || data.length === 0) return;
  const deviceInfo = data.map((item: any) => {
    return {
      deviceName: item.name,
      deviceId: item.id,
      code: item.code,
      areaId: item?.area?.pathId,
      areaName: item?.area?.pathName,
      brandName: item?.productInfo?.brandName,
      thirdPartyId: item.thirdPartyId,
      deviceProdCategoryCode: item?.productInfo?.productCategory?.code,
      deviceProdCategoryCodeConcat: item?.productInfo?.productCategory?.pathCode,
      deviceStatus: item?.status?.onlineState,
      deviceProdCategoryName: item.productInfo?.productCategory?.name,
      deviceProdId: item.productInfo?.id,
      deviceProdName: item.productInfo?.name,
      lntAndLat: item.lntAndLat,
    };
  });
  instrumentOptions.value = deviceInfo;
  deviceForm.instrument = deviceInfo.map((x: { deviceId: any }) => x.deviceId);
};
const changeInstrument = (value: SelectValue) => {
  if (value) instrumentOptions.value = instrumentOptions.value.filter((x: { deviceId: string }) => (value as {}[]).includes(x.deviceId));
};
//提交关联设备
const submitAssociated = () => {
  formRef.value?.validate().then(async () => {
    associatedLoading.value = true;
    const params = instrumentOptions.value.map((item: any) => {
      return {
        instrumentType: deviceForm.instrumentType,
        deviceId: item.deviceId,
        deviceName: item.deviceName,
        deviceArea: item.areaName,
        deviceAreaId: item.areaId,
        productBrandName: item.brandName,
        productName: item.deviceProdName,
        productCategoryName: item.deviceProdCategoryName,
        productId: item.deviceProdId,
        productCategoryPathCode: item.deviceProdCategoryCodeConcat,
        code: item.code,
      };
    });
    await meterAdd(params);
    associatedLoading.value = false;
    associatedVisible.value = false;
    getDeviceList();
  });
};
const cancelAssociated = () => {
  associatedVisible.value = false;
  formRef.value?.resetFields();
};
//配置上级================================================================================================================================================
const parentDeviceVisible = ref(false);
const parentDevice = ref<{ id: string; parentId: string | undefined }>({ id: "", parentId: undefined });
const parentDeviceList = ref();
const openParentDeviceModel = async (record: { parentId: string; id: string; deviceId: string; instrumentType: string }) => {
  const { data } = await getParentList(record.id, record.instrumentType);
  parentDeviceList.value = data;
  parentDevice.value.parentId = record.parentId === "" ? undefined : record.parentId;
  parentDevice.value.id = record.id;
  parentDeviceVisible.value = true;
};
const submitParentDevice = async () => {
  const params = { id: parentDevice.value.id, parentId: parentDevice.value.parentId };
  await setParentDevice(params);
  parentDeviceVisible.value = false;
  message.success("操作成功");
  getDeviceList();
};
//批量更新读数=============================================================================================================================================
const batchUpdateReading = async () => {
  if (selectedRowKeysData.value.length === 0) {
    message.warning("请选择要更新的设备！");
    return;
  }

  batchUpdateReadingLoading.value = true;
  try {
    const idList = selectedRowKeysData.value.map((item) => Number(item.id));
    await meterDeviceBatchUpdate(idList);
    await getDeviceList();
    message.success("操作成功");
  } catch (err) {
    message.error("批量更新读数失败，请稍后重试");
  } finally {
    batchUpdateReadingLoading.value = false;
  }
};
//更新读数
const updateReading = async (id: string) => {
  try {
    const { data } = await deviceReadUpdate(id);
    Modal.success({
      content: `更新成功，当前读数 ${data.nowReadeValue}`,
      okText: "关闭",
    });
    getDeviceList();
  } catch (err) {
    Modal.error({
      content: `更新失败，请检查设备连接状态`,
      okText: "关闭",
    });
  }
};
</script>
<style lang="less" scoped>
.device-list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;

  > :deep(.device-list-table) {
    min-height: 0;
    flex: none;
    overflow: hidden;
  }
}

.header {
  flex-shrink: 0;
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.footer {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
