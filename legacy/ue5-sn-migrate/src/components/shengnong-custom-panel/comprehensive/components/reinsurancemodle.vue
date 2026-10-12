<template>
  <div class="rank-main">
    <div class="name" style="display: flex; justify-content: space-between">
      <div>报警情况</div>
      <div>时间统计维度：以周为单位计分呈现上周的风险指数</div>
    </div>
    <div class="title">
      <div class="name">
        <img :src="getSnImage('left.png')" alt="" />
        <span style="margin-left: 14px"> 该项目本周总计得分</span>
        <div class="score-name">
          <count-to
          :startVal="0"
          :endVal="dataInfo?.alarmSituationRiskIndex?.riskIndex || 0"
          :duration="2000"
          separator=""
          style="font-size: 28px; margin-left: 10px"
        ></count-to>
          <span class="unit">分</span>
        </div>
      </div>
      <div>
        <img :src="getSnImage('right.png')" alt="" />
      </div>
    </div>
    <div class="content">
      <div class="alarminfo cell" v-for="(item, index) in dataInfo?.alarmSituationRiskIndex?.alarmLevelIndexDetails">
        <div class="alarm_title">
          <img :src="getSnImage(levelimg[item.alarmLevel][0])" alt="" />
          <div class="top">本周{{ level[item.alarmLevel] }}报警数</div>
          <img class="top-img" :src="getSnImage(levelimg[item.alarmLevel][1])" alt="" />
        </div>
        <div class="alarm_content right-txt">
          <div>
            <div :class="index < 2 ?'red-num': 'yellow-num'">
              <count-to :startVal="0" :endVal="item.totalNum" :duration="2000" separator=""
                style="font-size: 24px; margin-left: 30px"></count-to>
              <span class="unit">个</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="name" style="margin-top: 15px">报警未响应情况</div>
    <div class="title">
      <div class="name">
        <img :src="getSnImage('left.png')" alt="" />
        <span style="margin-left: 14px"> 该项目本周总计得分</span>
        <div class="score-name">
          <count-to :startVal="0" :endVal="
              dataInfo?.alarmUnConfirmedRiskIndex?.riskIndex || 0
            " :duration="2000" separator="" style="font-size: 28px; margin-left: 20px"></count-to>
          <span class="unit">分</span>
        </div>
      </div>
      <div>
        <img :src="getSnImage('right.png')" alt="" />
      </div>
    </div>
    <div class="content">
      <div class="alarminfo cell" v-for="(item, index) in dataInfo?.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails">
        <div class="alarm_title">
          <img :src="getSnImage(levelimg[item.alarmLevel][0])" alt="" />
          <div class="top">本周{{ level[item.alarmLevel] }}未响应报警数</div>
          <img style="margin-top: 8px;" :src="getSnImage(levelimg[item.alarmLevel][1])" alt="" />
        </div>
        <div class="alarm_content right-txt">
          <div>
            <div :class="index < 2 ?'red-num': 'yellow-num'">
              <count-to :startVal="0" :endVal="item.totalNum" :duration="2000" separator=""
                style="font-size: 24px; margin-left: 30px"></count-to>
              <span class="unit">个</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="three_alarm">
      <div class="three_content">
        <div class="name" style="margin-bottom: 10px">隐患情况</div>
        <div class="alarminfo">
          <div class="alarm_content right-txt">
            <div class="inline-center">
              <img :src="getSnImage('warn.png')" alt="" /> 本周隐患数
            </div>
            <div class="yh-info">
              <div>
                <div class="yellow-num">
                  <count-to :startVal="0" :endVal="dataInfo?.hiddenDangerRiskIndex?.totalNum" :duration="2000" separator=""
                    style="font-size: 24px; margin-left: 50px"></count-to>
                  <span class="unit">个</span>
                </div>
              </div>
              <div class="dotto"></div>
              <div>
                该项总计得分
                <img :src="getSnImage('bluej.png')" alt="" />
              </div>
            </div>
            <div>
              <div class="blue-num">
                <count-to :startVal="0" :endVal="dataInfo?.hiddenDangerRiskIndex?.riskIndex" :duration="2000" separator=""
                  style="font-size: 24px; margin-left: 40px"></count-to>
                <span class="unit mr-20px">分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="three_content">
        <div class="name" style="margin-bottom: 10px">隐患未响应情况</div>
        <div class="alarminfo">
          <div class="alarm_content">
            <div class="inline-center">
              <img :src="getSnImage('warn.png')" alt="" /> 本周未响应隐患数
            </div>
            <div class="yh-info">
              <div>
                <div class="yellow-num">
                  <count-to :startVal="0" :endVal="dataInfo?.hiddenDangerUnConfirmedRiskIndex?.totalNum" :duration="2000"
                    separator="" style="font-size: 24px; margin-left: 30px"></count-to>
                  <span class="unit">个</span>
                </div>
              </div>
              <div class="dotto"></div>
              <div>
                该项总计得分
                <img :src="getSnImage('bluej.png')" alt="" />
              </div>
            </div>
            <div style="display: inline-flex;">
              <div class="blue-num">
                <count-to :startVal="0" :endVal="dataInfo?.hiddenDangerUnConfirmedRiskIndex?.riskIndex" :duration="2000"
                separator="" style="font-size: 24px; margin-left: 40px"></count-to>
              </div>
              <span class="unit mr-20px">分</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="name" style="margin-top: 10px">风险源建档情况</div>

      <div class="content">
        <div class="alarminfo" v-for="item in dataInfo?.propertyFilingRiskIndex?.propertyCategoryDetails">
          <img class="alarm-info-item-img" :src="getSnImage('put-on-record.png')" alt="" />
          <div>
            <div class="alarm_title">
              <div style="margin-right: 4px;">{{item.riskIndex !== 0 || !status? equipment[item.propertyCategory]:equipmentAlready[item.propertyCategory] }}</div>
              <img :src="getSnImage('bluej.png')" alt="" />
            </div>
            <div v-if="item.riskIndex !== 0 || !status" class="alarm_content">
              <div>
                该项总计得分
                <count-to :startVal="0" :endVal="item.riskIndex" :duration="2000" separator=""
                  style="font-size: 24px; margin-left: 6px;"></count-to>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from "dayjs";
