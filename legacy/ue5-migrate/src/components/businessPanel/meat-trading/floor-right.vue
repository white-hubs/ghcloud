<template>
  <div >
    <SubPanelTemplate title="白条交易数据">
      <template #extra>
        <DateInlineForm :timeList="timeList" v-model:modelValue="transactionTime" @search="changeTransactionTime"></DateInlineForm>
      </template>
      <div class="transaction-list" v-for="item in transactionData" :key="item.name">
        <div class="transaction-column">
          <span class="transaction-column-drop"></span>
          <span class="transaction-column-name">{{ item.name }}</span>
        </div>
        <div class="transaction-box">
          <div class="transaction-info" v-for="data in item.transactionInfoData" :key="item.name">
            <div class="transaction-info-title">
              <span>{{ data.name }}</span>
            </div>
            <div class="transaction-info-data">
              <count-to :startVal="0" :endVal="data.value" :duration="2000" separator=""></count-to><span class="unit">{{
                data.unit }}</span>
            </div>
            <div class="ringRatio">
              <span>环比</span>
              <!-- uptriangle 向上三角根据Prop改变 -->
              <div :class="['downtriangle', data.chainRatio > 0 && 'uptriangle']"></div>
              <div :class="[data.chainRatio > 0 ? 'up' : 'down']">
                {{ data.chainRatio + "%" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
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
                  <div :class="[3.4 > 0 ? 'up' : 'down']">{{arranged. qoqPorkArrangeAuditPassed+ "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="arranged.porkArrangeAuditPassedNum" :duration="2000"
                  separator=""></count-to><span class="unit"
                  style="margin-left:10px">{{arranged.porkArrangeAuditPassed}}%</span>
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
                  <div :class="[3.4 > 0 ? 'up' : 'down']">{{arranged. qoqPorkArrangeAuditFailed+ "%" }}</div>
                </div>
              </div>
              <div class="supply-material-value">
                <count-to :startVal="0" :endVal="arranged.porkArrangeAuditFailedNum" :duration="2000"
                  separator=""></count-to><span class="unit"
                  style="margin-left:10px">{{arranged.porkArrangeAuditFailed}}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { summary, supplydata ,arrangedata} from "@/api/slide";
import SubPanelTemplate from "../public/subPanelTemplate.vue";
import DateInlineForm from "../public/dateInlineForm.vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { ModelValueItf } from "../public/types";
import { setTimeType } from "@/utils/common";
const transactionData = ref<any>();
const timeData = ref('')
const beforeTimeData = ref('')
const transactionTime = ref<ModelValueItf>(  {
        timeType: 'THIS_WEEK',
        dateRange: []
    });
const ltransactionTime = ref<ModelValueItf>(  {
        timeType: 'THIS_WEEK',
        dateRange: []
    });
  const timeList = [
			{ label: "近7天", value: "THIS_WEEK" },
			{ label: "近30天", value: "THIS_MONTH" },
			{ label: "近1年", value: "THIS_YEAR" }
		]
const arranged=reactive<any>({})
const lchangeTransactionTime=async ()=>{
let data=await arrangedata({ type: setTimeType(ltransactionTime.value.timeType) })
Object.assign(arranged,data)

}
const changeTransactionTime = async () => {
  let data = await summary({ type: setTimeType(transactionTime.value.timeType) });
  let summarydata = await supplydata({ type: setTimeType(transactionTime.value.timeType) });
  transactionData.value = [
    {
      name: "交易量",
      transactionInfoData: [
        {
          name: "交易片数",
          value: data.tradeSlices,
          chainRatio: data.qoqTradeSlices,
          unit: "片",
        },
        {
          name: "交易重量",
          value: data.tradeWeight,
          chainRatio: data.qoqTradeWeight,
          unit: "kg",
        },
      ],
    },
    {
      name: "交易均价",
      transactionInfoData: [
        {
          name: "交易均价",
          value: data.tradeAverageAmount,
          chainRatio: data.qoqTradeAverageAmount,
          unit: "元/kg",
        },
        {
          name: "实际均价",
          value: data.actualAverageAmount,
          chainRatio: data.qoqActualAverageAmount,
          unit: "元/kg",
        },
      ],
    },
    {
      name: "交易金额",
      transactionInfoData: [
        {
          name: timeData.value+"交易金额",
          value: data.tradeAmount,
          chainRatio: data.qoqTradeAmount,
          unit: "元",
        },
        {
          name: timeData.value+"交易佣金",
          value: data.tradeCommission,
          chainRatio: data.qoqTradeCommission,
          unit: "元",
        },
      ],
    },
    {
      name: "供货量",
      transactionInfoData: [
        {
          name: timeData.value+"供货片数",
          value: summarydata.supplySlices,
          chainRatio: summarydata.qoqSupplySlices,
          unit: "片",
        },
        {
          name: timeData.value+"供货重量",
          value: summarydata.supplyWeight,
          chainRatio: summarydata.qoqSupplyWeight,
          unit: "kg",
        },
      ],
    },
  ];
};
</script>
<style scoped lang="less">
.transaction-box {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .transaction-info {
    margin: 10px;
    color: #fff;

    .transaction-info-title {
      font-size: 12px;

      img {
        width: 16px;
        height: 16px;
      }
    }

    .transaction-info-data {
      font-size: 22px;

      .unit {
        font-size: 12px;
      }
    }
  }
}

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

.transaction-list {
  margin-bottom: 20px;

  .transaction-column {
    display: flex;
    align-items: center;
    font-size: 14px;
    width: 340px;
    height: 24px;
    background: rgba(41, 137, 255, 0.2);
    padding-left: 8px;
    color: #fff;

    .transaction-column-drop {
      width: 4px;
      height: 4px;
      background: #ffab10;
      border-radius: 50%;
      margin-right: 8px;
    }
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
    background: linear-gradient(90deg,
        rgba(41, 137, 255, 0.2) 0%,
        rgba(41, 137, 255, 0.2) 100%);

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

.transaction-list,
.supply-material-box {
  font-size: 14px;
}
</style>
