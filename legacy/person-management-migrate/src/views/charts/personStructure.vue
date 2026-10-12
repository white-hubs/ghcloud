<template>
  <a-spin :spinning="isLoading">
    <div class="personnel_structure">
      <div class="left">
        <div class="statistic">
          <div class="statistic_content">
            <div class="pic">
              <img :src="`${PERSON_MANAGEMENT_RESOURCE_BASE}/person.png`" alt="" srcset="" />
            </div>
            <div>
              <div class="tips">当前总人数</div>
              <div class="total">{{ structureTotal }}</div>
            </div>
          </div>

          <img :src="`${PERSON_MANAGEMENT_RESOURCE_BASE}/bar.png`" alt="" />
        </div>
        <g-card :title="`${KEYWORD_ALIAS.staff}动态分布`" style="flex: 1">
          <div class="person_content">
            <div class="line" v-if="structureStatusDistr.length > 1">
              <span
                v-for="(item, index) in structureStatusDistr"
                :class="[index % 2 === 0 ? 'formal' : 'trial']"
                :style="{
                  width: percentageCompute(item.num),
                }"
              ></span>
            </div>
            <div class="legend">
              <div :class="[index === 0 ? 'formal' : 'trial']" v-for="(item, index) in structureStatusDistr" :key="index">
                <div class="circular">{{ item.name }}</div>
                <div class="card_statistic">
                  <div class="total">{{ item.num }}</div>
                  <div class="ratio">{{ percentageCompute(item.num) }}</div>
                </div>
              </div>
            </div>
          </div>
        </g-card>
      </div>
      <div class="item">
        <g-card :title="`${KEYWORD_ALIAS.staff}学历分布`">
          <div class="content">
            <pie-chart :option="educationOption" />
          </div>
        </g-card>
      </div>
      <div class="item">
        <g-card :title="`${KEYWORD_ALIAS.company}${KEYWORD_ALIAS.staff}分布`">
          <div class="content">
            <pie-chart :option="staffDepartmentOption" />
          </div>
        </g-card>
      </div>
      <div class="item">
        <g-card :title="`${KEYWORD_ALIAS.staff}性别分布`">
          <div class="content">
            <pie-chart :option="personSexOption" />
          </div>
        </g-card>
      </div>
      <div class="item">
        <g-card :title="`${KEYWORD_ALIAS.staff}年龄分布`">
          <div class="line_content">
            <!-- <pie-chart :option="personSexOption" /> -->
            <line-charts :data="ageDistrData" />
          </div>
        </g-card>
      </div>
      <div class="item">
        <g-card :title="`${KEYWORD_ALIAS.staff}司龄分布`">
          <div class="line_content">
            <line-charts :data="inductionDateDistrData" />
          </div>
        </g-card>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";

import gCard from "../../components/common/gCard.vue";
import lineCharts from "./lineCharts.vue";
import pieChart from "./pieChart.vue";
import { getpersonStructureData } from "@/api";
import { PERSON_MANAGEMENT_RESOURCE_BASE } from "@/constants/resource";
let L = new URL("../../assets/education.png", import.meta.url).href;
let M = new URL("../../assets/chart_person.png", import.meta.url).href;
interface statusDistrItem {
  num: number;
  name: string;
}
interface optionItem {
  name: string;
  num: number;
}
const educationOption = ref({});
const structureTotal = ref(0);
const staffDepartmentOption = ref({});
const ageDistrData = ref<optionItem[]>([]);
const inductionDateDistrData = ref<optionItem[]>();
const isLoading = ref(false);
const structureStatusDistr = ref<statusDistrItem[]>([
  { num: 1, name: "试用" },
  { num: 1, name: "转正" },
]);
const personSexOption = ref({});
const percentageCompute = computed(() => (num: number) => {
  const all = structureStatusDistr.value.reduce((pre: any, cur: any) => {
    return pre + cur.num;
  }, 0);
  return `${Math.round((num / all) * 100)}%`;
});

