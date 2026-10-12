<template lang="pug">
div
  g-detail(
    title="理货数据"
    :api="api"
    :formList="formList"
    :saveBtn="false"
  )
    template(v-slot:edit-item="item")
      .item-title 抽检、登记
      a-form-item(label="瘦肉精")
        span.itemContent 
          //- span.deleteRow(v-if="item.record.clenbuterol === 'FAILED'") 阳
          //- span.normalRow(v-else-if="item.record.clenbuterol === 'PASSED'") 阴 
          span.deleteRow(v-if="item.record.clenbuterol === 'POSITIVE'") 阳
          span.normalRow(v-else-if="item.record.clenbuterol === 'NEGATIVE'") 阴 
          span.normalRow(v-else-if="item.record.clenbuterol === 'UNSELECTED'") 检测中 
          span(v-else) --
      a-form-item(label="含水量")
        span.itemContent 
          //- span.deleteRow(v-if="item.record.watered === 'FAILED'") 阳
          //- span.normalRow(v-else-if="item.record.watered === 'PASSED'") 阴 
          span.deleteRow(v-if="item.record.watered === 'POSITIVE'") 阳
          span.normalRow(v-else-if="item.record.watered === 'NEGATIVE'") 阴 
          span.normalRow(v-else-if="item.record.watered === 'UNSELECTED'") 检测中 
          span(v-else) --
      a-form-item(label="抽检结果")
        span.itemContent 
          span.deleteRow(v-if="item.record.watered === 'POSITIVE' || item.record.clenbuterol === 'POSITIVE'") 不合格
          span.normalRow(v-else-if="item.record.watered === 'NEGATIVE'&&item.record.clenbuterol === 'NEGATIVE'") 合格 
          span.normalRow(v-else-if="item.record.watered === 'UNSELECTED'||item.record.clenbuterol === 'UNSELECTED'") 检测中 
          span(v-else) -- 
      a-form-item(label="登记员")
        //- span.itemContent {{item.record.registerName? item.record.registerName:'--'}} 
        span.itemContent {{item.record.registrantName? item.record.registrantName:'--'}} 
      a-form-item(label="抽检员")
        span.itemContent {{item.record.inspectorName? item.record.inspectorName:'--'}} 
      a-form-item(label="检疫票数")
        span.itemContent {{item.record.pratiqueTickets || item.record.pratiqueTickets === 0 ? item.record.pratiqueTickets:'--'}} 片
          a(v-if="details" :style="{marginLeft: '10px',cursor: 'point'}" @click="showTickets(item.record)")
            IconFont(type="icon-fangdajing")
            a 查看
      .item-title 理货信息 
      a-form-item(label="理货状态")
        span.itemContent {{item.record.porkArrangeStatus==='WAITED'? '待理货': item.record.porkArrangeStatus==='PROGRESSED'? '理货中': item.record.porkArrangeStatus==='PAUSED'? '暂停理货': item.record.porkArrangeStatus==='FINISHED'? '理货完成':'--'}}
      a-form-item(label="理货片数")
        span.itemContent {{item.record.porkArrangeSlices? item.record.porkArrangeSlices:'--'}} 片
      a-form-item(label="理货重量")
        span.itemContent {{item.record.porkArrangeWeight? item.record.porkArrangeWeight:'--'}} kg
      a-form-item(label="完成时间")
        span.itemContent {{item.record.porkArrangeTime? timeFormat(item.record.porkArrangeTime,true):'--'}}
      .item-title 理货商品
      div
        //- @change="changePage"
        a-table.p2.tallyInfo(
          style="padding-left:0px"
          :data-source="data"
          :columns="columns"
          size="middle"
          :rowKey="(record)=>record.id"
          :pagination="pagination"
          :loading="loading")
          template(#action="{record}") 
            a(@click="handleDetials(record)") 详情
            a(style="margin-left: 10px" @click="mxDetials(record)") 明细
      .item-title(v-if="item.record?.auditStatus !== 'AUDIT'") 审核信息
      a-form-item(label="审核结果" v-if="item.record?.auditStatus !== 'AUDIT'")
        span.itemContent 
          span.deleteRow(v-if="item.record.auditStatus === 'FAILED'") 不通过
          span(v-else-if="item.record.auditStatus === 'PASSED'") 已通过 
          span(v-else-if="item.record.auditStatus === 'AUDIT'") 待审核 
          span.normalRow(v-else) --   
      a-form-item(label="不通过原因" v-if="item.record.auditStatus === 'FAILED'")
        span.itemContent.failReason {{item.record.remark?item.record.remark:'--'}}
      a-form-item(label="审核记录" v-if="auditTimes?.length" class="a-form-item-100")
        a-timeline.p2
          a-timeline-item(v-for="item in auditTimes" :color="item.status==='FAILED'? 'red':'blue'") 
            span.p1 审核时间：{{timeFormat(item.time,true) }}
            div.p1 审核员：{{item.auditorName}}
            div.p1 审核结果: 
              span.deleteRow(v-if="item.status==='FAILED'") 不通过
              span.deleteRow(v-else-if="item.status==='PASSED'") 通过
              span.normalRow(v-else) -- 
            div.p1(v-if="item.status==='FAILED'")  不通过原因：
              span {{item?.remark}}
    template(v-slot:btn="form")
      a-button(type="danger" v-if="route.query.audit" @click="openModal") 不通过
      a-button(v-if="route.query.audit" @click="examine(true)" type="primary") 通过
  a-modal(v-model:visible="visible" title="不通过" @cancel="closeModal" @ok="examine(false)" :maskClosable="false" centered)
    a-form(ref="remarkForm" :model="dataForm" :rules="rules" labelAlign="right")
      a-form-item(label="不通过原因：" name="remark")
        a-textarea.textarea(v-model:value="dataForm.remark" placeholder="请输入" showCount :maxlength="200")    
  a-modal(v-model:visible="tickets" title="检疫票信息" :maskClosable="false" :footer="false" centered)
    div.p2.bold(v-if="data")
      span 检疫票张数：
      span.normalRow {{pratiqueTickets}}
      span 张
    div.p2(v-if="data")
      div.pb1 号码段：
      div.p2.mb1.number(v-for="item in pratiqueCodes" :key="item.id") {{item}}   
  a-modal(v-model:visible="showDetails" title="详情" @ok="setCheatHandle()" :maskClosable="false" centered)
    div.p2
      span 电子标签：
      span {{detailData?.label || '--'}}
    div.p2
      span 理货编码：
      span {{detailData?.footMarkCode || '--'}}
    div.p2
      span 作弊状态：
      span.deleteRow(v-if="detailData?.cheat") 作弊嫌疑
      span(v-else) 正常
    div.p2
      div.flex 
        span.keep 图片抓拍：
        div.relative
          span(v-if="!detailData?.picFilePaths || detailData?.picFilePaths.length == 0") {{ '--' }}
          a-image-preview-group(v-if="detailData?.picFilePaths && detailData?.picFilePaths.length>0")
            a-image( v-for="item in detailData?.picFilePaths" :src="item" :width="40" :height="40") 
    div.p2
      span 状态矫正：
      span.normalRow 
        a-select(v-model:value="setCheat" placeholder="请选择作弊状态" :style="'width:218px;'")
          a-select-option( :value="true") 作弊嫌疑
          a-select-option( :value="false") 正常
a-modal(v-model:visible="mxval" title="明细" @ok="mxval=false" :maskClosable="false" centered width="50%")
  a-table(
       :data-source="mxdata"
      :columns="columns1" 
      size="middle"
     ) 

</template>
<script lang="jsx">
import {
  h,
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  toRefs,
  createVNode,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
import { Popover, Modal, TableColumn } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
const fallback =
  "data:image/png;base64,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";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      api: {
        detail: "tallyDataAuditId",
      },
      formList: [
        {
          title: "报备信息",
          form: [
            { label: "商家名称", value: "supplierName" },
            { label: "商家编号", value: "supplierCode" },
            { label: "报备单号", value: "porkReportCode" },
            {
              label: "报备商品",
              value: "goodsCategoryName",
              html: true,
              detailFun: (value, form) => {
                return `<span style="margin-left:5px;"> ${
                  form.goodsCategoryName ? form.goodsCategoryName : "--"
                } </span><span class="${
                  form.freshLabel ? getFreshLabel(form.freshLabel).color : ""
                }">${form.freshLabel ? getFreshLabel(form.freshLabel).name : ""}</span>`;
              },
            },
            { label: "报备片数", value: "porkReportSlices", unit: "片" },
            { label: "报备重量", value: "porkReportWeight", unit: "Kg" },
            { label: "理货片数", value: "porkArrangeSlices", unit: "片" },
            { label: "理货重量", value: "porkArrangeWeight", unit: "Kg" },
            { label: "档位号", value: "stallName" },
            { label: "养殖场", value: "originPlace" },
            { label: "屠宰场", value: "abattoirName" },
          ],
        },
      ],
      data: null,
      mxdata: null,
      pratiqueTickets: null,
      pratiqueCodes: [],
    });
    const tallyTimes = reactive({
      auditTimes: null,
    });

    const tableState = reactive({
      columnList: [
        // "sort",
        "label",
        "footMarkCode",
        "weight",
        "tallyPorkArrangeTime",
        "cheat",
      ],
      columns: [
        {
          mark: "label",
          dataIndex: "label",
          key: "label",
          title: "电子标签",
          slots: {
            customRender: "label",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "footMarkCode",
          dataIndex: "footMarkCode",
          key: "footMarkCode",
          title: "理货编码",
          slots: {
            customRender: "footMarkCode",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "weight",
          dataIndex: "weight",
          key: "weight",
          title: "净重（kg）",
          slots: {
            customRender: "weight",
          },
          // width: 105,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.weightCompliant != undefined && !record.weightCompliant) {
              return (
                <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                  {text || text === 0 ? `${millennial(text)}` : "--"}
                  <a-tag style="margin-left:5px;" color="red">
                    不达标
                  </a-tag>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                  {text || text === 0 ? `${millennial(text)}` : "--"}
                </PopOver>
              );
            }
          },
        },
        {
          mark: "porkArrangeTime",
          dataIndex: "porkArrangeTime",
          key: "porkArrangeTime",
          title: "理货时间",
          slots: {
            customRender: "porkArrangeTime",
          },
          // width: 180,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "cheat",
          dataIndex: "cheat",
          key: "cheat",
          title: "作弊状态",
          slots: {
            customRender: "cheat",
          },
          // width: 180,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (!text) {
              if (!record.cheatUpdated) {
                return "正常";
              }
              return [
                h(
                  Popover,
                  { content: "正常" },
                  {
                    default: () => {
                      return (
                        <>
                          正常
                          <a-tag style="margin-left:5px;" color="green">
                            已修改
                          </a-tag>
                        </>
                      );
                    },
                  }
                ),
              ];
            } else {
              if (!record.cheatUpdated) {
                return <span class="deleteRow">作弊嫌疑</span>;
              }
              // 加tag区分
              return [
                h(
                  Popover,
                  { content: "作弊嫌疑" },
                  {
                    default: () => {
                      return (
                        <>
                          <span class="deleteRow">作弊嫌疑</span>
                          <a-tag style="margin-left:5px;" color="green">
                            已修改
                          </a-tag>
                        </>
                      );
                    },
                  }
                ),
              ];
            }
          },
        },
        {
          mark: "picFilePaths",
          dataIndex: "picFilePaths",
          key: "picFilePaths",
          title: "图片抓拍",
          slots: {
            customRender: "picFilePaths",
          },
          customRender: ({ text }) => {
            let imagePath = Array.isArray(text) ? text[0] : text;
            if (!imagePath) return "--";
            if (imagePath.indexOf("session") === -1)
              imagePath = imagePath + "?session=" + window.videoSession;
            return <a-image src={imagePath} width="20" height="20" />;
          },
        },
        {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      columns1: [
        {
          mark: "label",
          dataIndex: "label",
          key: "label",
          title: "电子标签",
          slots: {
            customRender: "label",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "footMarkCode",
          dataIndex: "footMarkCode",
          key: "footMarkCode",
          title: "理货编码",
          slots: {
            customRender: "footMarkCode",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "weight",
          dataIndex: "weight",
          key: "weight",
          title: "净重（kg）",
          slots: {
            customRender: "weight",
          },
          // width: 105,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.weightCompliant != undefined && !record.weightCompliant) {
              return (
                <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                  {text || text === 0 ? `${millennial(text)}` : "--"}
                  <a-tag style="margin-left:5px;" color="red">
                    不达标
                  </a-tag>
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                  {text || text === 0 ? `${millennial(text)}` : "--"}
                </PopOver>
              );
            }
          },
        },
        {
          mark: "porkArrangeTime",
          dataIndex: "porkArrangeTime",
          key: "porkArrangeTime",
          title: "理货时间",
          slots: {
            customRender: "porkArrangeTime",
          },
          // width: 180,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "cheat",
          dataIndex: "cheat",
          key: "cheat",
          title: "作弊状态",
          slots: {
            customRender: "cheat",
          },
          // width: 180,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (!text) {
              if (!record.cheatUpdated) {
                return "正常";
              }
              return [
                h(
                  Popover,
                  { content: "正常" },
                  {
                    default: () => {
                      return (
                        <>
                          正常
                          <a-tag style="margin-left:5px;" color="green">
                            已修改
                          </a-tag>
                        </>
                      );
                    },
                  }
                ),
              ];
            } else {
              if (!record.cheatUpdated) {
                return <span class="deleteRow">作弊嫌疑</span>;
              }
              // 加tag区分
              return [
                h(
                  Popover,
                  { content: "作弊嫌疑" },
                  {
                    default: () => {
                      return (
                        <>
                          <span class="deleteRow">作弊嫌疑</span>
                          <a-tag style="margin-left:5px;" color="green">
                            已修改
                          </a-tag>
                        </>
                      );
                    },
                  }
                ),
              ];
            }
          },
        },
        {
          mark: "picPaths",
          dataIndex: "picPaths",
          key: "picPaths",
          title: "图片抓拍",
          slots: {
            customRender: "picPaths",
          },
          customRender: ({ text }) => {
            return (
              <div>
                {text.split(",").map((item) => {
                  return <a-image src={item} width="20" height="20" />;
                })}
              </div>
            );
          },
        },
      ],
      loading: false,
      pagination: {
        pageSize: 10,
      },
    });

    const status = reactive({
      spinning: false,
    });

    const remarkForm = ref();
    const visible = ref(false);
    const tickets = ref(false);
    const mxval = ref(false);

    const dataForm = reactive({
      id: "",
      remark: null,
    });

    const rules = {
      remark: [
        {
          required: true,
          message: "请输入不通过原因",
        },
      ],
    };

    // 有id
    const id = route.query.id;
    const details = route.query.type;
    const audit = route.query.audit;
    const porkReportCode = route.query.porkReportCode;

    const getData = async (params) => {
      tableState.loading = true;
      const data = await proxy.$api.getTallyProduct(params, "get");
      formState.data = data;

      proxy.$api.tallyAuditTimes({ id: id }, "get").then((res) => {
        tallyTimes.auditTimes = res;
      });
      tableState.loading = false;
    };

    const cancel = () => {
      formState.data = null;
      router.back(-1);
    };

    const examine = (status) => {
      dataForm.id = route.query.id;
      if (status) {
        Modal.confirm({
          title: "提示",
          content: "是否审核通过？",
          okText: "确定",
          cancelText: "取消",
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            proxy.$api
              .tallyDataAudit(
                {
                  ...dataForm,
                  id: id,
                  status: "PASSED",
                },
                "put"
              )
              .then((res) => {
                history.back();
                proxy.$message.success("操作成功");
              });
          },
        });
      } else {
        remarkForm.value
          .validate()
          .then(() => {
            proxy.$api
              .tallyDataAudit({ ...dataForm, id: id, status: "FAILED" }, "put")
              .then((res) => {
                router.back(-1);
                proxy.$message.success("操作成功");
              });
          })
          .catch(function(){});
      }
    };

    const openModal = () => {
      visible.value = true;
    };

    const closeModal = () => {
      visible.value = false;
      remarkForm.value.resetFields();
    };

    const showTickets = (record) => {
      formState.pratiqueTickets = record.pratiqueTickets;
      formState.pratiqueCodes = record.pratiqueCodes;
      tickets.value = true;
    };

    const fallback =
      "data:image/png;base64,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";
    const detailData = ref();
    const showDetails = ref(false);
    const setCheat = ref(false);
    // 详情弹窗
    const handleDetials = (record) => {
      showDetails.value = true;
      if (record.picFilePaths) {
        record.picFilePaths = record.picFilePaths.map((item) => {
          const imgPath =
            item.indexOf("session") === -1
              ? item + "?session=" + window.videoSession
              : item;
          return imgPath;
        });
      }
      detailData.value = record;
      setCheat.value = record?.cheat;
    };
    //明细弹窗
    const mxDetials = async ({ porkReportCode, label }) => {
      const params = {
        porkReportCode,
        label,
      };
      const data = await proxy.$api.logrecords(params, "get");
      formState.mxdata = data;
      mxval.value = true;
    };
    // 修改作弊状态
    const setCheatHandle = () => {
      proxy.$api
        .updateCheat({
          porkArrangeDetailId: detailData.value.id,
          cheat: setCheat.value,
        })
        .then((res) => {
          proxy.$message.success("操作成功");
          showDetails.value = false;
          if (porkReportCode) {
            getData(porkReportCode);
          }
        })
        .finally(() => {
          showDetails.value = false;
          if (porkReportCode) {
            getData(porkReportCode);
          }
        });
    };

    // const changePage = (e) => {
    //   tableState.pagination.current = e.current;
    //   getData({ id: id, pageNumber: e.current });
    // };

    onMounted(() => {
      // tableState.columns = tableColumns("tallyData", tableState.columnList);
      if (porkReportCode) {
        getData(porkReportCode);
      }
    });

    return {
      ...toRefs(status),
      ...toRefs(tableState),
      ...toRefs(tallyTimes),
      route,
      ...toRefs(formState),
      cancel,
      timeFormat,
      details,
      audit,
      remarkForm,
      visible,
      tickets,
      mxval,
      dataForm,
      rules,
      mxDetials,
      examine,
      openModal,
      closeModal,
      showTickets,
      // changePage,
      handleDetials,
      detailData,
      showDetails,
      setCheat,
      fallback,
      setCheatHandle,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");

// .normalRow {
//   font-weight: bold;
// }
.ant-timeline.p2 {
  padding-top: 10px;
}

.bold {
  font-weight: bold;
}
.relative :deep(.ant-image) {
  margin-right: 10px;
  margin-bottom: 10px;
}
.keep {
  word-break: keep-all;
}
.number {
  background-color: #fbfbfb;
  width: 100%;
  height: 49px;
  text-align: center;
}
.detail-form .tallyInfo :deep(.ant-image) {
  background: none;
  margin-right: 0;
  margin-bottom: 0;
  width: 30px;
}
.detail-form, :deep(.detail-form) {
  height: calc(100vh - 250px) !important;
}
</style>
