<template>
  <GLayout ref="table_layout_ref" :title="pageTitle">
    <template #content-table>
      <div ref="sitePointsRef" class="site-points">
        <div class="site-points-left">
          <div class="site-points-left-title flex-between">
            <span>现场点类型</span>
            <span class="addType" @click="openAddType">新增类型</span>
          </div>
          <div class="site-pointsTypeList">
            <div
              v-for="item in siteTypeData"
              @click="currentPointsEvent(item)"
              :key="item.id"
              class="flex-between cursor"
              :style="{ backgroundColor: currentPointsId === item.id ? '#98edcc' : '#fff' }"
            >
              <div>
                {{ item.name }}
              </div>
              <div>
                <edit-outlined style="cursor: pointer" @click="editSiteType(item)" />
                <Popconfirm title="确定要删除本条数据嘛?" ok-text="确定" cancel-text="取消" @confirm="deleteSiteTypeEvent(item.id)">
                  <delete-outlined style="color: red; margin-left: 10px; cursor: pointer" />
                </Popconfirm>
              </div>
            </div>
          </div>
        </div>
        <div class="site-points-right">
          <div ref="sitePointsSearchRef" class="site-points-right-search flex-between">
            <div>
              <Input v-model:value="querySiteName" placeholder="现场点名称" style="width: 100px" />
              <Select v-model:value="queryDepData" placeholder="请选择部门" style="width: 120px; margin: 0 10px" allow-clear>
                <SelectOption v-for="item in departmentData" :key="item.id" :value="item.id">{{ item.name }}</SelectOption>
              </Select>
              <Cascader changeOnSelect v-model:value="queryArea" :options="areaData" style="width: 120px" placeholder="请选择区域" />
              <Button type="primary" style="margin-left: 10px" @click="querySite">查询</Button>
              <Button style="margin-left: 10px" @click="resetting">重置</Button>
            </div>
            <div class="operating-button">
              <Popconfirm title="确定要批量删除?" ok-text="确定" cancel-text="取消" @confirm="deleteBatchSite">
                <Button type="primary" danger :loading="batchLoading">批量删除</Button>
              </Popconfirm>
              <Button type="primary" style="margin-left: 10px" :loading="downLoading" @click="downloadTemplate">下载模板</Button>
              <Upload action="/api/maintain/inspect/point/import-template" :headers="header" @change="batchImport">
                <Button type="primary" style="margin-left: 10px" :loading="buttonUpload">批量导入</Button>
                <template #itemRender />
              </Upload>
              <Button type="primary" style="margin-left: 10px" @click="addSitePoints">新增</Button>
              <Button type="primary" style="margin-left: 10px" :loading="codeLoading" @click="downLoadQRcode"> 批量下载二维码 </Button>
            </div>
          </div>
          <AliasTable
            tableCode="INSPECTION_CONFIG"
            applicationCode="INSPECTION"
            row-key="id"
            :loading="siteTbaleConfig.tableLoading"
            :data-source="siteTbaleConfig.dataSource"
            :columns="siteTbaleConfig.columns"
            :pagination="false"
            :row-selection="rowSelection"
            :scroll-y="tableScrollY"
          >
          </AliasTable>
        </div>
      </div>
    </template>
    <template #footer-page>
      <Pagination
        v-model:current="pagination.pageNumber"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        :default-current="1"
        :show-total="(total: number) => `共 ${total} 条数据`"
        @change="pageChange"
      />
    </template>
  </GLayout>
  <!-- 新增现场点类型 -->
  <Modal v-model:visible="modalVisible.addTypeFlag" :title="siteModelTitle" @ok="addTypeOk">
    <div>
      <span> 现场点类型名称: </span>
      <Input v-model:value="siteInfo.name" style="width: 300px" />
    </div>
  </Modal>
  <!-- 新增现场点 -->
  <Modal
    v-model:visible="modalVisible.siteFlag"
    width="500px"
    :title="modeDetails.modelType ? '新增现场点' : '编辑现场点'"
    :destroy-on-close="true"
    @ok="addSiteOk"
  >
    <addSiteModal ref="addSiteModalRef" :mode-details="modeDetails" />
  </Modal>