import { onMounted, watch, reactive } from "vue";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { getSnImage } from "@/utils/getImage";
import { diskdetail } from "@/api/shennong/marketcard";
import { riskAnalyse } from "@/api/shennong/compre";
interface Props {
  id: string;
  status:boolean;
}
const props = withDefaults(defineProps<Props>(), {
  id: "",
});
onMounted(async () => {
  // debugger;
  changeTimeRisk();
});

const level = {
  ONE_LEVEL: "一级",
  TWO_LEVEL: "二级",
  THREE_LEVEL_AND_FOUR_LEVEL: "三/四级",
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
const levelimg = {
  ONE_LEVEL: ["a0.png", "redj.png"],
  TWO_LEVEL: ["a0.png", "yellowj.png"],
  THREE_LEVEL_AND_FOUR_LEVEL: ["a0.png", "yellowj.png"],
  FOUR_LEVEL: ["a0.png", "bluej.png"],
};
const dataInfo = reactive({
  riskIndex: 0,
  alarmSituationRiskIndex: {
    riskIndex: 0,
    alarmLevelIndexDetails: [],
  },
  alarmUnConfirmedRiskIndex: {
    riskIndex: 0,
    alarmLevelIndexDetails: [],
  },
  propertyFilingRiskIndex: {
    riskIndex: 0,
    propertyCategoryDetails: [],
  },
  hiddenDangerRiskIndex:{
    totalNum: 0,
    riskIndex: 0,
  },
  hiddenDangerUnConfirmedRiskIndex:{
    totalNum: 0,
    riskIndex: 0,
  },
});
const changeTimeRisk = async () => {
  const data = await diskdetail({
    marketTenant: props.id,
    period:
      dayjs().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00") +
      "," +
      dayjs().endOf("week").add(1, "days").format("YYYY-MM-DD 23:59:59"),
  });
  
  Object.assign(dataInfo, data);
  if (!dataInfo.alarmSituationRiskIndex || dataInfo.alarmSituationRiskIndex?.alarmLevelIndexDetails.length === 0) {
    Object.assign(dataInfo, {
      alarmSituationRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: "ONE_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "TWO_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
        ],
      },
    });
  }
  if (!dataInfo.alarmUnConfirmedRiskIndex || dataInfo.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails.length === 0) {
    Object.assign(dataInfo, {
      alarmUnConfirmedRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: "ONE_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "TWO_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
        ],
      },
    });
  }

  if (!dataInfo.propertyFilingRiskIndex || dataInfo.propertyFilingRiskIndex?.propertyCategoryDetails.length === 0) {
    Object.assign(dataInfo, {
      propertyFilingRiskIndex: {
        propertyCategoryDetails: [
          {
            propertyCategory: "FLAMMABLE_EQUIPMENT",

            riskIndex: 0,
          },
          {
            propertyCategory: "FIRE_FIGHTING_EQUIPMENT",

            riskIndex: 0,
          },
          {
            propertyCategory: "TRANSPORT_DEVICES",

            riskIndex: 0,
          },
        ],
      },
    });
  }
};
</script>

