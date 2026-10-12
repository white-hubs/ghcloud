<template>
  <SubPanelTemplate title="理货审核率">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="ltransactionTime" @search="lchangeTransactionTime"></DateInlineForm>
    </template>
    <div class="supply-material-box">
      <div class="supply-material-left">
        <div class="centerBox">
          <div class="supply-material-name">理货审核总数</div>
          <div class="supply-material-name">
            <count-to :startVal="0" :endVal="arranged.total" :duration="2000" separator=""></count-to>
          </div>
          <!-- uptriangle 向上三角根据Prop改变 -->
          <!-- <div class="ringRatio">
              <span>环比</span>
           
              <div :class="['downtriangle', 3.4 > 0 && 'uptriangle']"></div>
              <div :class="[3.4 > 0 ? 'up' : 'down']">{{ 3.4 + "%" }}</div>
            </div> -->
        </div>
      </div>
      <div class="flex-content">
        <div class="supply-material-right">
          <div class="supply-material-info">
            <div class="supply-material-data">
              <span>理货合格数</span>
              <div class="ringRatio">
                <span>环比</span>
                <!-- uptriangle 向上三角根据Prop改变 -->
                <div :class="['downtriangle', 3.4 > 0 && 'uptriangle']"></div>
                <div :class="[3.4 > 0 ? 'up' : 'down']">{{ arranged.qoqPorkArrangeAuditPassed + "%" }}</div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="arranged.porkArrangeAuditPassedNum" :duration="2000" separator=""></count-to
              ><span class="unit" style="margin-left: 10px">{{ arranged.porkArrangeAuditPassed }}%</span>
            </div>
          </div>
        </div>
        <div class="supply-material-right">
          <div class="supply-material-info">
            <div class="supply-material-data">
              <span>理货不合格数</span>
              <div class="ringRatio">
                <span>环比</span>
                <!-- uptriangle 向上三角根据Prop改变 -->
                <div :class="['downtriangle', 3.4 > 0 && 'uptriangle']"></div>
                <div :class="[3.4 > 0 ? 'up' : 'down']">{{ arranged.qoqPorkArrangeAuditFailed + "%" }}</div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="arranged.porkArrangeAuditFailedNum" :duration="2000" separator=""></count-to
              ><span class="unit" style="margin-left: 10px">{{ arranged.porkArrangeAuditFailed }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { arrangedata } from "@/api/slide";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";

const ltransactionTime = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});

const timeList = [
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];
const arranged = reactive<any>({});

const lchangeTransactionTime = async () => {
  let data = await arrangedata({ type: setTimeType(ltransactionTime.value.timeType) });
  Object.assign(arranged, data);
};
</script>

<style scoped lang="less">
.ringRatio {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  color: #fff;

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }
}

.supply-material-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;

  .supply-material-left {
    position: relative;
    width: 132px;
    height: 118px;
    background: linear-gradient(90deg, rgba(41, 137, 255, 0.2) 0%, rgba(41, 137, 255, 0.2) 100%);

    .centerBox {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .supply-material-name {
      width: 100px;
      font-size: 14px;
      color: #fff;
    }
  }

  .supply-material-info {
    text-align: center;
    width: 180px;

    .supply-material-data {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 12px;
    }

    .supply-material-value {
      width: 180px;
      height: 28px;
      background: rgba(255, 255, 255, 0.1);
      line-height: 28px;
      text-align: center;
      color: #fff;
      font-size: 16px;

      .unit {
        font-size: 12px;
      }
    }
  }
}
</style>