</template>

<script setup lang="ts">
import { Button, message, Popconfirm } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import type { UploadChangeParam, UploadFile } from "ant-design-vue/es/upload/interface";
import { ref, shallowRef, reactive, onMounted, onBeforeUnmount, nextTick, computed, h } from "vue";

import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import addSiteModal from "./component/add-site-modal.vue";
import {
  deleteSiteType,
  addSiteType,
  getSiteTypeList,
  updateSiteType,
  addSiteTypeData,
  getSiteList,
  deleteSitePoints,
  updataSiteTypeData,
  QRcodeDownload,
  batchDeleteSitePoints,
} from "@/api/inspection";
import { getAreaList } from "@/api/mdata";
import type { PointListObj } from "@/api/model/inspection";
import { organizationsList } from "@/api/ouaa";
import { exportExcel, getNowEnterprise, getToken } from "@/utils/auth";
interface ModalVisibleType {
  addTypeFlag: boolean;
  siteFlag: boolean;
}
interface SiteTbaleConfigType {
  tableLoading: boolean;
  columns: TableColumnsType;
  dataSource: PointListObj[];
}
interface UpdateSiteType {
  codeNum: string;
  name: string;
  typeId: string | undefined;
  typeName: string;
  depId: string[];
  depName: string;
  areaId: string;
  detailAddress: string;
  location: string;
  deviceIdList: string[];
  deviceList: { id: string; name: string }[];
  id?: number;
}
const { pageTitle } = usePageName();
const siteModelTitle = ref("新增现场点类型");
const addSiteModalRef = ref();
const querySiteName = ref();
const queryDepData = ref();
const queryArea = ref();
const areaData = ref();
const departmentData = ref();
const downLoading = ref(false);
const batchLoading = ref(false);
const buttonUpload = ref(false);
const sitePointsRef = shallowRef<HTMLElement>();
const sitePointsSearchRef = shallowRef<HTMLElement>();
const tableScrollY = shallowRef(120);
const TABLE_HEADER_HEIGHT = 40;
let sitePointsResizeObserver: ResizeObserver | undefined;

