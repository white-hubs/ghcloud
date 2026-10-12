<template>
  <div class="panel alarm-list-panel flex-column">
    <div class="search flex-center">
      <a-form :model="search">
        <a-form-item>
          <a-config-provider :locale="zhCN">
          <a-range-picker v-model:value="search.period" value-format="YYYY-MM-DD" />
          </a-config-provider>
        </a-form-item>
        <a-form-item>
          <a-space :size="16">
            <a-input
              v-model:value="search.keyword"
              placeholder="请输入报警事件名称"
            ></a-input>
            <a-button type="primary" @click="searchAlarm">搜索</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <div class="alarm-content">
      <div
        v-if="unReadAlarmList.length"
        class="alarm-list"
        ref="alarmListRef"
        @scroll="scrool"
      >
        <a-card
          v-for="item in unReadAlarmList"
          size="small"
          :title="item.alarmEventName"
          @click="openAlarmModal(item)"
        >
          <template #extra>
            <span>{{ moment(item.alarmTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
          </template>
          <div class="alarm-info flex-between">
            <div class="icon" :style="alarmStyle(item)">
              <alert-outlined />
            </div>
            <div class="describe">
              <p class="equipment-name">
                {{ item.alarmTargetName }}
              </p>
              <p>{{ item.areaName }}</p>
            </div>
          </div>
        </a-card>
      </div>
      <no-data v-else></no-data>
    </div>
  </div>
</template>
<script setup lang="ts">
import zhCN from 'ant-design-vue/lib/locale/zh_CN';
import { alarmrecords } from "@/api/alarm";
import { computed, onMounted, reactive, ref, nextTick } from "vue";
import moment from "moment";
import { AlertOutlined } from "@ant-design/icons-vue";
import { hex2Rgba } from "@/utils/common";
import bus from "@/utils/bus";
import enumerateData from "@/utils/enumeratie";
import NoData from "../businessPanel/public/noData.vue";
const { alarmLeaveOptions } = enumerateData();
const alarmListRef = ref();
const unReadAlarmList = ref([]);
const search = reactive({
  period: [],
  keyword: "",
});
const page = reactive({
  total: 0,
  pageSize: 10,
  pageNumber: 1,
  pages: 0,
});
onMounted(() => {
  requestUnreadAlarmList();
  nextTick(() => {
    setTimeout(() => {
      alarmListRef.value.addEventListener("scrοll", scrool);
    }, 500);
  });
});
const requestUnreadAlarmList = async () => {
  const period =
    search.period && search.period.length
      ? [
          moment(search.period[0]).format("YYYY-MM-DD 00:00:00"),
          moment(search.period[1]).format("YYYY-MM-DD 23:59:59"),
        ]
      : [];
  const params = {
    keyword: search.keyword,
    period: period.length ? period.join(",") : "",
    pageSize: page.pageSize,
    pageNumber: page.pageNumber,
  };
  const res = await alarmrecords(params);
  unReadAlarmList.value = [...unReadAlarmList.value, ...res.records];
  page.total = res.total;
  page.pages = res.pages;
};
const scrool = (e) => {
  let clientHeight = e.target.clientHeight;
  let scrollTop = e.target.scrollTop;
  let scrollHeight = e.target.scrollHeight;
  if (scrollTop + clientHeight + 2 >= scrollHeight) {
    if (page.pageNumber < page.pages) {
      page.pageNumber++;
      requestUnreadAlarmList();
    }
  }
};
const alarmStyle = computed(() => (item) => {
  const data = alarmLeaveOptions.value.find((element) => {
    if (item.alarmLevelCode === element.value) {
      return element;
    }
  });
  return `color:${data.color};background:${hex2Rgba(data.color, 0.2)}`;
});
const openAlarmModal = (item) => {
  if (window.config.entry === 'views') {
    bus.emit("setOpenAlarmModal", item);
  }else{
  bus.emit("openAlarmModal", item);
  }
};
const searchAlarm = () => {
  page.pageNumber = 1;
  unReadAlarmList.value = [];
  requestUnreadAlarmList();
};
</script>
<style lang="less">
.ant-picker-clear {
  background-color: #000;
}
.alarm-list-panel {
  height: 100%;
  overflow: hidden;
  .alarm-content {
    height: calc(100% - 100px);
    overflow: hidden;
  }
  .alarm-list {
    height: 100%;
    overflow: auto;
    .ant-card {
      background: rgba(9, 18, 33, 0.2);
      color: #ffffff;
      margin-bottom: 12px;
      cursor: pointer;
    }
    .ant-card-bordered {
      border: none;
    }
    .ant-card-head {
      border-bottom: 1px solid rgba(217, 192, 192, 0.1);
      color: #ffffff;
    }
    .ant-card-extra {
      color: #ffffff;
    }
    .alarm-info {
      width: 100%;
      .icon {
        padding: 4px 12px;
        border-radius: 5px;
        margin-right: 16px;
        font-size: 30px;
      }
      .describe {
        flex: 1;
        .equipment-name {
          cursor: pointer;
        }
      }
    }
  }
}

</style>
