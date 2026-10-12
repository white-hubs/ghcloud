<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    :search="search"
    :editMode="'page'"
    :columns="columns"
    tableCode="MAINTENANCE_STATISTICS"
    :beforeGet="beforeGet"
    :scrollX="800"
    :rowSelection="false"
    searchCache="true"
  >
  <template v-slot:header-btns="{ record }">
    <a-button 
      type="primary"
      :loading="exportLoading"
      @click="handleExport"
      >
      导出
    </a-button>
  </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { usePageName  } from '@ghcloud/cube-utils'
import { exportExcel } from "@/utils/common.js"

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const tableRef = ref();
    const state = reactive({
      api: {
        list: "maintenanceDeviceStatistics",
      },
      btns: [""],
      search: [
        {
          label: "产品品类",
          value: "categoryCode",
          component: "g-cascader",
          url: 'getDeviceProduct',
          field: { categoryName: "label", categoryCode: "value", children: "children" },
          placeholder: "请选择产品品类",
        },
        {
          label: "时间范围",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        { label: "", value: "keyword", placeholder: "设备名称" },
      ],
      columns: [
        {
          dataIndex: "name",
          title: "设备名称",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "categoryName",
          title: "产品品类",
          slots: {
            customRender: "categoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "num",
          title: "维保次数",
          slots: {
            customRender: "num",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            return (
              <a-button type="link" onClick={() => {handleCount(record)}} >{text ?? '--'}</a-button>
            );
          },
        },
        {
          dataIndex: "lastTime",
          title: "最近维保时间",
          slots: {
            customRender: "lastTime",
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
        },
      ],
      exportLoading: false,
      searchParams: {}
    });

    const beforeGet = (params) => {
      if(Array.isArray(params.categoryCode)) params.categoryCode = params.categoryCode[params.categoryCode.length -1]
      state.searchParams = {...params}
      return {
        ...params
      }
    };

    const handleCount = (record) => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/maintenance/maintenanceTask?deviceName=${record.name}&type=COMPLETED`
      );
    };
    const handleExport = async ()=>{
      try {
        state.exportLoading = true
        await exportExcel('/maintain/maintenance/device/statistics/export', {
          ...state.searchParams
        }, '维保统计.xlsx')
      } catch (error) {
      } finally {
        setTimeout(() => { state.exportLoading = false }, 1000);
      }
    };
    return {
      tableRef,
      ...toRefs(state),
      handleCount,
      beforeGet,
      handleExport,
      pageTitle
    };
  },
});
</script>
