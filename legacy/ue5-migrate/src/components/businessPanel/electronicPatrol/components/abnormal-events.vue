<template>
  <div class="modal-layout">
    <div class="table-top">
      <a-form ref="selectForm" :model="dataInfo" layout="inline">
        <a-form-item >
          <!-- <a-select
          ref="select"
          v-model:value="dataInfo.value1"
          style="width: 120px"
          placeholder="选择点位"
        >
       </a-select> -->
       <a-input v-model:value="dataInfo.keyword"  placeholder="请输入报警内容"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="small" @click="query" :loading="loadingDataSource">查询</a-button>
          <a-button size="small" style="margin-left: 15px" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div style="margin-top: 15px">
      <div class="table_header">
        <div v-for="item in table_header">{{ item }}</div>
      </div>
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="dataSource.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else v-for="(item, index) in dataSource">
            <div class="content">
              <div>{{ item.alarmContent }}</div>
              <div>{{ item.alarmTime }}</div>
              <div>{{ item.alarmPoint }}</div>
              <div>{{item.patrolRecordId }}</div>
              <div>{{ item.alarmResult }}</div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
    <div style="height: 30px">
      <a-pagination style="float: right; margin-top: 15px" v-model:current="dataInfo.pageNumber"
        v-model:page-size="dataInfo.pageSize" @change="onShowSizeChange" :total="dataInfo.total" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import enumerateData from "@/utils/enumeratie";
import dayjs, { Dayjs } from "dayjs";
import NoData from "@/components/businessPanel/public/noData.vue";
import { organizationsList } from "@/api/ouaa";
import { looseWorksList } from "@/api/shennong/compre";
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import {alarmPage} from "@/api/maintain";

const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();

const entry = ref(window.config.entry);
const selectForm = ref();
const emit = defineEmits(["close"]);
const dataInfo = reactive<Record<string, any>>({
  pageSize: 10,
  pageNumber: 1,
  keyword:'',
  total: 0,
});

const dataSource = ref([]);
const loadingDataSource = ref(false);
const departmentData = ref([]);
const table_header = [
  "报警内容",
  "报警时间",
  "报警地点",
  "巡检记录ID",
  "处理结果",
];
const onShowSizeChange = (current, size) => {
  dataInfo.pageNumber = current;
  dataInfo.pageSize = size;
  getData();
};

const getlist = async () => {
  const data = await alarmPage(dataInfo);
  dataSource.value = data.records;
  dataInfo.total = data.total;
};
const getData = async () => {
  loadingDataSource.value = true;
  getlist();
  loadingDataSource.value = false;
};
const query = () => {
  getData();
};
const reset = () => {
  Object.assign(dataInfo, {
  keyword:'',
  pageSize: 10,
  pageNumber: 1,
  });
  getData();
};
const closeModal = () => {
  emit("close");
};

onMounted(() => {
  getData();
});
</script>

<style lang="less" scoped>
:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    padding: 0 15px;
    text-align: center;
  }
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

.table_content {
  // display: flex;
  color: #fff;
  height:500px;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 10%;
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
      color: rgba(217, 231, 255, 1);
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.alarm-time-picker {
  width: 250px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
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
  background: rgba(4, 17, 32, 0.8) !important;
}

.UNDERWAY {
  color: #ffaa26 !important;
}

.COMPLETED {
  color: #00c6bc !important;
}

.WAIT_ACCEPT {
  color: #6b2aff !important;
}
</style>
<style lang="less">
  .modal-width {
    width: 1250px !important;
  }
</style>
