<template>
  <Modal title="安全风险指数列表" :show="showModal && !show" @close="closeModal">
    <div class="rank-main">
      <div class="name" style="display: flex; justify-content: space-between">
        <div>报警情况</div>
        <div>时间统计维度：以周为单位计分呈现上周的风险指数</div>
      </div>
      <div class="title">
        <div class="name">
          <img :src="leftPng" alt="" style="margin-bottom: 5px" />
          <span style="margin-left: 20px"> 该项目本周总计得分</span>
          <count-to :startVal="0" :endVal="props.riskDetail?.alarmSituationRiskIndex?.riskIndex ?? 0" :duration="2000"
            separator="" style="font-size: 28px; margin-left: 10px"></count-to>
          <span class="unit">分</span>
        </div>
        <div>
          <img :src="rightPng" alt="" />
        </div>
      </div>
      <div class="content">
        <div class="alarm-info" v-for="item in props.riskDetail?.alarmSituationRiskIndex?.alarmLevelIndexDetails">
          <div class="alarm-title">
            <img :src="getRiskImage(levelImg[item.alarmLevel][0])" alt="" />
            <div class="top">{{ level[item.alarmLevel] }}</div>
            <img :src="getRiskImage(levelImg[item.alarmLevel][1])" alt="" />
          </div>
          <div class="alarm-content">
            <div>
              报警数
              <count-to :startVal="0" :endVal="item.totalNum" :duration="2000" separator=""
                style="font-size: 24px; margin-left: 30px"></count-to>
              <span class="unit">个</span>
            </div>
            <div class="dotto"></div>
            <div>
              该项总计得分
              <count-to :startVal="0" :endVal="item.riskIndex" :duration="2000" separator=""
                style="font-size: 24px"></count-to>
              <span class="unit">分</span>
            </div>
          </div>
        </div>
      </div>

      <div class="name" style="margin-top: 15px">报警未响应情况</div>
      <div class="title">
        <div class="name">
          <img :src="getRiskImage('left.png')" alt="" style="margin-bottom: 5px" />
          <span style="margin-left: 20px"> 该项目本周总计得分</span>
          <count-to :startVal="0" :endVal="props.riskDetail?.alarmUnConfirmedRiskIndex?.riskIndex ?? 0" :duration="2000"
            separator="" style="font-size: 28px; margin-left: 10px"></count-to>
          <span class="unit">分</span>
        </div>

        <div>
          <img :src="getRiskImage('right.png')" alt="" />
        </div>
      </div>
      <div class="content">
        <div class="alarm-info" v-for="item in props.riskDetail?.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails">
          <div class="alarm-title">
            <img :src="getRiskImage(levelImg[item.alarmLevel][0])" alt="" />
            <div class="top">{{ level[item.alarmLevel] }}</div>
            <img :src="getRiskImage(levelImg[item.alarmLevel][1])" alt="" />
          </div>
          <div class="alarm-content">
            <div>
              未响应报警数
              <count-to :startVal="0" :endVal="item.totalNum" :duration="2000" separator=""
                style="font-size: 24px; margin-left: 30px"></count-to>
              <span class="unit">个</span>
            </div>
            <div class="dotto"></div>
            <div>
              该项总计得分
              <count-to :startVal="0" :endVal="item.riskIndex" :duration="2000" separator=""
                style="font-size: 24px"></count-to>
              <span class="unit">分</span>
            </div>
          </div>
        </div>
      </div>
      <div class="three_alarm">
        <div class="three_content">
          <div class="name" style="margin-bottom: 10px">隐患情况</div>
          <div class="alarm-info">
            <div class="alarm-content">
              <div>
                <img :src="getRiskImage('warn.png')" alt="" /> 隐患数
                <count-to :startVal="0" :endVal="props.riskDetail?.hiddenDangerRiskIndex?.totalNum" :duration="2000"
                  separator="" style="font-size: 24px; margin-left: 50px"></count-to>
                <span class="unit">个</span>
              </div>
              <div class="dotto"></div>
              <div>
                该项总计得分
                <img :src="getRiskImage('bluej.png')" alt="" style="margin-bottom: 5px" />
                <count-to :startVal="0" :endVal="props.riskDetail?.hiddenDangerRiskIndex?.riskIndex" :duration="2000"
                  separator="" style="font-size: 24px; margin-left: 40px"></count-to>
                <span class="unit">分</span>
              </div>
            </div>
          </div>
        </div>
        <div class="three_content">
          <div class="name" style="margin-bottom: 10px">隐患未响应情况</div>
          <div class="alarm-info">
            <div class="alarm-content">
              <div>
                <img :src="getRiskImage('warn.png')" alt="" /> 未响应隐患数
                <count-to :startVal="0" :endVal="props.riskDetail?.hiddenDangerUnConfirmedRiskIndex?.totalNum"
                  :duration="2000" separator="" style="font-size: 24px; margin-left: 30px"></count-to>
                <span class="unit">个</span>
              </div>
              <div class="dotto"></div>
              <div>
                该项总计得分
                <img :src="getRiskImage('bluej.png')" alt="" style="margin-bottom: 5px" />
                <count-to :startVal="0" :endVal="props.riskDetail?.hiddenDangerUnConfirmedRiskIndex?.riskIndex"
                  :duration="2000" separator="" style="font-size: 24px; margin-left: 40px"></count-to>
                <span class="unit">分</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="name" style="margin-top: 10px">风险源建档情况</div>
        <div class="content">
          <div class="alarm-info" v-for="item in props.riskDetail?.propertyFilingRiskIndex?.propertyCategoryDetails">
            <img class="alarm-info-item-img" :src="getSnImage('put-on-record.png')" alt="" />
            <div>
              <div class="alarm-title">
                <div>{{item.riskIndex !== 0? equipment[item.propertyCategory]:equipmentAlready[item.propertyCategory] }}
                </div>
                <img :src="getRiskImage('bluej.png')" alt="" />
              </div>
              <div v-if="item.riskIndex !== 0" class="alarm-content">
                <div>
                  该项总计得分
                  <count-to :startVal="0" :endVal="item.riskIndex" :duration="2000" separator=""
                    style="font-size: 24px"></count-to>
                  <span class="unit">分</span>
                </div>
              </div>
              <div v-else class="alarm_content">
                <div>
                  该项不记分
                </div>
              </div>
            </div>
          </div>
          <NoData
            v-if="!props.riskDetail||!props.riskDetail?.propertyFilingRiskIndex||!props.riskDetail?.propertyFilingRiskIndex?.propertyCategoryDetails.length" />
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "../../../../components/modal-table/modal.vue";
import { ref } from "vue";
import { getSnImage } from "@/utils/getImage";
import { RiskDetail } from './risk-types'
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import NoData from '../../public/noData.vue'

