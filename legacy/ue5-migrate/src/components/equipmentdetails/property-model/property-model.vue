<template>
  <div class="alarmDetail-wrap">
    <div class="alarmDetail-modal">
      <div class="alarmDetail-modal-header">
        <div class="header-title">{{ infoData.name }}</div>
        <div class="flex-between">
          <div class="header-close" @click="backModal">
            <fullscreen-exit-outlined />
          </div>
          <div class="header-close" @click="closeModal">
            <CloseOutlined />
          </div>
        </div>
      </div>
      <div class="alarmDetail-modal-content flex-column">
        <div class="content-tabs">
          <div v-for="item in tabsList" :key="item" :class="item === activeTabs ? 'active' : ''" @click="activeTabs = item">
            <div>{{ item }}</div>
          </div>
        </div>
        <div class="conent-body">
          <div v-if="activeTabs === '基本信息'" class="info-content">
            <div class="info-img">
              <a-image v-if="false" width="100%" height="100%" :src="'222'"></a-image>
              <!-- <div v-else style="color:#fff">暂无图片</div> -->
              <a-image v-else width="100%" height="100%" :src="getAssetsImage('overView45.png')"></a-image>
            </div>
            <div style="width: 28%">
              <div class="info-name">
                资产编码: <span>{{ propertyData.serialNumber || "--" }}</span>
              </div>
              <div class="info-name">
                资产类别: <span>{{ propertyData.typeName || "--" }}</span>
              </div>
              <div class="info-name">
                使用期限: <span>{{ propertyData.usageTime + "月" || "--" }}</span>
              </div>
              <div class="info-name">
                数量: <span>{{ propertyData.number || "--" }}</span>
              </div>
              <div class="info-name">
                维护部门: <span>{{ propertyData.maintenanceDepName }}</span>
              </div>
            </div>
            <div style="width: 50%">
              <div class="info-name">
                资产名称: <span>{{ propertyData.name || "--" }}</span>
              </div>
              <div class="info-name">
                所在区域: <span>{{ propertyData.area.map((e) => e.name).toString() || "--" }}</span>
              </div>
              <div class="info-name">
                入库日期: <span>{{ propertyData.startTime ? dayjs(propertyData.startTime).format("YYYY-MM-DD") : "--" }}</span>
              </div>
              <div class="info-name">
                计量单位: <span>{{ propertyData.unit || "--" }}</span>
              </div>
              <div class="info-name">
                管理员: <span>{{ propertyData.receiveUserName }}</span>
              </div>
            </div>
          </div>
          <div v-if="activeTabs === '资产履历'">
            <a-form layout="inline" :model="formState">
              <a-form-item label="处理日期">
                <a-date-picker style="width: 80px" v-model:value="formState.handleTime" value-format="YYYY-MM-DD" />
              </a-form-item>
              <a-form-item label="处理人部门">
                <a-select v-model:value="formState.departmentId" placeholder="请选择" style="width: 80px">
                  <a-select-option v-for="item in deptOptions" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="处理方式">
                <a-select v-model:value="formState.handleType" placeholder="请选择" style="width: 80px">
                  <a-select-option v-for="item in handleTypeOptions" :key="item.value" :value="item.value">{{
                    item.label
                  }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="queryForm">查询</a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="reset"> 重置 </a-button>
              </a-form-item>
            </a-form>
            <a-table style="margin-top: 6px" :dataSource="dataSource" :columns="columns" :pagination="false" />
            <div class="page">
              <a-pagination
                v-model:current="pagination.pageNumber"
                v-model:pageSize="pagination.pageSize"
                :total="pagination.total"
                :default-current="1"
                :show-total="(total: number) => `共 ${total} 条数据`"
                @change="pageChange"
                :show-size-changer="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { Popover } from "ant-design-vue";
import dayjs from "dayjs";
import { ref, reactive, onMounted, h } from "vue";

import { organizationsList } from "@/api/ouaa";
import { getCodePropertyDetailed, getPropertyDetailed, getPropertyHistoryList } from "@/api/property";
import { getAssetsImage } from "@/utils/getImage";

const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
  code: {
    type: [String],
    default: "",
  },
  isequ: {
    type: Boolean,
    default: false,
  },
  PanelName: {
    type: Object,
    default: false,
  },
});
const emit = defineEmits(["close"]);
const tabsList = ref(["基本信息", "资产履历"]);
const activeTabs = ref("基本信息");
const dataSource = ref([]);
const deptOptions = ref([]);
const handleTypeOptions = [
  { label: "资产入库", value: "DEPOSITORY" },
  { label: "资产派发", value: "DISTRIBUTION" },
  { label: "资产调拨", value: "OUTBOUND" },
  { label: "资产报废", value: "WEED_OUT" },
];
const pagination = ref({
  pageSize: 5,
  pageNumber: 1,
  total: 0,
});
const formState = reactive<{
  departmentId: string | undefined;
  handleTime: string;
  handleType: string | undefined;
}>({
  departmentId: undefined,
  handleTime: "",
  handleType: undefined,
});
const columns = [
  {
    title: "序号",
    align: "center",
    customRender: ({ index }) => `${index + 1}`,
  },
  {
    title: "处理日期",
    dataIndex: "handleTime",
    ellipsis: true,
    customRender: ({ text }) => {
      text = text ? dayjs(text).format("YYYY-MM-DD") : "--";
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理方式",
    dataIndex: "handleTypeName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理人",
    dataIndex: "createByName",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
  {
    title: "处理内容",
    dataIndex: "remarks",
    ellipsis: true,
    customRender: ({ text }) => {
      return [h(Popover, { content: text }, { default: () => (text as string) || "--" })];
    },
  },
];
const propertyData = ref({
  serialNumber: "",
  typeName: "",
  usageTime: "",
  number: "",
  maintenanceDepName: "",
  name: "",
  area: [{ name: "" }],
  startTime: "",
  unit: "",
  receiveUserName: "",
});
const infoData = ref({
  name: "资产信息",
});
const backModal = () => {
  emit("close", false);
};
const closeModal = () => {
  emit("close", true);
};
const getPropertyDetail = async () => {
  if (props.id) {
    propertyData.value = await getPropertyDetailed(props.id);
    getTableData();
  } else if (props.code) {
    propertyData.value = await getCodePropertyDetailed(props.code);
  }
};
const pageChange = (pageNumber: number, pageSize: number) => {
  pagination.value.pageNumber = pageNumber || 1;
  pagination.value.pageSize = pageSize;
  getTableData();
};
const getDepList = async () => {
  deptOptions.value = await organizationsList();
};
const getTableData = async () => {
  const params = {
    pageNumber: pagination.value.pageNumber,
    pageSize: pagination.value.pageSize,
    id: props.id,
    ...formState,
  };
  const { records, total } = await getPropertyHistoryList(params);
  dataSource.value = records;
  pagination.value.total = total;
};
const reset = () => {
  formState.departmentId = undefined;
  formState.handleType = undefined;
  formState.handleTime = "";
  queryForm();
};
const queryForm = () => {
  pagination.value.pageNumber = 1;
  getTableData();
};
onMounted(() => {
  getDepList();
  getPropertyDetail();
});
</script>
<style lang="less" scoped>
.alarmDetail-wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9000;
}

.alarmDetail-modal {
  width: 800px;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 99999999;
  transform: translate(-50%, -50%);
  background: transparent;
  border-bottom: 2px solid rgba(41, 137, 255, 1);

  &.full {
    width: 100%;
    height: 100%;
  }

  .alarmDetail-modal-header {
    height: 30px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid rgba(41, 137, 255, 1);
    background-image: url("/resource/v1/ue5-migrate/assets/images/modal-title.png");
    background-size: 100%95%;
    background-repeat: no-repeat;

    .header-title {
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
    }

    .header-close {
      width: 24px;
      height: 24px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      span {
        font-size: 13px;
      }
    }
  }

  .alarmDetail-modal-content {
    max-height: 515px;
    width: 100%;
    padding: 0 16px;
    padding-bottom: 20px;
    overflow: hidden;
    background: rgba(1, 11, 23, 0.78);
    margin-top: 2px;

    .content-tabs {
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #ffffff;

      > div {
        width: 68px;
        height: 26px;
        opacity: 1;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
        cursor: pointer;
        transition: all 0.3s ease-in-out;

        &.active {
          background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
        }
      }
    }

    .conent-body {
      min-height: 340px;

      width: 100%;

      .info-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;

        .info-img {
          width: 150px;
          text-align: center;
          // line-height: 10px;
          height: 110px;
        }

        :deep(.box .content) {
          margin-top: 15%;
        }

        .info-name {
          margin-top: 15px;
          color: #b7c5d3;
          text-align: left;

          img {
          }
        }

        .info-name > span {
          margin-left: 10px;
        }
      }
    }
  }
}

