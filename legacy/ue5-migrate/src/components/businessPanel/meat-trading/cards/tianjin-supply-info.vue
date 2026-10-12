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
            <count-to :startVal="0" :endVal="Number(supplyInformationData.supplier || 0)" :duration="2000" separator=""></count-to
            ><span class="unit">户</span>
          </div>
          <div class="ringRatio">
            <span>环比</span>
            <!-- uptriangle 向上三角根据Prop改变 -->
            <div :class="['downtriangle', Number(supplyInformationData.qoqSupplier || 0) > 0 && 'uptriangle']"></div>
            <div :class="[Number(supplyInformationData.qoqSupplier || 0) > 0 ? 'up' : 'down']">
              {{ Number(supplyInformationData.qoqSupplier || 0).toFixed(2) + "%" }}
            </div>
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
                <div :class="['downtriangle', Number(supplyInformationData.qoqSupplyWeight || 0) > 0 && 'uptriangle']"></div>
                <div :class="[Number(supplyInformationData.qoqSupplyWeight || 0) > 0 ? 'up' : 'down']">
                  {{ Number(supplyInformationData.qoqSupplyWeight || 0).toFixed(2) + "%" }}
                </div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="Number(supplyInformationData.supplyWeight || 0)" separator=""></count-to
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
                <div :class="[Number(supplyInformationData.qoqSupplySlices || 0) > 0 ? 'up' : 'down']">
                  {{ Number(supplyInformationData.qoqSupplySlices || 0).toFixed(2) + "%" }}
                </div>
              </div>
            </div>
            <div class="supply-material-value">
              <count-to :startVal="0" :endVal="Number(supplyInformationData.supplySlices || 0)" :duration="2000" separator=""></count-to
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

import { porkBimStatSupplyData } from "@/api/slide-tianjin";
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
  { label: "今日", value: "TODAY" },
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
  min-width: 120px; // 增加最小宽度，确保有足够空间
  width: auto; // 改为自适应宽度
  color: #fff;
  font-size: 14px;
  gap: 4px; // 添加元素间距

  .ratio-label {
    white-space: nowrap; // 防止"环比"文字换行
    flex-shrink: 0; // 防止被压缩
  }

  .ratio-value {
    white-space: nowrap; // 防止百分比数值换行
    flex-shrink: 0; // 防止被压缩
    min-width: 0; // 允许内容溢出时正常显示
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    transform: rotate(180deg);
    flex-shrink: 0; // 防止三角形被压缩
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  // 添加颜色样式
  .up {
    color: #ffcece;
  }

  .down {
    color: #d2fff3;
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
    width: 170px;

    .supply-material-data {
      display: flex;
      justify-content: space-between;
      color: #fff;
      font-size: 12px;
    }

    .supply-material-value {
      width: 170px;
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