<style lang="less" scoped>
.rank-main {
  .name {
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    margin-top: 20px;
  }

  .title {
    display: flex;
    justify-content: space-between;
    // height: 42px;
    align-items: center;
    background: rgba(47, 118, 255, 0.1);
    box-shadow: inset 0px 0px 10px 0px rgba(47, 118, 255, 0.3);
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    padding: 0 15px;
    border: 1px solid rgba(100, 162, 255, 0.2);
    margin-top: 12px;

    .unit {
      color: #fff;
      font-size: 12px !important;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      margin-left: 2px;
    }

    .name {
      margin-top: 0;
      display: flex;
      align-items: center;

      .unit {
        margin-left: 2px;
      }

      .score-name {}
    }
  }

  .content {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;

    .alarminfo {
      display: flex;
      align-items: center;
      width: 32%;
      // height: 80px;
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
            .alarm-info-item-img{
              width: 44px;
              height: 44px;
              margin-right: 20px;
            }

      .alarm_title {
        color: #fff;
        display: flex;

        align-items: center;

        .top {
          margin-left: 10px;
          margin-top: 8px;
        }
        .top-img {
          margin-top: 8px;
        }
      }

      .alarm_content {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #dee9ff;
      }
      .right-txt{
        :deep(.gh-count-to){
          margin-top: 10px;
          display: inline-flex;
        }
      }
      img {
        width: 24px;
        height: 24px;
      }

      &.cell {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;

        .alarm_content {
          margin-top: 0;

          .unit {
            margin-right: 20px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.70);
            line-height: 16px;
            font-size: 12px;
          }

        }
      }
      .alarm-info-item{
        display: flex;
        .alarm-info-item-img{

        }
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

    .alarminfo {
      display: flex;
      align-items: center;
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

      .alarm_title {
        color: #fff;
        display: flex;

        align-items: center;

        div {
          margin-left: 10px;
          margin-top: 5px;
        }
        .alarm-info-item-img{
          width: 44px;
          height: 44px;
        }
      }

      .alarm_content {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #dee9ff;

        .yh-info {
          display: flex;
          align-items: center;

          .dotto {
            margin: 0 25px;
          }
        }
      }

      img {
        width: 24px;
        height: 24px;
      }
    }
  }
}

.unit {
  margin-left: 10px;
}

.mr-20px {
  margin-right: 20px;
}
.red-num{
  color: rgb(255, 199, 198);
}
.yellow-num{
  color: rgb(255, 235, 198);
}
.blue-num{
  color: #a1bffc;
}
.inline-center{
  display: inline-flex;
  align-items: center;
  >img{
    display: inline-block;
    margin-right: 10px;
  }
}
</style>
