<template lang="pug">
g-table(
  title="理货数据审核"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="TALLY_DATA_AUDIT"
  :editMode="editMode" 
  :api="api" 
  ref="tableRef")   
  template(v-slot:btn="item")
    a-button(@click="details(item.record,'detail')" :disabled="item.record.mark" type="link") 理货审核
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
// import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { tallyDataStatus } from "@/utils/enumerate";
import { replaceObjectKeys } from "@pansy/utils";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const state = reactive({
      columnList: [
        "supplierName",
        "supplierCode",
        "goodsCategoryName",
        "porkReportCode",
        "porkReportSlices",
        "porkReportWeight",
        "porkArrangeSlices",
        "porkArrangeWeight",
        "porkArrangePlace",
        "porkArrangeStatus",
        "pratiqueTickets",
        "clenbuterol",
        "watered",
        "spotCheckStatus",
        "porkArrangeTime",
        "action",
      ],
      // columnList: [
      //   "merchantName",
      //   "merchantCode",
      //   "goodsCategoryName",
      //   "porkReportCode",
      //   "porkReportSlices",
      //   "porkReportWeight",
      //   "porkArrangeSlices",
      //   "porkArrangeWeight",
      //   "porkArrangePlace",
      //   "arrangeStatus",
      //   "pratiqueTickets",
      //   "clenbuterol",
      //   "watered",
      //   "result",
      //   "porkArrangeTime",
      //   "action",
      // ],
      columns: [
        {
          mark: "supplierName",
          dataIndex: "supplierName",
          key: "supplierName",
          title: "商家名称",
          slots: {
            customRender: "supplierName",
          },
          width: 200,
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.riskLevel === "MEDIUM") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="orange">中风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else if (record.riskLevel === "HIGH") {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="red">高风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? text : "--"}>
                  <a-tag color="green">低风险</a-tag>
                  {text ? text : "--"}
                </PopOver>
              );
            }
          },
        },
        {
          mark: "supplierCode",
          dataIndex: "supplierCode",
          key: "supplierCode",
          title: "商家编号",
          slots: {
            customRender: "supplierCode",
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
        // 暂无
        {
          mark: "goodsCategoryName",
          dataIndex: "goodsCategoryName",
          key: "goodsCategoryName",
          title: "商品名称",
          slots: {
            customRender: "goodsCategoryName",
          },
          // width: 90,
          ellipsis: true,
          customRender: ({ text, record }) => {
            return (
              <PopOver position="topLeft" content={record.goodsCategoryName ? record.goodsCategoryName : "--"}>
                {record.goodsCategoryName ? record.goodsCategoryName : "--"}
                <span style="margin-left:5px;" class={record.freshLabel ? getFreshLabel(record.freshLabel).color : "" }>{record.freshLabel ? getFreshLabel(record.freshLabel).name : ""}</span>
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportCode",
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          title: "批次号",
          slots: {
            customRender: "porkReportCode",
          },
          // width: 80,
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
          mark: "porkReportSlices",
          dataIndex: "porkReportSlices",
          key: "porkReportSlices",
          title: "报备片数（片）",
          slots: {
            customRender: "porkReportSlices",
          },
          // width: 140,
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `${millennial(text, false)}` : ""}
              >
                {text || text === 0 ? `${millennial(text, false)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkReportWeight",
          dataIndex: "porkReportWeight",
          key: "porkReportWeight",
          title: "报备重量（kg）",
          slots: {
            customRender: "porkReportWeight",
          },
          // width: 140,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        },
        {
          mark: "porkArrangeSlices",
          dataIndex: "porkArrangeSlices",
          key: "porkArrangeSlices",
          title: "理货片数（片）",
          slots: {
            customRender: "porkArrangeSlices",
          },
          // width: 140,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text || text === 0 ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "porkArrangeWeight",
          dataIndex: "porkArrangeWeight",
          key: "porkArrangeWeight",
          title: "理货重量（kg）",
          slots: {
            customRender: "porkArrangeWeight",
          },
          // width: 140,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? `${millennial(text)}` : ""}>
                {text || text === 0 ? `${millennial(text)}` : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "porkArrangePlace",
          dataIndex: "porkArrangePlace",
          key: "porkArrangePlace",
          title: "理货点",
          slots: {
            customRender: "porkArrangePlace",
          },
          // width: 80,
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        }, {
          mark: "porkArrangeStatus",
          dataIndex: "porkArrangeStatus",
          key: "porkArrangeStatus",
          title: "理货状态",
          slots: {
            customRender: "porkArrangeStatus",
          },
          customRender: ({ text }) => {
            const val = text==='WAITED'? '待理货': text==='PROGRESSED'? '理货中': text==='PAUSED'? '暂停理货': text==='FINISHED'? '理货完成':'--'
            return (
              <PopOver position="topLeft" content={val}>
                {val}
              </PopOver>
            );
          },
        }, {
          mark: "pratiqueTickets",
          dataIndex: "pratiqueTickets",
          key: "pratiqueTickets",
          title: "检疫票数（张）",
          slots: {
            customRender: "pratiqueTickets",
          },
          // width: 140,
          customRender: ({ record, text }) => {
            if (!text && text !== 0) {
              return "--";
            } else {
              if (text < Math.ceil(record.porkArrangeSlices / 2)) {
                return (
                  <PopOver position="topLeft" content={millennial(text, false)}>
                    <span class="deleteRow">{millennial(text, false)}</span>
                  </PopOver>
                );
              } else {
                return (
                  <PopOver position="topLeft" content={millennial(text, false)}>
                    {millennial(text, false)}
                  </PopOver>
                );
              }
            }
          },
        }, {
          mark: "clenbuterol",
          dataIndex: "clenbuterol",
          key: "clenbuterol",
          title: "瘦肉精",
          slots: {
            customRender: "clenbuterol",
          },
          customRender: ({ text }) => {
            const val = text==='POSITIVE' ? '阳': text==='NEGATIVE' ? '阴': text==='UNSELECTED' ? '检测中' : '--'
            return (
              <PopOver position="topLeft" content={val}>
                {val}
              </PopOver>
            );
          },
        }, {
          mark: "watered",
          dataIndex: "watered",
          key: "watered",
          title: "含水量",
          slots: {
            customRender: "watered",
          },
          customRender: ({ text }) => {
            const val = text==='POSITIVE' ? '阳': text==='NEGATIVE' ? '阴': text==='UNSELECTED' ? '检测中' : '--'
            return (
              <PopOver position="topLeft" content={val}>
                {val}
              </PopOver>
            );
          },
        }, {
          mark: "spotCheckStatus",
          dataIndex: "spotCheckStatus",
          key: "spotCheckStatus",
          title: "抽检结果",
          slots: {
            customRender: "spotCheckStatus",
          },
          customRender: ({ text, record }) => {
            const val = (record.watered === 'POSITIVE' || record.clenbuterol === 'POSITIVE') ? '不合格': (record.watered === 'NEGATIVE' && record.clenbuterol === 'NEGATIVE') ? '合格': (record.watered === 'UNSELECTED' || record.clenbuterol === 'UNSELECTED') ? '检测中' : '--'
            return (
              <PopOver position="topLeft" content={val}>
                {val}
              </PopOver>
            );
          },
        }, {
          mark: "porkArrangeTime",
          dataIndex: "porkArrangeTime",
          key: "porkArrangeTime",
          title: "理货完成时间",
          slots: {
            customRender: "porkArrangeTime",
          },
          // width: 180,
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
        }, {
          mark: "action",
          dataIndex: "action",
          title: "操作",
          key: "action",
          slots: {
            customRender: "action",
          },
          width:150,
          fixed: "right",
        },
      ],
      api: {
        list: "getTallyDataAudit",
      },
      btns: [],
      search: [
        {
          label: "理货状态",
          value: "arrangeStatus",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(tallyDataStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
        },
        {
          label: "",
          value: "auditStatus",
          // defaultValue: "AUDIT",
          defaultValue: "AUDIT",
          component: "span",
        },
        {
          label: "",
          value: "status",
          defaultValue: "false",
          component: "span",
        },
      ],
      editMode: "page",
    });

    onMounted(() => {
      // state.columns = tableColumns("tallyData", state.columnList);
    });

    const details = (record, detail) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/tallyDataDetails?id=${boothId}&type=detail&audit=${true}&porkReportCode=${record.porkReportCode}`)
    };

    return {
      ...toRefs(state),
      details,
    };
  },
});
</script>
<style scoped lang="less">
//:deep(.ant-badge) {
// height: 22px;
// line-height: 22px;
// position: absolute;
// top: -15px;
//  left: -5px;
//}
</style>