const getStructureData = async () => {
  const reslut = await getpersonStructureData();
  const {
    total = 0,
    statusDistr = [],
    inductionDateDistr = [],
    genderDistr = [],
    eduDistr = [],
    deptDistr = [],
    ageDistr = [],
  }: {
    total: number;
    statusDistr: optionItem[];
    inductionDateDistr: optionItem[];
    genderDistr: optionItem[];
    eduDistr: optionItem[];
    deptDistr: optionItem[];
    ageDistr: optionItem[];
  } = reslut.data;
  structureTotal.value = total;
  structureStatusDistr.value = statusDistr;
  ageDistrData.value = ageDistr;
  inductionDateDistrData.value = inductionDateDistr;
  eduDistrOption(eduDistr);
  deptDistrOption(deptDistr);
  genderDistrOption(genderDistr);
};
// 处理后端返回的数据
const handleData = (data: optionItem[]) => {
  return data.map((item: optionItem) => {
    return {
      value: item.num,
      name: item.name,
    };
  });
};
// 人员学历分布
const eduDistrOption = (eduDistr: optionItem[]) => {
  const initData = [
    { value: 0, name: "本科" },
    { value: 0, name: "硕士研究生" },
    { value: 0, name: "大专" },
    { value: 0, name: "高中" },
    { value: 0, name: "初中" },
    { value: 0, name: "小学" },
  ];
  const eduDistrData = handleData(eduDistr);
  // 人员学历分布饼图配置
  educationOption.value = {
    legend: {
      left: "55%",
      top: "center",
      orient: "vertical",
      itemHeight: 8,
      itemWidth: 8,
      textStyle: {
        color: "#fff",
        align: "right",
        rich: {
          a: {
            color: "#4E5969",
            lineHeight: 20,
            align: "left",
            width: 120,
            fontSize: 12,
          },
          b: {
            color: "#262626",
            align: "right",
            fontSize: 14,
          },
        },
      },
      formatter: (name: string) => {
        let total = 0;
        let tarValue: number = 0;
        let scale;
        for (let i = 0; i < eduDistrData.length; i++) {
          total += eduDistrData[i].value;
          if (eduDistrData[i].name == name) {
            tarValue = eduDistrData[i].value;
          }
        }
        scale = total ? Math.round((tarValue / total) * 100) : 0;
        return `{a|${name}(${scale}%)}{b|${tarValue}}`;
      },
      icon: "circle",
    },
    color: ["#5654F5", "#1890FF", "#FF4070", "#FBA33F", "#23D3CD", "#4EC478"],
    graphic: {
      elements: [
        {
          type: "image",
          style: {
            image: L,
            width: 30,
            height: 27,
          },
          left: "19%", //定位 可以用 px 和百分比
          top: "middle",
        },
      ],
    },
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: ["60%", "70%"],
        center: ["22%", "50%"],
        itemStyle: {
          borderRadius: 0,
        },
        label: {
          normal: {
            show: false,
          },
        },
        data: eduDistrData.length ? eduDistrData : initData,
      },
    ],
  };
};
// 人员部门分布
const deptDistrOption = (deptDistr: optionItem[]) => {
  const deptDistrData: { value: number; name: string }[] = handleData(deptDistr);
  staffDepartmentOption.value = {
    legend: {
      orient: deptDistrData.length > 10 ? "vertical" : "horizontal",
      type: deptDistrData.length > 10 ? "scroll" : "plain",
      left: deptDistrData.length > 10 ? "65%" : "55%",
      top: "center",
      align: "left",
      itemHeight: 8,
      itemWidth: 8,
      icon: "circle",
      pageIconSize: 8,
      textStyle: {
        padding: [14, 0, 0, 0],
        color: "#fff",
        rich: {
          a: {
            color: "#4E5969",
            lineHeight: 23,
            fontSize: 12,
            width: 70,
            padding: [1, 0, 0, 0],
          },
          b: {
            color: "#262626",
            fontSize: 14,
            width: 45,
          },
        },
      },
      formatter: function (name: string) {
        const findValue = deptDistrData.find((item: any) => item.name === name);
        return `{a|${name}}\n{b|${findValue ? findValue.value : 0}}`;
      },
    },
    color: ["#5654F5", "#1890FF", "#FF4070", "#FBA33F", "#23D3CD", "#4EC478"],
    graphic: {
      elements: [
        {
          type: "image",
          style: {
            image: M,
            width: 30,
            height: 27,
          },
          left: "27%",
          top: "middle",
        },
      ],
    },
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: ["60%", "70%"],
        center: ["30%", "50%"],
        itemStyle: {
          borderRadius: 0,
        },
        label: {
          normal: {
            show: false,
          },
        },
        data: deptDistrData,
      },
    ],
  };
};
// 人员性别分布
const genderDistrOption = (genderDistr: optionItem[]) => {
  const genderDistrData = handleData(genderDistr);
  const total = genderDistrData.reduce((pre, cur) => {
    return pre + cur.value;
  }, 0);
  personSexOption.value = {
    graphic: {
      type: "text",
      left: "center",
      //left: '37%',
      top: "33%",
      style: {
        text: "总数" + "\n\n" + total,
        textAlign: "center",
        fill: "#333",
        width: 30,
        height: 30,
        fontSize: 14,
      },
    },
    legend: {
      left: "center",
      top: "bottom",
      align: "left",
      itemStyle: {
        borderColor: "rgba(0,0,0,0.09)",
        borderWidth: 1,
      },
      formatter: function (name: string) {
        const findValue = genderDistrData.find((item: any) => item.name === name) as { value: number; name: string };
        const percentage = Math.round((findValue.value / total) * 100) + "%";

        return `${name} (${percentage})    ${findValue.value}`;
      },
      icon: "circle",
    },
    color: ["#5654F5", "#1890FF", "#FF4070", "#FBA33F", "#23D3CD", "#4EC478"],
    series: [
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: ["60%", "70%"],
        center: ["50%", "40%"],
        itemStyle: {
          borderRadius: 0,
        },
        label: {
          normal: {
            show: false,
          },
        },
        data: genderDistrData,
      },
    ],
  };
};
onMounted(async () => {
  try {
    isLoading.value = true;
    await getStructureData();
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
  }
});
</script>
<style lang="less" scoped>
.card_statistic_part(@a) {
  display: flex;
  justify-content: space-between;

  .circular {
    font-size: 14px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
    color: #333333;
    display: flex;
    align-items: center;

    &::before {
      content: "";
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 20px;
      background: @a;
    }
  }

  .card_statistic {
    display: flex;
    align-items: center;

    .total {
      margin-right: 59px;
      font-size: 16px;
      width: 40px;
      font-family: Roboto-Medium, Roboto;
      font-weight: 500;
      color: #1c1f37;
    }

    .ratio {
      padding: 8px 4px;
      border-radius: 50%;
      color: #017efa;
      background: #e6f2fe;
    }
  }
}

