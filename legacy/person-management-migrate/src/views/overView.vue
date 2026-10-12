<template>
  <div class="over_view">
    <div class="top">
      <div class="header">
        <span class="verticalLine primary-color-before">{{ pageTitle }}</span>
        <div class="header_btn" v-show="tab === 2">
          <a-space>
            <a-button
              v-for="(val, key, i) in btns"
              :key="i"
              :type="checkedBtn == key ? 'primary' : 'default'"
              size="middle"
              @click="getDateSubsce(key)"
              >{{ val }}</a-button
            >
            <a-range-picker
              v-model:value="dates"
              :disabled-date="disabledPriceRangeDate"
              format="YYYY-MM-DD HH:mm:ss"
              @change="changeDate"
              value-format="YYYY-MM-DD HH:mm:ss"
              :allowClear="false"
              :show-time="{ format: 'HH:mm:ss' }"
            />
          </a-space>
        </div>
      </div>
      <div class="line_tabs">
        <div class="tabs">
          <div :class="['tab', tab === 1 && 'active']" @click="changeTab(1)">
            人员结构
          </div>
          <div :class="['tab', 'ml32', tab === 2 && 'active']" @click="changeTab(2)">
            人员变动
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div v-if="tab === 1">
        <person-structure />
      </div>
      <div v-if="tab === 2">
        <person-exchange ref="refExchange" :timeType="checkedBtn" :period="dates" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Dayjs } from "dayjs";
import Moment from "moment";
import { onMounted, ref } from "vue";
import personExchange from "./charts/personExchange.vue";
import personStructure from "./charts/personStructure.vue";
import { useTitle } from "@/hooks/useTitle";
import { usePageName } from '@ghcloud/cube-utils'

let L = new URL("../assets/education.png", import.meta.url).href;
const title = useTitle();
interface exchangeTrendItem {
  timeFlag: string;
  inductionNum: string;
  regularWorkerNum: string;
  quitNum: string;
}
interface exchangeRespond {
  inductionNum: number;
  regularWorkerNum: number;
  quitNum: number;
  exchangeTrend: exchangeTrendItem[];
}
interface exchangExpose {
  getExchangePerson: () => void;
}
const { pageTitle } = usePageName()
const btns = ref({
  TODAY: "今日",
  THIS_WEEK: "本周",
  THIS_MONTH: "本月",
  THIS_YEAR: "全年",
});
const checkedBtn = ref<string>("TODAY");
const period = ref("");
const dates = ref<string[]>([]);
const selectKey = ref("jack");
const refExchange = ref<null | (InstanceType<typeof personExchange> & exchangExpose)>(
  null
);
const tab = ref(1);
const exchangeData = ref<exchangeRespond>({
  inductionNum: 0,
  regularWorkerNum: 0,
  quitNum: 0,
  exchangeTrend: [],
});
const startMap = new Map<string, string>([
  ["TODAY", Moment().startOf("days").format("YYYY-MM-DD HH:mm:ss")],
  ["THIS_WEEK", Moment().weekday(1).format("YYYY-MM-DD 00:00:00")],
  ["THIS_MONTH", Moment().startOf("months").format("YYYY-MM-DD HH:mm:ss")],
  ["THIS_YEAR", Moment().startOf("years").format("YYYY-MM-DD HH:mm:ss")],
]);
const changeDate = (value: [Dayjs, Dayjs], dateString: [string, string]) => {
  if (dates.value[0] == dates.value[1]) {
    dates.value[0] = Moment(dates.value[0]).format("YYYY-MM-DD 00:00:00");
    dates.value[1] = Moment().format("YYYY-MM-DD HH:mm:ss");
  }
  checkedBtn.value = "";
};
const disabledPriceRangeDate = (current: Dayjs) => {
  return current > Moment().endOf("day"); //禁用今天之后的日期
};
const getDateSubsce = (key: string) => {
  checkedBtn.value = key;
  const nowTime = Moment().format("YYYY-MM-DD HH:mm:ss");
  const dateValue = startMap.get(key) as string;

  dates.value = [dateValue, nowTime];
};
const changeTab = (index: number) => {
  tab.value = index;
};

onMounted(async () => {
  dates.value = [
    Moment().startOf("days").format("YYYY-MM-DD HH:mm:ss"),
    Moment().format("YYYY-MM-DD HH:mm:ss"),
  ];
});
</script>
<style lang="less" scoped>
.over_view {
  width: 100%;
  height: 100%;
  overflow: overlay;
  background: #eef2f5;

  .ml32 {
    margin-left: 32px;
  }

  .top {
    background: #fff;

    .header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f2f3f5;

      .verticalLine {
        font-size: 16px;
        height: 32px;
        color: #3d3d3d;
        font-weight: 500;
        font-family: PingFang SC-Medium;
      }
    }

    .line_tabs {
      padding: 16px 16px 6px;

      .tabs {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: #fafafa;

        .tab {
          width: 56px;
          font-size: 14px;
          font-family: PingFang SC;
          cursor: pointer;
          font-weight: 400;
          color: #000;
        }

        .active {
          color: var(--ant-primary-color);
          position: relative;

          &::after {
            content: "";
            height: 2px;
            width: 60%;
            position: absolute;
            bottom: -10px;
            left: 50%;
            margin-left: -30%;
            background: var(--ant-primary-color);
          }
        }
      }
    }
  }

  .content {
    margin-top: 16px;
  }
}
</style>
