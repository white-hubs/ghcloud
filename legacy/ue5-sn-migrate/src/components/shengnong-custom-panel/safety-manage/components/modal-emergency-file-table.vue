<template>
  <Modal title="预案文件列表" :show="showModal" @close="closeModal" width="1200px">
    <div class="modal-layout">
      <div class="table-top">
        <a-form ref="selectForm" :model="datainfo" layout="inline">
          <a-form-item label="所属市场">
            <a-select
              class="alarm-level-select"
              v-model:value="datainfo.marketTenant"
              placeholder="请选择市场"
              :options="marketlist"
              :field-names="{ label: 'marketName', value: 'marketTenant' }"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="文件类型">
            <a-select class="alarm-level-select" v-model:value="datainfo.classifyCode">
              <a-select-option :value="item.classifyCode" v-for="item in fileTypesList">{{ item.classifyName }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="文件级别" class="handle-status-select">
            <a-select v-model:value="datainfo.levelCode">
              <a-select-option :value="item.value" v-for="item in fileLevels">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="文件状态" class="handle-status-select">
            <a-select v-model:value="datainfo.status">
              <a-select-option :value="item.value" v-for="item in fileStates">{{ item.label }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="">
            <a-input style="width: 150px" placeholder="文件名称" v-model:value="keyword" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="small" @click="query">查询</a-button>
            <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header" :class="{ 'col-index': item === '序号' }">{{ item }}</div>
        </div>
        <a-spin :spinning="loadingDataSource">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-else v-for="(item, index) in dataSource">
              <div class="content">
                <div class="col-index">{{ index + 1 }}</div>
                <div class="ellipsis">
                  <a-popover :content="item.name">{{ item.name }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.marketName">{{ item.marketName }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.emergencyEventTypeName">{{ item.emergencyEventTypeName }}</a-popover>
                </div>
                <div class="ellipsis" :style="`color:${getFileLeve(item.levelCode)?.color}`">
                  <a-popover :content="item.levelCode">{{ getFileLeve(item.levelCode)?.label }}</a-popover>
                </div>
                <div class="ellipsis">
                  <a-popover :content="item.expirationDate">{{
                    item.expirationDate ? dayjs(item.expirationDate).format("YYYY-MM-DD") : "--"
                  }}</a-popover>
                </div>
                <div class="ellipsis" :style="`color:${getFileState(item.expirationStatus)?.color}`">
                  <a-popover :content="item.expirationStatus">{{ getFileState(item.expirationStatus)?.label }}</a-popover>
                </div>
                <div>
                  <a @click="preview(item)" style="color: #5eacff; margin-left: 14px">{{ item.documentFileName }}</a>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination
          style="float: right; margin-top: 15px; color: #fff"
          :show-total="(total) => `共 ${total} 条`"
          v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize"
          @change="onShowSizeChange"
          :total="datainfo.total"
          show-size-changer
        />
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { onMounted, reactive, ref, watch } from "vue";

import { kkFilePreview } from "@ghcloud/cube-utils";

import { getMarketList, emergencyFile, emergencyFileDetail } from "@/api/shennong/compre";
import NoData from "@/components/businessPanel/public/noData.vue";
import { openAlarmDetail } from "@/components/hooks/useAlarm";
import Modal from "@/components/modal-table/modal.vue";
import { isHttpUrl, fallback, getFileType, filterMarketOptions } from "@/utils/common";

const emit = defineEmits(["close"]);

interface Props {
  parameter: Record<string, any>;
  showModal: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "预案文件列表",
  showModal: false,
});

const keyword = ref("");
const datainfo = reactive<Record<string, any>>({
  classifyCode: props.parameter.classifyCode || undefined,
  levelCode: undefined,
  status: undefined,
  marketTenant: props.parameter.marketTenant || undefined,
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});
const selectForm = ref();
const getFileLeve = (value: string) => {
  return fileLevels.find((res) => res.value == value);
};
const getFileState = (value: string) => {
  return fileStates.find((res) => res.value == value);
};
const dataSource = ref([]);
const loadingDataSource = ref(false);
const marketlist = ref();
const fileTypesList = ref();

const table_header = ["序号", "文件名称", "所属市场", "文件类型", "文件级别", "文件到期日期", "文件状态", "附件文档"];
const fileLevels = [
  {
    label: "全部",
    value: null,
  },
  {
    label: "重要",
    value: "IMPORTANT",
    color: "#D9001B",
  },
  {
    label: "普通",
    value: "ORDINARY",
    color: "#5eacff",
  },
];
const fileStates = [
  {
    label: "所有",
    value: null,
  },
  {
    label: "正常",
    value: "NORMAL",
    color: "#19D9A9",
  },
  {
    label: "已过期",
    value: "EXPIRED",
    color: "#F59A23",
  },
];
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getTableData = async () => {
  const data = await getMarketList();
  marketlist.value = filterMarketOptions(data);
  const res = await emergencyFile({});
  fileTypesList.value = res?.classifyStatistics || [];
};
const getPreviewFileUrl = async () => {
  for (let i = 0; i < dataSource.value.length; i++) {
    try {
      const path = dataSource.value[i]?.documentFilePath || "";
      await openAlarmDetail(dataSource.value[i]);
      const baseUrl = sessionStorage.getItem("market-baseUrl");
      let url = "";
      if (!isHttpUrl(path)) {
        url = baseUrl + path;
      } else {
        url = path;
      }
      dataSource.value[i].previewFileUrl = url;
    } catch (error) {
      dataSource.value[i].previewFileUrl = "";
    }
  }
};
const downloadFile = (path) => {
  const link = document.createElement("a");
  link.href = path;
  link.download = path;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const typeList = ["doc", "docx", "excel", "pdf", "ppt", "txt"];
const preview = (item): void => {
  const path = item.previewFileUrl;
  const type = getFileType(item.documentFileName ?? "");
  if (typeList.includes(type)) {
    kkFilePreview({
      ...item,
      name: item.documentFileName,
      path: path,
    });
  } else {
    message.warn("该文件不支持预览");
    // downloadFile(path)
  }
};
const getData = async () => {
  try {
    dataSource.value = [];
    loadingDataSource.value = true;
    datainfo.keyword = keyword.value;
    let data = await emergencyFileDetail({ marketTenant: props.parameter.marketTenant, ...datainfo });
    dataSource.value = data.records;
    datainfo.total = data.total;
    await getPreviewFileUrl();
  } catch (error) {
  } finally {
    loadingDataSource.value = false;
  }
};

const query = () => {
  datainfo.pageNumber = 1;
  getData();
};

const reset = () => {
  keyword.value = "";
  Object.assign(datainfo, {
    classifyCode: undefined,
    levelCode: undefined,
    status: undefined,
    marketTenant: undefined,
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  getData();
};

const closeModal = () => {
  emit("close");
};
const initDataInfo = () => {
  Object.assign(datainfo, {
    classifyCode: props.parameter.classifyCode,
    levelCode: null,
    status: null,
    marketTenant: props.parameter.marketTenant,
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
};
watch(
  () => props.showModal,
  async () => {
    keyword.value = "";
    Object.assign(datainfo, {
      classifyCode: undefined,
      levelCode: undefined,
      status: undefined,
      marketTenant: undefined,
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    initDataInfo();
    if (props.showModal) {
      getTableData();
      getData();
    }
  },
);

onMounted(async () => {
  initDataInfo();
  getTableData();
  getData();
});
</script>

<style lang="less" scoped>
.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;
  width: 100%;

  div {
    width: 20%;
    padding: 0 15px;
    text-align: center;
    text-wrap: nowrap;
  }
}

.table_content {
  // display: flex;
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 5%;
    }
  }

  .content {
    display: flex;

    div {
      width: 20%;
      line-height: 48px;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10px;
    }
  }
}

.alarm-time-picker {
  width: 230px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
}

:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background-color: rgba(4, 17, 32, 0.92) !important;
}
</style>
<style lang="less" scoped>
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {
  background-color: rgba(4, 17, 32, 0.92) !important;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-item),
:deep(.ant-empty-small) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  // background-color: rgba(4, 17, 32, 0.92) !important;
  // background: rgba(216, 216, 216, 0.1) !important;
}

:deep(.ant-select-item-empty) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.ant-empty-small),
:deep(.ant-picker-input > input) {
  color: #fff !important;
}
</style>
