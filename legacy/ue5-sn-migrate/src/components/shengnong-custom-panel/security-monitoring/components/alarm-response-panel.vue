<template>
  <SubPanelTemplate title="报警响应情况" class="device-statistics" image="bj.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="workOrderTime"
        @search="changeReceptionTrendsTime"
      ></DateInlineForm>
    </template>
    <div class="device-statistics-table">
      <div>
        <RollTable
          :column="bjColumns"
          :data="bjListData"
          class="roll-table"
          @click-row="openModel"
        >
          <template #index="{ record }">
            <div
              style="margin: auto"
              :class="
                record.index == 1 ? 'levelone' : record.index == 2 ? 'leveltwo' : 'level'
              "
            >
              {{ record.index }}
            </div>
          </template>
        </RollTable>
      </div>
    </div>
  </SubPanelTemplate>
  <modal-alarm-table
    :show-modal="alarmModalShow"
    @close="closeModal"
    :parameter="alarmParameter"
  ></modal-alarm-table>
</template>
<script setup lang="ts">
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";
import modalAlarmTable from "@/components/modal-table/modal-alart-sn-table.vue";
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import { px2rem, autoPage } from "@/utils/common";
import { storeMarket } from "@/piniaStore/other";
import { alarmConfirmSituation } from "@/api/shennong/alarm";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const alarmModalShow = ref<boolean>(false);
const alarmParameter = ref<Record<string, any>>({
  applicationCode: props.applicationCode,
  alarmStatus: "ALARM_UN_CONFIRMED",
  alarmTypeCode: props.applicationCode,
});
const closeModal = () => {
  alarmModalShow.value = false;
};
const openModel = (record) => {
  alarmModalShow.value = true;
  alarmParameter.value = Object.assign(alarmParameter.value, record);
};
const workOrderTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const bjListData = ref();
const bjColumns = [
  {
    title: "排名",
    dataIndex: "index",
    slots: {
      customRender: "index",
    },
  },
  {
    title: "市场名称",
    dataIndex: "name",
  },
  {
    title: "未确认报警数",
    dataIndex: "alarm",
  },
];
const bjPage = reactive({
  total: 0,
  pageSize: 50,
  pageNumber: 1,
  pages: 0,
});
const changeReceptionTrendsTime = async () => {
  alarmParameter.value.dateRange = workOrderTime.value.dateRange;
  let param = {
    period: workOrderTime.value.dateRange.join(","),
    type: workOrderTime.value.timeType,
    pageSize: bjPage.pageSize,
    pageNumber: bjPage.pageNumber,
    applicationCode: props.applicationCode,
  };
  let { records, total, pages } = await alarmConfirmSituation(param);
  autoPage(bjPage, total, pages);
  bjListData.value = [];
  if (Array.isArray(records) && records.length > 0) {
    bjListData.value = records
      .sort((a, b) => b.totalNum - a.totalNum)
      .map((item, index) => {
        return {
          ...item,
          index: index + 1,
          name: item.marketName,
          alarm: item.totalNum,
        };
      });
  }
};

onMounted(() => {
    changeReceptionTrendsTime()
});
</script>
<style scoped lang="less">
.device-statistics {
  .device-statistics-table {
    .table-header {
      width: 100%;
      height: 36px;
      background: rgba(56, 145, 255, 0.25);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid rgba(86, 142, 255, 0.302);
      display: flex;
      align-items: center;

      span {
        width: 30%;
        text-align: center;
        line-height: 36px;
        font-weight: 400;
        color: #ffffff;
        font-size: 14px;

        &:first-child {
          width: 80px;
        }

        &:not(&:first-child) {
          width: calc((100% - 80px) / 2);
        }
      }
    }

    .table-body {
      overflow: hidden;
      height: 200px;

      .item {
        height: 36px;
        font-size: 12px;
        font-weight: 400;
        color: #d9e7ff;
        line-height: 36px;
        display: flex;
        margin-bottom: 15px;

        span {
          width: 33%;
          text-align: center;

          &:first-child {
            width: 80px;
          }

          &:not(&:first-child) {
            width: calc((100% - 80px) / 2);
          }

          &:last-child {
            color: #ffc700;
          }
        }
      }
    }
  }
}

.sort {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  margin-right: 11px;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989ff;
  color: #2f8dff;
  display: inline-block;

  &.up_sort {
    background: rgba(21, 58, 105, 0.3);
    border: 1px solid #79a0d0;
    color: #e6f7ff;
  }
}

.eventAlarmItem .sort {
  color: #e6f7ff;
  background: rgba(21, 58, 105, 0.3);
  border: 1px solid #79a0d0;
}

.eventAlarmItem:nth-child(1) .sort {
  background: rgba(241, 69, 69, 0.302);
  border: 1px solid #f14545;
  color: #fff;
}

.eventAlarmItem:nth-child(2) .sort {
  background: rgba(255, 171, 16, 0.3);
  border: 1px solid #ffab10;
  color: #fff;
}

.eventAlarmItem:nth-child(3) .sort {
  color: #fff;
  background: rgba(50, 142, 255, 0.2);
  border: 1px solid #2989ff;
}

.levelone {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(241, 69, 69, 0.302);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ed4949;
  color: #fff;
  font-size: 16px;
}
.level {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(63, 124, 223, 0.102);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #3f7cdf;
  color: #fff;
  font-size: 16px;
}
.leveltwo {
  width: 30px;
  line-height: 18px;
  border-radius: 2px;
  font-size: 16px;
  text-align: center;
  background: rgba(63, 124, 223, 0.102);
  border-radius: 2px 2px 2px 2px;
  opacity: 1;
  border: 1px solid #ffaa00;
  color: #fff;
  font-size: 16px;
}
</style>