const UE5_SN_RISK_ASSETS = '/resource/v1/ue5-sn-migrate/components/businessPanel/security-overview/assets'
const leftPng = `${UE5_SN_RISK_ASSETS}/left.png`
const rightPng = `${UE5_SN_RISK_ASSETS}/right.png`
const getRiskImage = (url: string): string => `${UE5_SN_RISK_ASSETS}/${url}`
interface Props {
  parameter?: any;
  showModal: boolean;
  riskDetail: RiskDetail;
}
const level = {
  ONE_LEVEL: "一级报警",
  TWO_LEVEL: "二级报警",
  THREE_LEVEL_AND_FOUR_LEVEL: "三级报警/四级报警",
};
const levelImg = {
  ONE_LEVEL: ["a0.png", "redj.png"],
  TWO_LEVEL: ["a0.png", "yellowj.png"],
  THREE_LEVEL_AND_FOUR_LEVEL: ["a0.png", "yellowj.png"],
  FOUR_LEVEL: ["a0.png", "bluej.png"],
};
const equipment = {
  FLAMMABLE_EQUIPMENT: "当前市场易燃设备未建档",
  FIRE_FIGHTING_EQUIPMENT: "当前市场消防设备未建档",
  TRANSPORT_DEVICES: "当前市场电动车设备未建档",
};
const equipmentAlready = {
  FLAMMABLE_EQUIPMENT: "当前市场易燃设备已建档",
  FIRE_FIGHTING_EQUIPMENT: "当前市场消防设备已建档",
  TRANSPORT_DEVICES: "当前市场电动车设备已建档",
};
const emit = defineEmits(["close"]);
const props = withDefaults(defineProps<Props>(), {
  title: "列表",
  showModal: false,
  parameter: {},
});

const show = ref(false);
const closeModal = () => {
  emit("close");
};
</script>
<style lang="less" scoped>
.rank-main {
  .name {
    font-size: 16px;

    font-weight: 500;
    color: #ffffff;
  }

  .title {
    display: flex;
    justify-content: space-between;
    height: 42px;
    align-items: center;
    background: rgba(47, 118, 255, 0.1);
    box-shadow: inset 0px 0px 10px 0px rgba(47, 118, 255, 0.3);
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    padding: 0 15px;
    border: 1px solid rgba(100, 162, 255, 0.2);
    margin-top: 9px;

    .unit {
      color: #fff;
      font-size: 12px !important;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      margin-left: 2px;
    }
  }

  .content {
    margin-top: 11px;
    display: flex;
    justify-content: space-between;

    .alarm-info {
      display: flex;
      align-items: center;
      width: 32%;
      height: 80px;
      padding: 10px;
      background: linear-gradient(0deg,
          rgba(77, 115, 197, 0.2) 12%,
          rgba(82, 120, 203, 0.014) 100%);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid;
      border-image: linear-gradient(0deg,
          rgba(127.09031358361244,
            158.27913880348206,
            226.16071790456772,
            0.1599999964237213),
          rgba(157.0000058412552,
            174.00000482797623,
            211.00000262260437,
            0.07999999821186066)) 1 1;

      .alarm-info-item-img {
        width: 44px;
        height: 44px;
        margin-right: 20px;
      }

      .alarm-title {
        color: #fff;
        display: flex;

        align-items: center;

        .top {
          margin-left: 10px;
          margin-top: 5px;
        }
      }

      .alarm-content {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #dee9ff;
      }

      img {
        width: 24px;
        height: 24px;
      }
    }
  }
}

.dotto {
  background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/s.png") no-repeat;
  width: 1px;
  height: 25px;
}

.three_alarm {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  .three_content {
    width: 49%;

    .alarm-info {
      line-height: 50px;
      height: 80px;
      padding: 10px;
      align-items: center;
      background: linear-gradient(0deg,
          rgba(77, 115, 197, 0.2) 12%,
          rgba(82, 120, 203, 0.014) 100%);
      border-radius: 0px 0px 0px 0px;
      opacity: 1;
      border: 1px solid;
      border-image: linear-gradient(0deg,
          rgba(127.09031358361244,
            158.27913880348206,
            226.16071790456772,
            0.1599999964237213),
          rgba(157.0000058412552,
            174.00000482797623,
            211.00000262260437,
            0.07999999821186066)) 1 1;

      .alarm-title {
        color: #fff;
        display: flex;

        align-items: center;

        div {
          margin-left: 10px;
          margin-top: 5px;
        }
      }

      .alarm-content {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #dee9ff;
      }

      img {
        width: 24px;
        height: 24px;
      }
    }
  }
}

.alarm_content {
  margin-top: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #dee9ff;
}

.unit {
  margin-left: 10px;
}
</style>