.personnel_structure {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .left {
    width: calc(33.33333% - 10.66667px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;

    .statistic {
      padding: 34px 16px 24px 30px;
      border-radius: 8px;
      background: #fff;
      display: flex;
      justify-content: space-between;

      .statistic_content {
        display: flex;

        .pic {
          padding: 12px;
          border-radius: 12px;
          background: #fff1e1;

          img {
            width: 40px;
            height: 38px;
          }
        }

        .tips {
          color: #909399;
          margin-left: 16px;
          font-size: 14px;
        }

        .total {
          color: #262626;
          font-size: 26px;
          font-family: Roboto-Bold, Roboto;
          margin-left: 16px;
        }
      }

      img {
        width: 138px;
        height: 52px;
      }
    }

    .person_content {
      padding: 31px 26px 28px;

      .line {
        height: 21px;
        width: 100%;
        display: flex;

        span {
          display: inline-block;
          height: 21px;
        }

        .formal {
          width: 70%;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
          background: #1890ff;
        }

        .trial {
          width: 30%;
          border-top-right-radius: 12px;
          background: #4ec478;
          border-bottom-right-radius: 12px;
        }
      }

      .legend {
        margin-top: 21px;

        .formal {
          .card_statistic_part(#1890ff);
        }

        .trial {
          margin-top: 16px;
          .card_statistic_part(#4ec478);
        }
      }
    }
  }

  .item {
    width: calc(33.33333% - 10.66667px);
    margin-bottom: 16px;

    .content {
      padding: 51px 2vw 47px 2vw;
    }
  }
}
</style>
