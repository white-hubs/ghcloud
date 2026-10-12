<template>
  <SubPanelTemplate title="气体使用量概览" class="visiting-data">
      <template #extra>
        <DateInlineForm v-model:modelValue="trendTime" @search="getTemplateData"></DateInlineForm>
      </template>
      <div class="item" v-for="item in yData" :key="item.label">
          <RoundDataPic :img="item.img"/>
          <a-statistic :title="item.label">
              <template #formatter>
                  <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
                  <span class="unit">m³</span>
                  <div class="ringRatio">
                      <span>环比</span>
                      <!-- uptriangle 向上三角根据Prop改变 -->
                      <div :class="['downtriangle', item.ratio > 0 && 'uptriangle']"></div>
                      <div :class="[item.ratio > 0 ? 'up' : 'down']">{{ item.ratio.toFixed(2) + "%" }}</div>
                  </div>
              </template>
          </a-statistic>
      </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import RoundDataPic from "./round-data-pic.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { ModelValueItf } from "@/components/businessPanel/public/types";
import { getUseData } from "@/mock/medical-gas"

const props = withDefaults(defineProps<{
  fromPage: FromPageType;
}>(), {
  fromPage: 'PARK'
})

const imgList = ['gas0.png', 'gas1.png', 'gas2.png', 'gas3.png', 'gas4.png', 'gas5.png']
const yData = ref<{label:string; value: number; ratio: number; img: string; }[]>([])
const trendTime = ref<ModelValueItf>({timeType: 'TODAY', dateRange: []});
const chartData = ref<{ label: string; value:number;}[]>([]);

const getTemplateData = () => {
  // TODO  接口调用
  const { timeType } = trendTime.value
  chartData.value = getUseData({formPage: props.fromPage, timeType: timeType as TimeType})
  
  const total = chartData.value.reduce(function (total, value) {
    return total + value.value;
  }, 0);
  yData.value = []
  chartData.value.map((item, index) => {
    yData.value.push({
        label: item.label,
        value: item.value,
        ratio: item.value / total,
        img: getAssetsImage(imgList[index] ?? imgList[0])
    })
  })
}

// 模拟动态数据
let timer = null
let timeList = ['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR']
let index = 1
const changeTime = () => {
  timer = setInterval(() => {
    trendTime.value.timeType = timeList[index]
    getTemplateData()
    index++;
    if (index > timeList.length - 1) {
      index = 0
      // return
    }
  }, window.config.pageLoopRequestTime)
}

onMounted(() => {
  getTemplateData()
  changeTime()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
<style scoped lang="less">
.visiting-data {
    :deep(.sub-panel-content) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin: 15px 0;
        .item {
            width: 50%;
            height: 60px;
            margin-top: 30px;
            display: inline-flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;

            .ant-statistic {
                display: inline-flex;
                flex-flow: column-reverse;

                .ant-statistic-content {
                    height: 29px;

                    .ant-statistic-content-value {
                        color: #fff;
                        font-size: 22px;
                        font-weight: 400;
                        position: relative;
                        top: -25px;
                    }
                }

                .ant-statistic-title {
                    color: #D0DEEE;
                    font-size: 12px;
                    margin: 0;
                }
            }
        }
    }
}

.ringRatio {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}
.unit{
    display: inline-block;
    font-size: 12px;
    margin-left: 2px;
}
.downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
}

.uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
}

.down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
}

.up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
}

.call-statistics {
    display: flex;
    align-items: center;
    justify-content: space-around;

    :deep(.ant-statistic-content-value) {
        color: #fff;
        font-size: 22px;
        font-weight: 400;
        position: relative;
        top: -25px;
    }

    .total-num {
        position: relative;
        width: 159px;
        height: 153px;

        img,
        .value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .img1 {
            width: 159px;
            height: 153px;
        }

        .img2 {
            width: 142px;
            height: 142px;
        }

        .img3 {
            width: 80px;
            height: 80px;
        }

        :deep(.ant-progress) {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);

            .ant-progress-text {
                display: none;
            }
        }


        .value {
            display: flex;
            flex-flow: column;
            align-items: center;

            :deep(.gh-count-to) {
                font-size: 20px;
                font-family: "YouSheBiaoTiHei";
                font-weight: 400;
                color: #FFFFFF;
                margin-bottom: -8px;
            }

            &:last-child {
                font-size: 12px;
                font-weight: 400;
                color: #D0DEEE;
            }
        }
    }

    .call-list {
        .call-box {
            width: 154px;
            height: 44px;
            background: rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 0 10px;

            .call-left {
                display: flex;
                align-items: center;
            }

            span {
                display: inline-block;
                color: #fff;
            }

            .call-color {
                width: 8px;
                height: 8px;
                background: #FFC700;
                border-radius: 50%;
                margin-right: 5px;
            }
        }
    }

    .list {
        margin-top: 20px;

        .item {
            width: 154px;
            // height: 60px;
            background: rgba(255, 255, 255, 0.06);
            margin-bottom: 15px;
            box-sizing: border-box;
            padding-left: 12px;
            display: flex;
            align-items: center;
            position: relative;

            .time {
                font-size: 14px;
                font-weight: 400;
                color: #D0DEEE;
                margin-right: 10px;
            }

            .datas {
                display: flex;
                flex-flow: column;
                margin-top: -15px;

                .value {
                    :deep(.gh-count-to) {
                        font-size: 20px;
                        font-family: "YouSheBiaoTiHei";
                        font-weight: 400;
                        color: #FFFFFF;
                    }
                }

                .rate {
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 0;
                    margin-top: 0px;

                    .text {
                        color: #D0DEEE !important;
                        margin-right: 2px;
                    }
                }
            }

            &::before {
                position: absolute;
                left: 0;
                top: 0;
                width: 17px;
                height: 1px;
                background: #2970FF;
                content: '';
            }
        }
    }
}

@keyframes rotate {
    from {
        transform: translate(-50%, -50%) rotate(0);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.rotate {
    animation: rotate 15s infinite linear;
}

.reverse {
    animation-direction: reverse;
}
</style>