const updateTableScrollY = () => {
  const contentHeight = sitePointsRef.value?.clientHeight ?? 0;
  const searchElement = sitePointsSearchRef.value;
  const searchMarginBottom = searchElement ? Number.parseFloat(window.getComputedStyle(searchElement).marginBottom) || 0 : 0;
  const searchHeight = (searchElement?.offsetHeight ?? 0) + searchMarginBottom;

  tableScrollY.value = Math.max(contentHeight - searchHeight - TABLE_HEADER_HEIGHT, 120);
};
const header = ref({
  tenant: getNowEnterprise()?.code,
  terminal: "bimops-manage-web",
  Authorization: `Bearer ${getToken().accessToken}`,
});
const modeDetails = reactive<{ modelType: boolean; siteInfo: UpdateSiteType }>({
  modelType: true,
  siteInfo: {
    codeNum: "",
    name: "",
    typeId: "",
    typeName: "",
    depId: [""],
    depName: "",
    areaId: "",
    location: "",
    detailAddress: "",
    deviceIdList: [],
    deviceList: [],
  },
});
const siteTypeData = ref<{ id: string; name: string }[]>([]);
const modalVisible = reactive<ModalVisibleType>({
  addTypeFlag: false,
  siteFlag: false,
});
const pagination = reactive({
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const siteTbaleConfig = reactive<SiteTbaleConfigType>({
  tableLoading: false,
  columns: [
    {
      title: "序号",
      width: 70,
      align: "center",
      customRender: ({ index }) => `${index + 1}`,
      fixed: "left",
    },
    {
      title: "编码",
      dataIndex: "codeNum",
      align: "center",
      ellipsis: true,
    },
    {
      title: "现场点名称",
      dataIndex: "name",
      ellipsis: true,
      align: "center",
    },
    {
      title: "类型",
      dataIndex: "typeName",
      ellipsis: true,
      align: "center",
    },
    {
      title: "管理部门",
      dataIndex: "depName",
      ellipsis: true,
      align: "center",
    },
    {
      title: "所属区域",
      dataIndex: "areaName",
      ellipsis: true,
      align: "center",
    },
    {
      title: "具体地址",
      dataIndex: "location",
      // ellipsis: true,
      align: "center",
    },
    {
      title: "编辑",
      dataIndex: "edit",
      align: "center",
      customRender: ({ record }) => {
        return [
          h(Button, { type: "link", size: "small", onClick: () => upDataSite(record) }, { default: () => "编辑" }),
          h(
            Popconfirm,
            {
              title: "是否确认删除？",
              danger: true,
              onConfirm: () => {
                deleteSite(record);
              },
            },
            {
              default: () => h(Button, { type: "link", size: "small", danger: true }, { default: () => "删除" }),
            },
          ),
        ];
      },
    },
  ],
  dataSource: [],
});
const siteInfo = reactive<{ id: string; name: string }>({
  id: "",
  name: "",
});

const openAddType = () => {
  siteInfo.name = "";
  siteInfo.id = "";
  siteModelTitle.value = "新增现场点类型";
  modalVisible.addTypeFlag = true;
};
// 查询现场点
const querySite = async () => {
  siteTbaleConfig.tableLoading = true;
  const params = {
    pointName: querySiteName.value,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    typeId: currentPointsId.value,
    receiveDepId: queryDepData.value,
    areaId: queryArea.value ? queryArea.value.join() : "",
  };
  const res = await getSiteList(params);
  siteTbaleConfig.tableLoading = false;
  if (res.data) {
    siteTbaleConfig.dataSource = res.data.records;

    pagination.total = res.data.total;
    // 获取当前页的选中项
    const currentSelect = siteTbaleConfig.dataSource.filter((obj1: any) => selectedList.value.some((obj2) => obj2.id === obj1.id));
    selectedRowKeysState.value = currentSelect.map((x: any) => x.id);
  }
};

const getDeptList = async () => {
  const res = await organizationsList();
  departmentData.value = res.data;
};
const getAreaListEvent = async () => {
  const res = await getAreaList();
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"name"/g, '"label"'));
  res.data = JSON.parse(JSON.stringify(res.data).replace(/"id"/g, '"value"'));
  if (res.data) {
    areaData.value = res.data;
  }
};
// 编辑现场点
const upDataSite = async (record: UpdateSiteType) => {
  modeDetails.modelType = false;
  modalVisible.siteFlag = true;
  modeDetails.siteInfo = record;
};
// 重置现场点
const resetting = async () => {
  querySiteName.value = "";
  queryDepData.value = "";
  queryArea.value = "";
  pagination.pageNumber = 1;
  pagination.pageSize = 10;
  await querySite();
};
// 获取现场点类型列表
const getSiteType = async () => {
  const res = await getSiteTypeList();
  if (res.data) {
    siteTypeData.value = res.data;
  }
};

