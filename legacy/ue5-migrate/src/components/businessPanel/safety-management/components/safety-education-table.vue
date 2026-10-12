<template>
  <Modal title="安全教育" :show="showModal" @close="closeModal" wrapClassName="modal-table-device">
    <div>
      <a-select ref="select" v-model:value="dataType" style="width: 120px"  @change="handleChange">
        <a-select-option value="培训任务">培训任务</a-select-option>
        <a-select-option value="考试任务">考试任务</a-select-option>
      </a-select>
    </div>
    <div class="modal-layout" v-if="dataType === '培训任务'">
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header1">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.name }}</div>
                <div>{{ item.themeName||'--' }}</div>
                <div>{{ item.cultivateTarget === 'STAFF'? '员工培训' : '商户培训'}}</div>
                <div>{{ item.cultivateMode === 'ONLINE'? '线上培训' : '线下培训'}}</div>
                <div>{{ item.chargeUserName||'--' }}</div>
                <div>{{ item.cultivateEndTime?dayjs(item.cultivateEndTime).format('YYYY-MM-DD'):"--" }}</div>
                <div>{{ item.cultivateAddress}}</div>
                <div>{{ item.cultivateTaskStatus  }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
      </div>
    </div>
    <div class="modal-layout" v-else>
      <div style="margin-top: 15px">
        <div class="table_header">
          <div v-for="item in table_header2">{{ item }}</div>
        </div>
        <a-spin :spinning="loading">
          <div class="table_content">
            <div v-if="dataSource.length === 0" class="no-content">
              <NoData />
            </div>
            <div v-for="item in dataSource">
              <div class="content">
                <div>{{ item.name }}</div>
                <div>{{ item.themeName||'--' }}</div>
                <div>{{ item.examTaskType=== 'STAFF_EXAM' ? '员工考核' : '商户考核'}}</div>
                <div>{{ item.chargeUserName||'--' }}</div>
                <div>{{ item.examStartTime?dayjs(item.examStartTime).format('YYYY-MM-DD'):"--" }}</div>
                <div>{{ item.examEndTime?dayjs(item.examEndTime).format('YYYY-MM-DD'):"--" }}</div>
                <div>{{ item.text||'--' }}</div>
                <div>{{ item.cultivateTaskStatus||'--' }}</div>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
      <div style="height: 30px">
        <a-pagination style="float: right; margin-top: 15px" v-model:current="datainfo.pageNumber"
          v-model:page-size="datainfo.pageSize" @change="onShowSizeChange" :total="datainfo.total" />
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal.vue";
import { reactive, ref, watch } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";

import dayjs from 'dayjs';
import { cultivateTaskPage, examTaskPage } from '@/api/safety-education'
interface Props {
  parameter?: any;
  showModal: boolean;
}
const loading = ref(false);
const emit = defineEmits(["close"]);

const props = withDefaults(defineProps<Props>(), {
  title: "安全教育",
  showModal: false,
  parameter: {},
});
const datainfo = reactive({
  keyword: "",
  pageSize: 10,
  pageNumber: 1,
  total: 0,
});

const dataType = ref('培训任务')
const dataSource = ref([]);
const TraningStatusOptions = [
  { label: '已发布', value: "PUBLISHED" },
  { label: '待发布', value: "WAIT_PUBLISH" },
  { label: '进行中', value: "TRAINING" },
  { label: '已完成', value: "OVER" }
]
const ExamTaskStatusOptions = [
  { label: '待发布', value: 'UNPUBLISHED' },
  { label: '待考试', value: 'STAY_EXAM' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已结束', value: 'ENDED' },
]
const table_header1 = ["任务名称", "培训主题", "培训类型", "培训形式","负责人","截至时间",'培训地点','状态'];
const table_header2 = ["任务名称", "考试主题", "考试类型", "负责人","开始时间","结束时间",'试卷','状态'];
const handleChange = ()=>{
  datainfo.pageNumber = 1;
  getData();
}
const onShowSizeChange = (current, size) => {
  datainfo.pageNumber = current;
  datainfo.pageSize = size;
  getData();
};
const getData = async () => {
  try {
    loading.value = true;
    if(dataType.value === '培训任务'){
      const res = await cultivateTaskPage({...datainfo,...props.parameter})
      dataSource.value = res.records.map(item=>{
        return {
          ...item,
          cultivateTaskStatus:TraningStatusOptions.find(i=>i.value === item.cultivateTaskStatus)?.label,
        }
      })
      datainfo.total=res.total
    }else{
      const res = await examTaskPage({...datainfo,...props.parameter})
      dataSource.value = res.records.map(item=>{
        return {
          ...item,
          examTaskStatus:ExamTaskStatusOptions.find(i=>i.value === item.examTaskStatus)?.label,
        }
      })
      datainfo.total=res.total
    }

  } catch (error) {
  }
  loading.value = false;
};

const closeModal = () => {
  Object.assign(datainfo, {
    keyword: "",
    pageSize: 10,
    pageNumber: 1,
    total: 0,
  });
  emit("close");
};
watch(
  () => props.showModal,
  () => {
    if(props.showModal){
      dataSource.value=[]
      getData();
    }
  }
);
</script>

<style lang="less" scoped>
:deep(.ant-select-selection-item) {
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: #fff;
}

:deep(.ant-picker-input > input) {
  color: #fff;
}

:deep(.ant-picker-input > input::placeholder) {
  color: #fff;
}

:deep(.ant-table-thead > tr > th) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td) {
  color: #fff;
}

:deep(.ant-table-tbody > tr > td.ant-table-cell-row-hover) {
  background-color: transparent;
}

:deep(.ant-select-selector) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-picker-range) {
  background: rgba(216, 216, 216, 0.1) !important;
  border: 1px solid rgba(96, 112, 128, 0.6) !important;
}

:deep(.ant-table-cell) {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  border-bottom: rgba(16, 40, 68, 0.8);
}

.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 20%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;
  min-height: 200px;

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
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

.overflow {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap;
}

:deep(.ant-pagination-item-link) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
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

:deep(.modal-width) {
  width: 940px !important;
}
</style>
<style lang="less">
.modal-table-device {
  .modal-width {
    width: 940px !important;
  }

  a {
    color: #2989FF;
  }
}
</style>