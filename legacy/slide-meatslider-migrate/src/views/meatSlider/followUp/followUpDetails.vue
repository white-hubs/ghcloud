<template lang="pug">
g-layout(title="供货商品详情")
  template(#content-table)
    .detail-form
      a-form(layout="inline" :model="merchant" ref="formRef")
        a-form-item(label="商家名称") {{merchant?.name? merchant?.name:"--"}}
        a-form-item(label="商家编号") {{merchant?.code? merchant?.code:"--"}}
        a-form-item(label="批次号") {{merchant?.porkReportCode? merchant?.porkReportCode:"--"}} 
        a-form-item(label="商品名称") {{merchant?.productName? merchant?.productName:"--"}}
          span(:class="merchant?.freshLabel ? getFreshLabel(merchant?.freshLabel).color : ''" style="margin-left:5px;") {{ merchant?.freshLabel ? getFreshLabel(merchant?.freshLabel).name : "" }}
        div(style="width:100%")  
          a-tabs(v-model:activeKey="activeKey")
            a-tab-pane(key="reportInfo" tab="报备信息")
              a-spin(:spinning="reportLoading")
                a-form(layout="inline" :model="reportData" ref="formRef")
                  a-form-item(label="商品名称") {{reportData?.goodsCategoryName? reportData?.goodsCategoryName:'--'}}
                    span(:class="reportData?.freshData ? reportData?.freshData.color : ''" style="margin-left:5px;") {{ reportData?.freshData ? reportData?.freshData.name : "" }}
                  a-form-item(label="报备片数") {{reportData?.reportSlices? reportData?.reportSlices:'--'}}  片
                  a-form-item(label="报备重量") {{reportData?.reportWeight? reportData?.reportWeight:"--"}} kg
                  a-form-item(label="报备时间") {{reportData?.reportTime? timeFormat(reportData?.reportTime):'--'}}
                  a-form-item(label="到场时间") {{reportData?.arrivedTime? timeFormat(reportData?.arrivedTime):"--"}}
                  a-form-item(label="档位号") {{reportData?.stallCode? reportData?.stallCode:'--'}}
                  a-form-item(label="车牌号") {{reportData?.vehiclePlate? reportData?.vehiclePlate:'--'}}
                  a-form-item(label="屠宰场") {{reportData?.abattoirName? reportData?.abattoirName:'--'}}
                  a-form-item(label="屠宰场代码") {{reportData?.abattoirCode? reportData?.abattoirCode:'--'}}
                  a-form-item(label="养殖场") {{reportData?.originPlace? reportData?.originPlace:'--'}}
                  a-form-item(label="检疫证号" v-if="reportData?.pratiqueCode") {{reportData.pratiqueCode}}
                  a-form-item(label="检疫证" v-if="reportData?.fileVOS.length")
                    a-image.pl1(v-for="item in reportData?.fileVOS" :src="item.path" :width="100" :height="100" :fallback="fallback")
            a-tab-pane(key="processInfo" tab="业务流程信息")
              a-spin(:spinning="processLoading")
                a-timeline 
                  a-timeline-item(v-if="processData?.porkReportTime") 报备信息
                    div.processTitle 
                      div 
                        span 报备时间：{{processData?.porkReportTime? timeFormat(processData?.porkReportTime,true) : '--'}}
                  a-timeline-item(v-if="processData?.porkReportAuditTime") 报备审核   
                    div.processTitle 
                      div.flex
                        span 审核员： {{processData?.porkReportAuditorName? processData?.porkReportAuditorName : '--'}}
                        span 审核时间：{{processData?.porkReportAuditTime? timeFormat(processData?.porkReportAuditTime,true) : '--'}}
                      div.flex
                        span 审核结果：{{processData?.porkReportAuditStatus? processData?.porkReportAuditStatus==="PASSED"? '通过':processData?.porkReportAuditStatus==="FAILED"? '不通过':'待审核' : '--'}}
                  a-timeline-item(v-if="processData?.registerTime") 登记检疫票  
                    div.processTitle 
                      div.flex 
                        span 登记员：{{processData?.registerName? processData?.registerName : '--'}}
                        span 登记时间：{{processData?.registerTime? timeFormat(processData?.registerTime,true) : '--'}}
                      div.flex  
                        span 检疫票张数：{{processData?.registerTickets? processData?.registerTickets : '--'}}
                      div.flex(v-if="processData?.pratiqueCodes") 
                        span 检疫票号段：
                          PopOver(:content="processData.pratiqueCodes") {{processData.pratiqueCodes.join(',')}} 
                  a-timeline-item(v-if="processData?.spotCheckTime") 抽检信息   
                    div.processTitle 
                      div.flex  
                        span 抽检员：{{processData?.inspectorName? processData?.inspectorName : '--'}}
                        span 抽检时间：{{processData?.spotCheckTime? timeFormat(processData?.spotCheckTime,true) : '--'}}
                      div.flex  
                        span 瘦肉精：
                          span 
                            span.deleteRow(v-if="processData?.clenbuterol==='POSITIVE'") 阳
                            span.normalRow(v-else-if="processData?.clenbuterol==='NEGATIVE'") 阴
                            span.blueRow(v-else) 检测中
                        span 含水量：
                          span 
                            span.deleteRow(v-if="processData?.watered==='POSITIVE'") 阳
                            span.normalRow(v-else-if="processData?.watered==='NEGATIVE'") 阴
                            span.BLUErOW(v-else) 检测中
                      div.flex  
                        span 抽检结果：{{processData?.clenbuterol==='POSITIVE' || processData?.watered==='POSITIVE' ? '不合格': processData?.watered==='NEGATIVE' && processData?.clenbuterol==='NEGATIVE' ? '合格':'检测中'}}
                  a-timeline-item(v-if="processData?.porkArrangeAuditTime") 理货审核信息   
                    div.processTitle 
                      div.flex 
                        span 审核员：{{processData?.porkArrangeAuditorName? processData?.porkArrangeAuditorName : '--'}}
                        span 审核时间：{{processData?.porkArrangeAuditTime? timeFormat(processData?.porkArrangeAuditTime,true) : '--'}}
                      div.flex  
                        span 审核结果： {{processData?.porkArrangeAuditStatus==='PASSED'? '通过' : processData?.porkArrangeAuditStatus==='AUDIT'? '待审核': processData?.porkArrangeAuditStatus==='FAILED'? '不通过':'--'}}
            a-tab-pane(key="productDetail" tab="商品明细")
              a-form.default(layout="inline" :model="model")
                a-form-item(label="是否售卖" name="sell") 
                  a-select(v-model:value="model.sell" allowClear placeholder="售卖状态")
                    a-select-option(v-for="item in simple" :value="item.value") {{item.name}}
                a-form-item(label="识别结果" name="result") 
                  a-select(v-model:value="model.result" allowClear placeholder="识别结果")
                    a-select-option(v-for="item in cheat" :value="item.value") {{item.name}}
                a-form-item(label="" style="margin-left:20px") 
                  a-input(v-model:value.trim="model.keyword" allowClear placeholder="商品编码/脚标编码")
                a-form-item(label="" style="margin-left:20px") 
                  a-space(:size="16")
                    a-button(type="primary" @click="handleSearch") 查询
                    a-button(@click="reset") 重置
              div 
                a-table(
                  :data-source="productData"
                  :columns="columns"
                  :loading="productLoading"
                  :pagination="pagination"
                  :rowKey="(record) => record.id"
                  @change="changePage"
                  size="small"
                  :scroll="{x:1600}")
  template(#footer-page)
    a-button(@click="goBack") 返回
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  createVNode,
  watch,
  toRefs,
  ref,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { simple, cheat } from "@/utils/enumerate";
import { timeFormat, millennial,getFreshLabel } from "@/utils/common";
import _ from "lodash";
const fallback = "data:image/png;base64,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"
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();

    const activeKey = ref("");

    // 有code
    const code = route.query.porkReportCode;

    const statusState = reactive({
      baseLoading: false,
      reportLoading: false,
      processLoading: false,
      productLoading: false,
    });

    const model = ref({
      code: code,
      keyword: null,
      sell: " ",
      result: " ",
    });

    const detailData = reactive({
      merchant: null,
      reportData: null,
      processData: null,
      productData: null,
    });

    const tableState = reactive({
      pagination: {
        current: 1,
        total: 0,
        defaultPageSize: 10,
      },
      columns: [
        {
          dataIndex: "label",
          key: "label",
          title: "商品编码",
          slots: {
            customRender: "label",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        {
          dataIndex: "footMarkCode",
          key: "footMarkCode",
          title: "脚标编码",
          slots: {
            customRender: "footMarkCode",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        // {
        //   dataIndex: "name",
        //   key: "name",
        //   title: "图片",
        //   slots: {
        //     customRender: "name",
        //   },
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       <PopOver position="topLeft" content={text}>
        //         {text ? text : "--"}
        //       </PopOver>
        //     );
        //   },
        //   width: 80,
        // },
        {
          dataIndex: "porkArrangeTime",
          key: "porkArrangeTime",
          title: "理货时间",
          slots: {
            customRender: "porkArrangeTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
          width: 150,
        },
        {
          dataIndex: "place",
          key: "place",
          title: "理货机",
          slots: {
            customRender: "place",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        {
          dataIndex: "weight",
          key: "weight",
          title: "净重（kg）",
          slots: {
            customRender: "weight",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 120,
        },
        {
          dataIndex: "loss",
          key: "loss",
          title: "损耗（kg）",
          slots: {
            customRender: "loss",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 120,
        },
        {
          dataIndex: "price",
          key: "price",
          title: "交易价格（元/kg）",
          slots: {
            customRender: "price",
          },
          ellipsis: true,
          width: 130,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text !== "" ? `￥ ${millennial(text)}` : "--"}
              >
                {text !== "" ? `￥ ${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "amount",
          key: "amount",
          title: "交易金额",
          slots: {
            customRender: "amount",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text !== "" ? `￥ ${millennial(text)}` : "--"}
              >
                {text !== "" ? `￥ ${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        {
          dataIndex: "orderTime",
          key: "orderTime",
          title: "交易时间",
          slots: {
            customRender: "orderTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
          width: 150,
        },
        {
          dataIndex: "customerName",
          key: "customerName",
          title: "买家名称",
          slots: {
            customRender: "customerName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        {
          dataIndex: "commission",
          key: "commission",
          title: "分佣金额",
          slots: {
            customRender: "commission",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text !== "" ? `￥ ${millennial(text)}` : "--"}
              >
                {text !== "" ? `￥ ${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          width: 80,
        },
        {
          dataIndex: "passed",
          key: "passed",
          title: "是否合格",
          slots: {
            customRender: "passed",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === true) {
              return (
                <PopOver position="topLeft" content="是">
                  <span class="normalRow">是</span>
                </PopOver>
              );
            } else if(text === false){
              return (
                <PopOver position="topLeft" content="否">
                  <span class="deleteRow">否</span>
                </PopOver>
              );
            }else{
              return (
                <PopOver position="topLeft" content="--">
                  <span>--</span>
                </PopOver>
              );
            }
          },
          width: 80,
        },
        {
          dataIndex: "sell",
          key: "sell",
          title: "是否售卖",
          slots: {
            customRender: "sell",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text) {
              return (
                <PopOver position="topLeft" content="是">
                  <span class="normalRow">是</span>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="否">
                  <span class="deleteRow">否</span>
                </PopOver>
              );
            }
          },
          width: 80,
        },
        {
          dataIndex: "result",
          key: "result",
          title: "识别结果",
          slots: {
            customRender: "result",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === true) {
              return (
                <PopOver position="topLeft" content="作弊嫌疑">
                  <span class="deleteRow">作弊嫌疑</span>
                </PopOver>
              );
            } else if(text === false){
              return (
                <PopOver position="topLeft" content="正常">
                  <span class="normalRow">正常</span>
                </PopOver>
              );
            }else{
              return (
                <PopOver position="topLeft" content="--">
                  <span>--</span>
                </PopOver>
              );
            }
          },
          width: 80,
        },
      ],
    });

    onMounted(() => {
      if (code) {
        getBaseDetail(code);
        // getReportData(code);
        activeKey.value = "reportInfo";
      }
    });

    const getBaseDetail = (code) => {
      statusState.baseLoading = true;
      proxy.$api
        .followUpMerchant({ code: code },`get` )
        .then((res) => {
          detailData.merchant = res;
        })
        .finally(() => {
          statusState.baseLoading = false;
        });
    };

    const getReportData = (code) => {
      statusState.reportLoading = true;
      proxy.$api
        .followUpReport({ code: code },"get" )
        .then((res) => {
          if (res?.freshLabel) {
            res.freshData = getFreshLabel(res?.freshLabel)
          }
          detailData.reportData = res;
        })
        .finally(() => {
          statusState.reportLoading = false;
        });
    };

    const getProcessData = (code) => {
      statusState.processLoading = true;
      proxy.$api
        .followUpProcess({ code: code },"get" )
        .then((res) => {
          detailData.processData = res;
        })
        .finally(() => {
          statusState.processLoading = false;
        });
    };
    const getProductDetail = (searchData, pageNum) => {
      const data = {
        code: searchData.code,
        keyword: searchData.keyword ? searchData.keyword : "",
        sell: searchData.sell,
        result: searchData.result,
        pageNumber: pageNum ? pageNum : 1,
      };
      statusState.productLoading = true;
      proxy.$api
        .followUpProductDetail(data,"get" )
        .then((res) => {
          detailData.productData = res.records;
          tableState.pagination.total = res.total;
        })
        .finally(() => {
          statusState.productLoading = false;
        });
    };

    const changePage = (e) => {
      tableState.pagination.current = e.current;
      getProductDetail(model.value, e.current);
    };

    const cancel = () => {
      // formState.data = null;
      router.back(-1);
    };

    // const confirm = () => {
    //   Modal.confirm({
    //     title: "结算确认",
    //     icon: createVNode(ExclamationCircleOutlined),
    //     content:
    //       "你确定该商户的结算信息正确么？（一旦确认后按照确认的结算金额划到商户IC卡",
    //     okText: "确认",
    //     cancelText: "取消",
    //     onOk: () => {
    //       proxy.$api
    //         .settlement({
    //           id: formState.data.id,
    //           status: true,
    //         },"put")
    //         .then(() => {
    //           getDetail(code);
    //         });
    //     },
    //     onCancel: () => {},
    //   });
    // };

    const handleSearch = () => {
      tableState.code = code;
      getProductDetail(model.value);
    };
    const reset = () => {
      model.value = {
        code: code,
        keyword: null,
        sell: " ",
        result: " ",
      };
      getProductDetail(model.value);
    };
    /*返回*/
    const goBack = () => {
      router.back();
    };
    watch(
      () => activeKey.value,
      () => {
        if (
          activeKey.value === "reportInfo" &&
          _.isEmpty(detailData.reportData)
        ) {
          getReportData(code);
        } else if (
          activeKey.value === "processInfo" &&
          _.isEmpty(detailData.processData)
        ) {
          getProcessData(code);
        } else if (
          activeKey.value === "productDetail" &&
          _.isEmpty(detailData.productData)
        ) {
          getProductDetail(model.value);
        }
      }
    );

    return {
      ...toRefs(statusState),
      ...toRefs(detailData),
      ...toRefs(tableState),
      model,
      cancel,
      changePage,
      timeFormat,
      // confirm,
      millennial,
      activeKey,
      fallback,
      simple,
      cheat,
      handleSearch,
      goBack,
      reset,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");


:deep(.ant-table-wrapper) {
  padding-right: 20px;
}
:deep(.ant-timeline-item-content) {
  text-align: left;
}
:deep(.ant-tabs-tabpane) {
  padding-top: 20px;
  .ant-table-wrapper {
    padding-right: 0;
  }
}
.reportDataCtr {
  width: 100%;
  height: 100%;
  display: grid;
  @media (max-width: 1920px) {
    grid-template-columns: repeat(2, 1fr);
    // grid-column-gap: 24px;
    grid-row-gap: 24px;
  }
  @media (min-width: 1920px) {
    grid-template-columns: repeat(4, 1fr);
    // grid-column-gap: 24px;
    grid-row-gap: 24px;
  }
  .itemName {
    vertical-align: top;
  }
  .itemContent {
    vertical-align: top;
  }
  .allRow {
    @media (max-width: 1366px) {
      grid-column-start: 1;
      grid-column-end: 3;
    }

    @media (min-width: 1366px) and (max-width: 1920px) {
      grid-column-start: 1;
      grid-column-end: 4;
    }

    @media (min-width: 1920px) {
      grid-column-start: 1;
      grid-column-end: 5;
    }
  }
}
.processDataCtr {
  width: 100%;
  .processTitle {
    display: grid;
    @media (max-width: 1920px) {
      grid-template-columns: repeat(2, 50%);
    }
    @media (min-width: 1920px) {
      grid-template-columns: repeat(4, 25%);
    }
    grid-row-gap: 24px;
    align-items: center;
    &:first-child {
      margin-top: 16px;
    }
    &:last-child {
      margin-bottom: 0;
    }
    span {
      display: inline-block;
      // width: 50%;
    }
  }
}
:deep(.ant-select) {
  width: 200px;
}
.processTitle {
  font-size: 14px;
  // font-weight: bold;
  text-align: left;
}
.flex {
  padding: 0 20px;
  justify-content: space-between;
  > span {
    padding: 10px;
    display: inline-block;
    width: 50%;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    display: inline-block;
    white-space: nowrap;
  }
  .relative {
    width: 84%;
    height: 150px;
    float: right;
  }
}
</style>
<style lang="less">
.detail-form {
  .default {
    &.ant-form-inline {
      .ant-form-item {
        width: auto !important;
      }
    }
    .ant-form-item-control-input-content .ant-select {
      width: 200px !important;
    }
    .ant-form-item-control-input-content > span {
      width: 200px !important;
    }
  }
}
</style>
