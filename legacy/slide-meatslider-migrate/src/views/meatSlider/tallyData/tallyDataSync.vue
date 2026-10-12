<template lang="pug">
g-table(
  title="理货数据同步"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="TALLY_DATA_SYNC"
  :editMode="editMode" 
  :api="api" 
  :beforeGet="beforeGet"
  @reset="reset"
  ref="tableRef"
  :tableCheckbox="tableCheckbox"
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
      a(type="link" @click="singleSync(item.record)") 同步
  template(v-slot:batch="item")
    a-button(type="primary" @click="batchSync(item.record)" :disabled="item.record&&item.record.length === 0") 批量同步
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
import { tallyDataAuditStatus } from "@/utils/enumerate";
import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
import deviceModal from "./device.vue";
import moment from 'moment'

export default defineComponent({
  components: {
    deviceModal,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const tableRef = ref();
    const toDay = ref([moment().startOf('day').format('YYYY-MM-DD'),moment().endOf('day').format('YYYY-MM-DD')])
    const state = reactive({
      deviceList: [],
      visible: false,
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
          mark: "auditTime",
          dataIndex: "auditTime",
          key: "auditTime",
          title: "理货时间",
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
          mark: "status",
          dataIndex: "status",
          key: "status",
          title: "同步状态",
          slots: {
            customRender: "status",
          },
          // width: 90,
          customRender: ({ text, record }) => {
            const val = record.pushStatus || record.status;
            const res = val==='PUSH_FAIL'? '推送失败': val==='PUSH_SUCCESS'? '推送成功':'--'
            return (
              <PopOver position="topLeft" content={res}>
                {res}
              </PopOver>
            );
          }
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
        list: "getTallyDataSyncPage",
      },
      btns: [],
      search: [
        {
          label: "状态",
          value: "status",
          component: "a-select",
          defaultValue: " ",
          options: [
            {
              label: "全部",
              value: " ",
            },
            {
              label: "推送成功",
              value: "PUSH_SUCCESS",
            },
            {
              label: "推送失败",
              value: "PUSH_FAIL",
            },
          ],
          placeholder: "请选择",
        },
        {
          label: "理货时间",
          value: "date",
          defaultDate: "period",
          date: toDay.value,
          component: "a-range-picker",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "商家名称/商家编号/批次号",
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
    const singleSync = (record) => {
      proxy.$api.putTallyDataSync([record.porkReportCode]).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const batchSync = (record) => {
      const batchData = tableRef.value.dataSource.filter(
        (item) => record.indexOf(item.porkReportCode) > -1
      );
      const ids = batchData.map((item) => item.porkReportCode);
      proxy.$api.putTallyDataSync(ids).then(() => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const tableCheckbox = (record) => {
    };
    return {
      ...toRefs(state),
      details,
      tableRef,
      closeDevice,
      openDevice,
      beforeGet,
      reset,
      tableCheckbox,
      batchSync,
      singleSync,
      toDay
    };
  },
});
</script>
<style scoped lang="less"></style>
