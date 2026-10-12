<template>
  <SubPanelTemplate title="供货信息">
    <template #extra>
      <DateInlineForm :timeList="timeList" v-model:modelValue="supplyMaterial" @search="changeSupplyMaterialTime"></DateInlineForm>
    </template>
    <div class="supply-material-box">
      <div class="supply-material-left">
        <div class="centerBox">
          <div class="supply-material-name">供货商户数</div>
          <div class="supply-material-name">
            <count-to :startVal="0" :endVal="Number(supplyInformationData.supplier)" :duration="2000" separator=""></count-to
            ><span class="unit">户</span>
          </div>
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', supplyInformationData.qoqSupplier > 0 && 'uptriangle']"></div>
            <div :class="[supplyInformationData.qoqSupplier > 0 ? 'up' : 'down']">{{ supplyInformationData.qoqSupplier + "%" }}</div>
          </div>
        </div>
      </div>
      <div class="flex-content">
        <div class="supply-material-right">
          <div class="supply-material-info">
            <div class="supply-material-data">
              <span>供货重量</span>
              <div class="ringRatio">
                <span>环比</span>
                <!-- uptriangle 向上三角根据Prop改变 -->
                <div :class="['downtriangle', supplyInformationData.qoqSupplyWeight > 0 && 'uptriangle']"></div>
                <div :class="[supplyInformationData.qoqSupplyWeight > 0 ? 'up' : 'down']">
                  {{ supplyInformationData.qoqSupplyWeight + "%" }}
                </div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="Number(supplyInformationData.supplyWeight)" separator=""></count-to
              ><span class="unit">kg</span>
            </div>
          </div>
        </div>
        <div class="supply-material-right">
          <div class="supply-material-info">
            <div class="supply-material-data">
              <span>供货片数</span>
              <div class="ringRatio">
                <span>环比</span>
                <!-- uptriangle 向上三角根据Prop改变 -->
                <div :class="['downtriangle', supplyInformationData.qoqSupplySlices > 0 && 'uptriangle']"></div>
                <div :class="[supplyInformationData.qoqSupplySlices > 0 ? 'up' : 'down']">
                  {{ supplyInformationData.qoqSupplySlices + "%" }}
                </div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="supplyInformationData.supplySlices" :duration="2000" separator=""></count-to
              ><span class="unit">片</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

import { porkBimStatSupplyData } from "@/api/slide";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { setTimeType } from "@/utils/common";

const supplyMaterial = ref<ModelValueItf>({
  timeType: "THIS_WEEK",
  dateRange: [],
});

const supplyInformationData = reactive({
  supplier: 0,
  qoqSupplier: 0,
  supplyWeight: 0,
  qoqSupplyWeight: 0,
  supplySlices: 0,
  qoqSupplySlices: 0,
});

const timeList = [
  { label: "近7天", value: "THIS_WEEK" },
  { label: "近30天", value: "THIS_MONTH" },
  { label: "近1年", value: "THIS_YEAR" },
];
const changeSupplyMaterialTime = () => {
  supplyInformationEvent();
};

// 供货信息
const supplyInformationEvent = async () => {
  let res = await porkBimStatSupplyData({ type: setTimeType(supplyMaterial.value.timeType) });
  Object.assign(supplyInformationData, res);
  supplyInformationData.qoqSupplier = Number(supplyInformationData.qoqSupplier);
};
</script>

<style scoped lang="less">
.ringRatio {
  display: flex;
  align-items: center;
  // justify-content: space-between;
  width: 100px;
  color: #fff;
  font-size: 16px;

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
      font-size: 14px;
      color: #fff;
    }
  }

  .supply-material-info {
    text-align: center;
    width: 160px;

    .supply-material-data {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 12px;
    }

    .supply-material-value {
      width: 160px;
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

.flex-content {
  width: 150px;
  height: 118px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