.content-tabs {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: 400;
  color: #ffffff;

  > div {
    width: 68px;
    height: 26px;
    opacity: 1;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease-in-out;

    &.active {
      background: linear-gradient(180deg, rgba(41, 137, 255, 0) 0%, rgba(41, 137, 255, 0.5) 100%);
    }
  }
}

.page {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  :deep(.ant-pagination-total-text) {
    color: white;
  }
}

:deep(.ant-table) {
  background-color: transparent;
}

:deep(.ant-table-container) {
  background-color: transparent;
}

:deep(.ant-table-content) {
  background-color: transparent;
}

:deep(.ant-table-thead) {
  th {
    background-color: rgba(16, 40, 68, 0.4x);
  }
}

:deep(.ant-table-tbody) {
  td {
    background-color: transparent;
    border-bottom: thin solid rgba(105, 116, 140, 0.5);
  }

  tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected) > td {
    //自定义table行hover上去的背景颜色
    background: transparent;
    cursor: default;
  }
}

.ant-form-item {
  .ant-picker,
  .ant-input-affix-wrapper {
    color: #ffffff;
    background: rgba(96, 112, 128, 0.6);
    border: 1px solid rgba(96, 112, 128, 0.6);
  }
}

:deep(.ant-empty) {
  color: #d0deee;
}
</style>