// 修改现场点类型
const editSiteType = (value: { id: string; name: string }) => {
  Object.assign(siteInfo, value);
  siteModelTitle.value = "编辑现场点类型";
  modalVisible.addTypeFlag = true;
};
const downloadTemplate = async () => {
  downLoading.value = true;
  try {
    await exportExcel("/inspect/point/download-template", null, "现场点模板");
  } catch (error) {
  } finally {
    downLoading.value = false;
  }
};
const batchImport = async (info: UploadChangeParam<UploadFile>) => {
  buttonUpload.value = true;
  if (info.file.status === "done") {
    message.success("批量导入成功");
    await resetting();
  } else if (info.file.status === "error") {
    message.error(info.file.response.message);
    buttonUpload.value = false;
  }
  buttonUpload.value = false;
};
// 新增现场点
const addSitePoints = () => {
  modeDetails.modelType = true;
  modalVisible.siteFlag = true;
};
const currentPointsId = ref();
const currentPointsEvent = (value: { id: string }) => {
  if (currentPointsId.value === value.id) {
    currentPointsId.value = undefined;
  } else {
    currentPointsId.value = value.id;
  }
  querySite();
};
// 批量下载二维码===================================================
const codeLoading = ref(false);
const selectedRowKeysState = ref<Key>([]);
type Key = string[] | number[];
const selectedList = ref<any[]>([]);
const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedRowKeysState.value,
    onChange,
    onSelect,
    onSelectAll,
  };
});
const onChange = (selectedRowKeys: Key): void => {
  selectedRowKeysState.value = selectedRowKeys;
};
const onSelect = (record: any, selected: any): void => {
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
//获取二维码列表
const getQrcodeList = () => {
  const entityInfo = selectedList.value.map((x: any) => {
    return { entityId: x.id, entityName: x.name, serialNumber: x.codeNum };
  });
  codeLoading.value = true;
  QRcodeDownload({ entityType: "SITE_POINT", styleId: "1726505877848473667", entityInfo: entityInfo })
    .then(async (res) => {
      if (res?.data) {
        saveQrcodeZip(res.data);
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

const pageChange = () => {
  querySite();
};
// 删除现场点
const deleteSite = async (value: PointListObj) => {
  await deleteSitePoints(value.id);
  querySite();
  message.success("现场点删除成功");
};
const deleteBatchSite = async () => {
  batchLoading.value = true;
  await batchDeleteSitePoints({ idList: selectedRowKeysState.value });
  selectedRowKeysState.value = [];
  batchLoading.value = false;
  resetting();
  message.success("现场点删除成功");
};
// 删除现场点类型
const deleteSiteTypeEvent = async (id: string) => {
  await deleteSiteType(id);
  await getSiteType();
  message.success("现场点类型删除成功");
};
const addSiteOk = async () => {
  if (await addSiteModalRef.value.onCheck()) {
    const params = JSON.parse(JSON.stringify(addSiteModalRef.value.formState));
    params.deviceIdList = Array.isArray(params.deviceIdList) ? params.deviceIdList : [];
    delete params.deviceList;
    if (params.areaId instanceof Array) {
      params.areaId = params.areaId.join();
    }
    if (modeDetails.modelType) {
      try {
        await addSiteTypeData(params);
        modalVisible.siteFlag = false;
        message.success("现场点新增成功");
        await querySite();
      } catch (errorInfo: any) {}
    } else {
      try {
        await updataSiteTypeData(params);
        modalVisible.siteFlag = false;
        message.success("现场点修改成功");
        await querySite();
      } catch (errorInfo: any) {
        message.error(errorInfo.data.message);
      }
    }
  }
};
const addTypeOk = async () => {
  if (!siteInfo.name) {
    message.warning("请填写现场点名称!");
    return;
  }
  if (siteInfo.id === "") {
    await addSiteType(siteInfo.name);
    message.success("现场点类型新增成功");
  } else {
    await updateSiteType({ typeId: siteInfo.id, typeName: siteInfo.name });
    message.success("现场点类型修改成功");
  }
  await getSiteType();
  siteInfo.id = "";
  modalVisible.addTypeFlag = false;
};
onMounted(() => {
  void nextTick(() => {
    updateTableScrollY();
    if (sitePointsRef.value) {
      sitePointsResizeObserver = new ResizeObserver(updateTableScrollY);
      sitePointsResizeObserver.observe(sitePointsRef.value);
    }
  });
  getSiteType();
  querySite();
  getDeptList();
  getAreaListEvent();
});
onBeforeUnmount(() => {
  sitePointsResizeObserver?.disconnect();
});
</script>
<style scoped lang="less">
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-points {
  display: flex;
  height: 100%;
  min-height: 0;
  justify-content: space-between;

  .site-points-left {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 100%;
    min-height: 0;
    flex-shrink: 0;
    margin-right: 40px;

    .site-points-left-title {
      padding-bottom: 10px;
    }

    .site-pointsTypeList {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }

  .site-points-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    .site-points-right-search {
      flex-shrink: 0;
      margin-bottom: 20px;
    }
  }

  .addType {
    cursor: pointer;
    color: #169bd5;
  }
}
.cursor {
  cursor: pointer;
}
.operating-button {
  display: flex;
}
</style>
