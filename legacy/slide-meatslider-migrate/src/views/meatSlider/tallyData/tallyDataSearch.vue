<template lang="pug">
g-table(
  title="理货数据查询"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="TALLY_DATA_SEARCH"
  :editMode="editMode" 
  :api="api" 
  :beforeGet="beforeGet"
  @reset="reset"
  ref="tableRef"
)   
  template(v-slot:pre-item="record")
    a-form-item(label="理货点")
      a-select(
        v-model:value="deviceList"
        style="width: 230px;"
        placeholder="请选择" 
        :dropdownStyle="{display: 'none'}"
        :dropdownClassName="'hide'"
        :labelInValue="true"
        mode="multiple"
        :maxTagCount="3"
        @click="openDevice")
  template(v-slot:btn="item")
    a-space(:size="16")
      a(@click="details(item.record,'detail')") 详情
      a-popconfirm(
        v-if="item.record.auditStatus === 'FAILED'"
        title="是否撤销"
        cancelText="取消"
        okText="确定"
        @confirm.stop="cancel(item.record)")
        a(@click.stop="") 撤销
      a(v-else disabled) 撤销
deviceModal(
  v-model:visible="visible" v-model:activeId="deviceList" @close="closeDevice"
)
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
import { tallyDataAuditStatus } from "@/utils/enumerate";
import { replaceObjectKeys } from "@pansy/utils";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
import deviceModal from "./device.vue";

export default defineComponent({
  components: {
    deviceModal,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const tableRef = ref();
    const state = reactive({
      deviceList: [],
      visible: false,
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
        "auditTime",
        "auditStatus",
        "remark",
        "action",
      ],
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
          mark: "auditTime",
          dataIndex: "auditTime",
          key: "auditTime",
          title: "审核时间",
          slots: {
            customRender: "auditTime",
          },
          // width: 110,
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
          ellipsis: true,
        }, {
          mark: "auditStatus",
          dataIndex: "auditStatus",
          key: "auditStatus",
          title: "审核状态",
          slots: {
            customRender: "auditStatus",
          },
          // width: 90,
          customRender: ({ text }) => {
            const val = text==='AUDIT' ? '待审核': text==='PASSED' ? '已通过': text==='FAILED' ? '不通过' : '--'
            return (
              <PopOver position="topLeft" content={val}>
                {val}
              </PopOver>
            );
          },
        }, {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
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
          mark: "action",
          dataIndex: "action",
          title: "操作",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 150,
          fixed: "right",
        }
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
          options: [
            {
              label: "全部",
              value: " ",
            },
            {
              label: "待理货",
              value: "WAITED",
            },
            {
              label: "理货中",
              value: "PROGRESSED",
            },
            {
              label: "暂停理货",
              value: "PAUSED",
            },
            {
              label: "理货完成",
              value: "FINISHED",
            },
          ],
          placeholder: "请选择",
        },
        {
          label: "审核状态",
          value: "auditStatus",
          component: "a-select",
          defaultValue: " ",
          options: replaceObjectKeys(tallyDataAuditStatus, {
            name: "label",
            value: "value",
          }),
          placeholder: "请选择",
        },
        {
          label: "抽检结果",
          value: "spotCheckResult",
          component: "a-select",
          defaultValue: " ",
          options: [
            {
              label: "全部",
              value: " ",
            },
            {
              label: "合格",
              value: "1",
            },
            {
              label: "不合格",
              value: "0",
            }
          ],
          placeholder: "请选择",
        },
        {
          label: "审核时间",
          value: "date",
          defaultDate: "auditPeriod",
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
        },
        {
          label: "",
          value: "status",
          defaultValue: "true",
          component: "span",
        },
      ],
    });
    const beforeGet = (params) => {
      params.deviceIds = state.deviceList.map(item => { return item.value }).join(',');
      return params;
    };
    const reset = () => {
      state.deviceList = []
    };
    const openDevice = () => {
      state.visible = true;
    };
    const closeDevice = (data) => {
      if (data) {
        state.deviceList = data.map(item => { return { value: item.deviceId, label: item.deviceName } })
      }
      state.visible = false
    };

    const details = (record, detail) => {
      const boothId = record?.id ? record.id : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/tallyDataDetails?id=${boothId}&type=detail&porkReportCode=${record.porkReportCode}`)
    };

    const cancel = async (record) => {
      await proxy.$api.TallyDataAuditRescind(record.id, "put");
      tableRef.value.getData();
    };

    return {
      ...toRefs(state),
      details,
      cancel,
      tableRef,
      closeDevice,
      openDevice,
      beforeGet,
      reset
    };
  },
});
</script>
<style scoped lang="less"></style>
