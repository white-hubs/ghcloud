<template lang="pug">
g-detail(
  title="溯源详情"
  :api="api"
  :formList="formList"
)
  template(v-slot:edit-item="item")
      .item-title 溯源信息
      timeline(style="width:100%") 
        a-timeline-item() 
          div.processTitle 报备信息
          div.flex 
            span 报备时间：{{item.record.porkReportTime? timeFormat(item.record.porkReportTime) : '--'}}
            span 到场时间：{{item.record.arrivedTime? timeFormat(item.record.arrivedTime) : '--'}}
          div.flex 
            span 档位名称：{{item.record.stallName? item.record.stallName : '--'}}
            //- span 档位号： --
            span 车牌号：{{item.record.vehiclePlate? item.record.vehiclePlate : '--'}}
          div.flex 
            span 养殖场：{{item.record.originalPlace? item.record.originalPlace : '--'}}
            span 屠宰场：{{item.record.abattoirName? item.record.abattoirName : '--'}}
          div.flex 
            span 审核时间：{{item.record.porkReportAuditTime? timeFormat(item.record.porkReportAuditTime,true) : '--'}}
            span 审核员：{{item.record.porkReportAuditorName? item.record.porkReportAuditorName : '--'}}
          div.flex 
            span(v-if="item.record.pratiqueCodes") 检疫证号：
              PopOver(:content="item.record.pratiqueCodes") {{item.record.pratiqueCodes.join(',')}} 
          div.flex 
            span 检疫证明：
              //- span.relative
                a-image-preview-group(v-if="item.record.fileVOS&&item.record.fileVOS.length>0")
                  a-image( v-for="i in item.record.fileVOS" :src="i.path" :width="100" :height="100" :fallback="fallback") 
          div.flex 
            div.relative
              a-image-preview-group(v-if="item.record.fileVOS&&item.record.fileVOS.length>0")
                a-image( v-for="i in item.record.fileVOS" :src="i.path" :width="100" :height="100" :fallback="fallback") 
            //- span 审核员： --
        a-timeline-item() 
          div.processTitle 检疫票信息
          div.flex 
            span 登记时间：{{item.record.registerTime? timeFormat(item.record.registerTime,true) : '--'}}
            span 登记员：{{item.record.registerName? item.record.registerName : '--'}}
            //- span 登记员： --
        a-timeline-item() 
          div.processTitle 抽检信息  
          div.flex 
            span 瘦肉精：
              span.deleteRow(v-if="item.record.clenbuterol==='POSITIVE'") 阳
              span.normalRow(v-else-if="item.record.clenbuterol === 'NEGATIVE'") 阴 
              span(v-else) 检测中 
            span 含水量：
              span.deleteRow(v-if="item.record.watered === 'POSITIVE'") 阳
              span.normalRow(v-else-if="item.record.watered === 'NEGATIVE'") 阴
              span(v-else) 检测中 
          div.flex 
            span 抽检员：{{item.record.inspectorName? item.record.inspectorName : '--'}}
            span 抽检时间：{{item.record.spotCheckTime? timeFormat(item.record.spotCheckTime,true) : '--'}}
        a-timeline-item() 
          div.processTitle 理货审核信息 
          div.flex 
            span 审核员：{{item.record.porkArrangeAuditorName? item.record.porkArrangeAuditorName : '--'}}
            //- span 审核员： --
            span 审核时间：{{item.record.porkArrangeAuditTime? timeFormat(item.record.porkArrangeAuditTime,true) : '--'}}
          div.flex 
            span 审核结果：{{item.record.porkArrangeAuditStatus==='PASSED'? '通过' : item.record.porkArrangeAuditStatus==='AUDIT'? '待审核': item.record.porkArrangeAuditVO?.auditStatus==='FAILED'? '不通过':'--'}}
        a-timeline-item() 
          div.processTitle 交易信息   
          div.flex 
            span 买家：{{item.record.customerName? item.record.customerName : '--'}}
            //- span 买家： --
            span 交易时间：{{item.record.orderTime? timeFormat(item.record.orderTime,true) : '--'}}
</template>
<script lang="jsx">
// import { format } from "path/posix";
import { defineComponent, reactive, getCurrentInstance, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat,getFreshLabel } from "@/utils/common";
const fallback = "data:image/png;base64,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"

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      api: {
        detail: "resourceId",
      },
      formList: [
        {
          title: "基本信息",
          form: [
            // { label: "商家名称", value: "merchantName" },
            // { label: "商家编号", value: "merchantCode" },
            { label: "商家名称", value: "supplierName" },
            { label: "商家编号", value: "supplierCode" },
            { label: "批次号", value: "porkReportCode" },
            { label: "商品名称",value: "goodsCategoryName" ,
              html: true,
              detailFun: (value, form) => {
                return `<span style="margin-left:5px;"> ${form.goodsCategoryName ? form.goodsCategoryName : "--"} </span><span class="${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).color
                    : ""
                }">${
                  form.freshLabel
                    ? getFreshLabel(form.freshLabel).name
                    : ""
                }</span>`;
              },
            },
            { label: "商品编码", value: "label" },
            { label: "理货编码", value: "footMarkCode" },
          ],
        },
      ],
      data: null,
      spinning: false,
    });

    // 有id
    const id = route.query.id;
    // if (id) {
    //   formState.spinning = true;
    //   proxy.$api
    //     .resourceId({ id: id },`get` )
    //     .then((res) => {
    //       formState.data = res;
    //     })
    //     .finally(() => {
    //       formState.spinning = false;
    //     });
    // }

    const cancel = () => {
      formState.data = null;
      router.back(-1);
    };

    return {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(formState),
      // formState,
      cancel,
      timeFormat,
      fallback,
    };
  },
});
</script>
<style lang="less" scoped>
@position: 10px, 15px, 20px, 25px, 30px;
@len: length(@position);

.timeline {
  padding: 20px 50px;
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
//定义循环方法
.setPos(@index) when(@index<@len) {
  &:nth-child(@{index}) {
    left: extract(@position, @index);
    z-index: (6 - @index);
    top: extract(@position, @index);
  }
  .setPos(@index+1);
}
:deep(.ant-image) {
  overflow: hidden;
  vertical-align: top;
  // position: absolute;
  // box-shadow: 2px 2px 2px #aaa;
  // border-radius: 8px;
  // 重叠
  // .setPos(1);
}
</style>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
<style lang="less">
.ant-timeline-item {
  &:last-child {
    .ant-timeline-item-tail {
      border-left: none;
    }
  }
}
</style>
