<template>
  <g-layout title="报告详情">
    <template #content-table>
      <div class="report-detail" >
        <div class="report-pdf" ref="pdf">
          <div class="pdf-title">{{form?.title??`${businessPrefix}报告`}}</div>
          <div class="pdf-time">{{form?.titleTime??null}}</div>
          <gVerticalLine title="信息总览"></gVerticalLine>
          <template v-if="form.total>0||form.waitingForConfirm>0||form.toBeClosed>0||form.finished>0||form.reportOverviewList.length>0">
             <div>当前时间段统计共发生总数 [ {{ form?.total ?? 0 }} ] 条</div>
            <div class="report-tips">
              其中待确认 [ {{ form?.waitingForConfirm ?? 0 }} ] 条，待处理
              [ {{ form?.waitingForHandle ?? 0 }} ] 条，待关闭 [
              {{ form?.toBeClosed ?? 0 }} ] 条，已结束 [
              {{ form?.finished ?? 0 }} ] 条
            </div>
            <a-table
              :dataSource="form.reportOverviewList"
              :columns="columns"
              :pagination="false"
            />
          </template>
         <div v-else>当前时间段统计未发生异常,请保持良好的运维工作</div>
          <gVerticalLine title="设备分析"></gVerticalLine>
          <template v-if="form.analysisTotal>0||form.analysisFirstName||form.analysisList.length>0">
            <div class="report-tips">
              当前时间段统计设备类型 [ {{form?.analysisTotal??0}} ]
              个，请特别关注【{{form?.analysisFirstName??'--'}}】的安全维护工作
            </div>
            <a-table
              :dataSource="form.analysisList"
              :columns="columns2"
              :pagination="false"
            />
          </template>
          <div v-else>当前时间段统计未发生异常,请保持良好的运维工作</div>
          <gVerticalLine title="区域分析"></gVerticalLine>
          <template v-if="form.analysisAreaTotal>0||form.analysisAreaFirstName||form.analysisAreaList.length>0">
           <div class="report-tips">
            当前时间段统计分布区域 [ {{form?.analysisAreaTotal??0}} ]
            个，请特别关注【{{form?.analysisAreaFirstName??'--'}}】的安全维护工作
          </div>
          <a-table
            :dataSource="form.analysisAreaList"
            :columns="columns3"
            :pagination="false"
          />
          </template>
          <div v-else>当前时间段统计未发生异常,请保持良好的运维工作</div>
        </div>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button @click="handleExport" type="primary" v-if="form.title">下载</a-button>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import { useRoute } from "vue-router";
import { downloadPDF } from "@/utils/pdf.js";
import moment from "moment"
import { usePageName } from '../../../hooks/usePageName'
import { getBusinessPrefix } from '../../../hooks/useBusinessPrefix'

export default defineComponent({
  setup() {
    const { title } = usePageName()
    const businessPrefix = getBusinessPrefix();
    const route = useRoute();
    const pdf = ref()
    const { proxy } = getCurrentInstance();
    const state = reactive({
      form: {
        reportOverviewList: [],
        analysisList: [],
        analysisAreaList: [],
        analysisReason: [],
      },
    });
    const getData = () => {
      proxy.$api.getReportOverview({ id: route.query.id }).then((res) => {
        state.form = res;
      });
    };
    const handleExport = () => {
      downloadPDF(pdf._value,state.form.title+state.form.titleTime);
    };
    const goBack = () => {
      history.back();

    };
    onMounted(() => {
      getData();
    });
    return {
      ...toRefs(state),
      pdf,
      columns: [
        {
          title: "提交时间",
          dataIndex: "submitTime",
          key: "submitTime",
          customRender: ({ text }) => {
            const date = new Date(text)
            return  text ? moment(date).format('YYYY-MM-DD HH:mm:ss')  : "--"
          },
        },
        {
          title: `${businessPrefix}单名称`,
          dataIndex: "name",
          key: "name",
        },
        {
          title: "设备",
          dataIndex: "objName",
          key: "objName",
          customRender: ({ text }) => {
            return  text || "--"
          },
        },
        {
          ellipsis: true,
          title: "提交人",
          dataIndex: "submitter",
          key: "submitter",
           customRender: ({ text }) => {
            return text ?text:'--'
          },
        },
        {
          ellipsis: true,
          title: "状态",
          dataIndex: "faultStatus",
          key: "faultStatus",
           customRender: ({ text }) => {
            return text ?text:'--'
          },
        },
        {
          ellipsis: true,
          title: "处理结果",
          dataIndex: "faultResult",
          key: "faultResult",
          customRender: ({ text }) => {
            return text ?text:'--'
          },
        },
      ],
      columns2: [
        {
          ellipsis: true,
          title: "设备类型",
          dataIndex: "objTypeName",
          key: "objTypeName",
        },
        {
          ellipsis: true,
          title: "个数",
          dataIndex: "objTypeTotal",
          key: "objTypeTotal",
        },
        {
          ellipsis: true,
          title: "待确认",
          dataIndex: "objTypeConfirm",
          key: "objTypeConfirm",
        },
        {
          ellipsis: true,
          title: "待处理",
          dataIndex: "objTypeHandle",
          key: "objTypeHandle",
        },
        {
          ellipsis: true,
          title: "待关闭",
          dataIndex: "objTypeClosed",
          key: "objTypeClosed",
        },
        {
          ellipsis: true,
          title: "已结束",
          dataIndex: "objTypeFinished",
          key: "objTypeFinished",
        },
      ],
      columns3: [
        {
          ellipsis: true,
          title: "区域名称",
          dataIndex: "areaName",
          key: "areaName",
          customRender: ({ text }) => {
            return text ?text:'--'
          },
        },
        {
          ellipsis: true,
          title: "个数",
          dataIndex: "objAreaTotal",
          key: "objAreaTotal",
        },
        {
          ellipsis: true,
          title: "待确认",
          dataIndex: "objAreaConfirm",
          key: "objAreaConfirm",
        },
        {
          ellipsis: true,
          title: "待处理",
          dataIndex: "objAreaHandle",
          key: "objAreaHandle",
        },
        {
          ellipsis: true,
          title: "待关闭",
          dataIndex: "objAreaClosed",
          key: "objAreaClosed",
        },
        {
          ellipsis: true,
          title: "已结束",
          dataIndex: "objAreaFinished",
          key: "objAreaFinished",
        },
      ],
      columns4: [
        {
          ellipsis: true,
          title: `${businessPrefix}描述`,
          dataIndex: "name",
          key: "name",
           customRender: ({ text }) => {
            return text ?text:'--'
          },
          width:800
        },
        {
          ellipsis: true,
          title: "发生次数",
          dataIndex: "num",
          key: "num",
        },
      ],
      handleExport,
      goBack,
      title,
      businessPrefix
    };
  },
});
</script>
<style lang="less" scoped>
.report-detail {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  .verticalLine{
    margin: 15px 0!important;
  }
  .report-pdf {
    width: 1000px;
    margin: 0 auto;
    padding: 0 10px;
    .report-tips {
      margin: 10px 0;
    }
    .pdf-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
    .pdf-time {
      text-align: center;
      font-size: 14px;
    }
  }
}
</style>
