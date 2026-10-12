<template lang="pug">
a-layout 
  //- a-spin(:spinning="spinning")
  a-layout-header.statisticsBtns
    a-space 
      span 车道: 
      gCascader(v-model:value="enterAreaId" :url="'passWayTag'" :params="{tag:'ENTER_CHARGE'}" @change="enterChange")
      a-button(@click="handleDateClick('TODAY')" :type="params.type === 'TODAY'? 'primary':'default'") 今日
      a-button(@click="handleDateClick('WEEK')" :type="params.type === 'WEEK'? 'primary':'default'") 近7天
      a-button(@click="handleDateClick('MONTH')" :type="params.type === 'MONTH'? 'primary':'default'") 近30天
      a-range-picker(v-model:value="time" :format="dateFormat" :valueFormat="dateFormat" allowClear @change="handleDateClick")

      //- a-button 自定义
  a-layout-content.dataStatistics
    div.topData
      a-card
        a-statistic(
          title="报备商家数"
          :value="statistic?.reportMerchantNum || statistic?.reportMerchantNum === 0 ? millennial(statistic?.reportMerchantNum,false) +'户': '--' "
          :valueStyle="{color:'#3f4553',fontSize:'20px',fontWeight:'500'}")
        div.cardIcon
          IconFont(type="icon-shanghuguanli1")  
      a-card
        a-statistic(
          title="进场商家数"
          :value="statistic?.merchantNum || statistic?.merchantNum === 0 ? millennial(statistic?.merchantNum,false)+'户' : '--'"
          :valueStyle="{color:'#3f4553',fontSize:'20px',fontWeight:'500'}")
        div.cardIcon   
          IconFont(type="icon-jinchang")
      a-card
        a-statistic(
          title="进场车次"
          :value="statistic?.carNum || statistic?.carNum === 0 ? millennial(statistic?.carNum,false) +'次': '--'"
          :valueStyle="{color:'#3f4553',fontSize:'20px',fontWeight:'500'}")
        div.cardIcon 
          IconFont(type="icon-xiaoshoucheci")
      a-card
        a-statistic(
          title="进场总重量"
          :value="statistic?.totalWeight || statistic?.totalWeight ===0 ? `${millennial(statistic?.totalWeight)}kg`:'--'"
          :valueStyle="{color:'#3f4553',fontSize:'20px',fontWeight:'500'}")
        div.cardIcon 
          IconFont(type="icon-dianzicheng-copy")
      a-card
        a-statistic(
          title="总缴费金额"
          :value="statistic?.totalFee || statistic?.totalFee === 0? `￥${millennial(statistic?.totalFee)}元`:'--'"
          :valueStyle="{color:'#3f4553',fontSize:'20px',fontWeight:'500'}")
        div.cardIcon 
          IconFont(type="icon-piaoju")  
    div.bottomCtr                
      div.centerData#centerData
        div#charts1
      div.bottomData
        a-table(
          :columns="rankColumns"
          :data-source="rankTableData"
          :rowKey="(record)=> record.id"
          size="small"
          :pagination="false"
          :loading="enterMerchantNum")
          template(#title) 
            div.flex.justify-between 
              div 已进场报备数据（近5条）
              a(@click="handleClick('/approachReport')" v-if="rankTableData?.length") 更多>>
</template>
<script lang='jsx'>
import {
  defineComponent,
  inject,
  reactive,
  toRefs,
  getCurrentInstance,
  watch,
  ref,
  onMounted,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { timeFormat, millennial } from "@/utils/common";
import _ from "lodash";
import * as echarts from "echarts";
export default defineComponent({
  setup() {
    const dateFormat = "YYYY/MM/DD";
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    const tableState = reactive({
      rankColumnList: [
        "merchantName",
        "stallName",
        "goods",
        "carNo",
        "netWeight",
        "enterFee",
        "enterTime",
      ],
      rankColumns: [
        {
          mark: "merchantName",
          dataIndex: "merchantName",
          key: "merchantName",
          title: "商家名称",
          slots: {
            customRender: "merchantName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "stallName",
          dataIndex: "stallName",
          key: "stallName",
          title: "交易区(档位)",
          slots: {
            customRender: "stallName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "goods",
          dataIndex: "goods",
          key: "goods",
          title: "品类名称",
          slots: {
            customRender: "goods",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text}
              </PopOver>
            );
          },
        }, {
          mark: "carNo",
          dataIndex: "carNo",
          key: "carNo",
          title: "来货车辆",
          slots: {
            customRender: "carNo",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "netWeight",
          dataIndex: "netWeight",
          key: "netWeight",
          title: "来货重量(kg)",
          slots: {
            customRender: "netWeight",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={millennial(text)}>
                {text ? millennial(text) : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "enterFee",
          dataIndex: "enterFee",
          key: "enterFee",
          title: "缴费金额",
          slots: {
            customRender: "enterFee",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "enterTime",
          dataIndex: "enterTime",
          key: "enterTime",
          title: "进场时间",
          slots: {
            customRender: "enterTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
        }
      ],
      rankTableData: null,
      enterMerchantNum: false,
      params: {
        type: "CUSTOM",
        pageNumber: 1,
        pageSize: 5,
      },
      dateType: null,
      tableTotal: 0,
      colorRose: [
        "#00BA8B",
        "#48AE54",
        "#ED6A5A",
        "#0064FF",
        "#5754F6",
        "#1AA2FF",
        "#FF9152",
        "#4776E6",
      ],
    });

    const enterAreaId = ref([]);

    const topData = reactive({
      statistic: null,
      spinning: false,
      type: null,
    });

    const panelData = reactive({
      options: {
        legend: {
          type: "scroll",
          top: 10,
        },
        tooltip: {},
        title: [
          {
            subtext: "进场商家总数",
            left: "15%",
            top: "85%",
            textAlign: "center",
          },
          {
            subtext: "进场车次",
            left: "40%",
            top: "85%",
            textAlign: "center",
          },
          {
            subtext: "进场总重量",
            left: "65%",
            top: "85%",
            textAlign: "center",
          },
          {
            subtext: "缴费总金额",
            left: "90%",
            top: "85%",
            textAlign: "center",
          },
        ],
        color: tableState.colorRose,
        series: [
          {
            type: "pie",
            radius: ["40%", "50%"],
            center: ["15%", "50%"],
            encode: {
              itemName: "product",
              value: "merchantNum",
            },
            label: {
              // label位置
              position: "center",
              // formatter: "{d}%",
              show: false,
            },
            // roseType: "area",
            emphasis: {
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
              },
            },
          },
          {
            type: "pie",
            radius: ["40%", "50%"],
            center: ["40%", "50%"],
            encode: {
              itemName: "product",
              value: "carNum",
            },
            label: {
              // label位置
              position: "center",
              // formatter: "{d}%",
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "16",
                fontWeight: "bold",
                borderWidth: 1,
              },
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
              },
            },
          },
          {
            type: "pie",
            radius: ["40%", "50%"],
            center: ["65%", "50%"],
            encode: {
              itemName: "product",
              value: "totalWeight",
            },
            label: {
              // label位置
              position: "center",
              // formatter: "{d}%",
              show: false,
            },
            emphasis: {
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
              },
            },
            // roseType: "area",
          },
          {
            type: "pie",
            radius: ["40%", "50%"],
            center: ["90%", "50%"],
            encode: {
              itemName: "product",
              value: "totalFee",
            },
            label: {
              // label位置
              position: "center",
              // formatter: "{b}\n{d}%",
              // formatter: "{d}%",
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "16",
                fontWeight: "bold",
                borderWidth: 1,
              },
              itemStyle: {
                borderColor: "#fff",
                borderWidth: 2,
              },
            },
          },
        ],
      },
    });

    const time = ref([null, null]);

    // let myCharts1 = echarts.init(document.getElementById("centerData"));

    const getEnterPanel = async (data) => {
      topData.spinning = true;
      proxy.$api
        .enterPanel(data, "get")
        .then(async (res) => {
          topData.statistic = res;
          const arrayData = ["product"];
          const data = {
            dataset: {
              source: [["product"]],
            },
          };
          const titleCtr = [];
          const ValueCtr = [];
          for (let i of res.areas) {
            const areaData = [];
            areaData.push(i.name);
            for (let j in res.statOnArea) {
              const result = titleCtr.find((item) => item === j);
              if (!result) {
                titleCtr.push(j);
              }

              const index = res.statOnArea[j].findIndex(
                (item) => item.name === i.name
              );
              if (index !== -1) {
                areaData.push(
                  res.statOnArea[j][index].value
                  // ? res.statOnArea[j][index].value
                  // : "--"
                );
              }
            }
            ValueCtr.push(areaData);
          }

          await data.dataset.source[0].push(...titleCtr);
          await data.dataset.source.push(...ValueCtr);
          await Object.assign(panelData.options, data);

          await nextTick(() => {
            let myCharts1 = echarts.init(document.getElementById("centerData"));
            myCharts1.setOption(panelData.options);
          });
        })
        .finally(() => {
          topData.spinning = false;
        });
    };

    const getEnterMerchant = (data) => {
      tableState.enterMerchantNum = true;
      proxy.$api
        .enterStatisticsTable(data, "get")
        .then((res) => {
          tableState.tableTotal = res.total;
          tableState.rankTableData = res.records;
        })
        .finally(() => {
          tableState.enterMerchantNum = false;
        });
    };

    const handleClick = (pageName) => {
      history.pushState(
        { current: location.pathname + location.search }, '',
        `/portal/charge${pageName}?status=OVER_ENTER`
      )
    };

    const handleDateClick = (date) => {
      if (date instanceof Array) {
        if (date.length) {
          tableState.params.type = "CUSTOM";
          tableState.params.period = [time.value[0], time.value[1]].join(",");
          sessionStorage.setItem("panelTime", date);
        } else {
          tableState.params.type = tableState.dateType
            ? tableState.dateType
            : "TODAY";
          tableState.params.period = null;
          time.value = [null, null];
          sessionStorage.setItem("panelTime", tableState.params.type);
        }
      } else {
        tableState.params.type = date;
        tableState.params.period = null;
        time.value = [null, null];
        tableState.dateType = _.cloneDeep(tableState.params.type);
        sessionStorage.setItem("panelTime", tableState.params.type);
      }
      let params = {
        ...tableState.params,
        enterAreaId: enterAreaId.value,
      }
      if (params.type === "CUSTOM") params.type = ''
      getEnterPanel(params);
      getEnterMerchant(params);
    };

    const enterChange = () => {
      getEnterPanel({ ...tableState.params, enterAreaId: enterAreaId.value });
      getEnterMerchant({
        ...tableState.params,
        enterAreaId: enterAreaId.value,
      });
    };

    onMounted(async () => {
      // tableState.rankColumns = tableColumns(
      //   "enterDataPanel",
      //   tableState.rankColumnList
      // );
      if (sessionStorage.getItem("panelTime")) {
        let data = sessionStorage.getItem("panelTime");
        data = data.split(",");
        if (data.length === 2) {
          time.value = data;
          tableState.params.period = [data[0], data[1]].join(",");
        } else {
          tableState.params.type = data[0];
          tableState.dateType = _.cloneDeep(tableState.params.type);
        }
      } else {
        tableState.params.type = "TODAY";
        tableState.dateType = _.cloneDeep(tableState.params.type);
        sessionStorage.setItem("panelTime", tableState.params.type);
      }

      await getEnterPanel(tableState.params);
      getEnterMerchant(tableState.params);
    });

    return {
      dateFormat,
      enterAreaId,
      ...toRefs(tableState),
      ...toRefs(topData),
      time,
      millennial,
      handleClick,
      handleDateClick,
      enterChange,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (to.fullPath !== "/tallyReasult" && to.fullPath !== "/salesRank") {
      sessionStorage.removeItem("panelTime");
    }
    next();
  },
});
</script>
<style lang="less" scoped>
.statisticsBtns {
  text-align: left;
  background-color: transparent;
  padding-bottom: 16px;

  button {
    border-radius: 4px;
  }

  :deep(.ant-calendar-picker) {
    width: 200px;
  }
}

.dataStatistics {
  width: 100%;
  height: calc(100% - 48px);
  display: grid;
  grid-template-rows: 1fr 6fr;
  grid-row-gap: 16px;

  :deep(.ant-table-title) {
    padding: 12px;
    border: none;
  }
}

.topData {
  width: 100%;
  // height: 117px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(1, 100%);
  grid-column-gap: 16px;
  align-items: center;

  :deep(.ant-card) {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    text-align: left;

    &:nth-child(1) .cardIcon {
      background-color: #edfffa;
    }

    &:nth-child(2) .cardIcon {
      background-color: #fff6e8;
    }

    &:nth-child(3) .cardIcon {
      background-color: #edfffa;
    }

    &:nth-child(4) .cardIcon {
      background-color: #eff4ff;
    }

    &:nth-child(5) .cardIcon {
      background-color: #fff2ec;
    }

    .cardIcon {
      @media (max-width: 1920px) {
        width: 40px;
        height: 40px;
        font-size: 24px;
      }

      @media (min-width: 1920px) {
        width: 60px;
        height: 60px;
        font-size: 32px;
      }

      border-radius: 10px;
      position: relative;

      span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .ant-card-body {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &::before,
      &::after {
        display: none;
      }

      .ant-statistic-content .ant-statistic-content-value {
        @media (max-width: 1920px) {
          font-size: 16px;
        }

        @media (min-width: 1920px) {
          font-size: 20px;
        }
      }
    }
  }
}

.bottomCtr {
  width: 100%;
  height: 100%;
  display: grid;
  grid-auto-rows: 1fr 1fr;
  grid-row-gap: 16px;
  overflow: hidden;

  .centerData#centerData {
    background-color: @white;
  }

  .centerData {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .bottomData {
    background-color: @white;
  }
}

:deep(.ant-table-title) {
  color: @fontColor;
  font-family: @fontMedium;
  font-weight: 500;
  font-size: 16px;
}</style>
