<template>
  <g-table tableCode="INSPECTION_ACCOUNT" :title="pageTitle" :columns="columns" :api="api" :search="search" :btns="btns" :slots="slots" :editMode="'page'"
    :rowKey="'targetId'" :rules="rules" :beforeGet="beforeGet" :scrollX="900" ref="tableRef">
    <template v-slot:header-btns>
      <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading"
        :disabled="Number(tableRef?.page?.total) === 0" @click="downloadExcel">导出</a-button>
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
import { timeFormat, extractTree } from "@/utils/common";
import { exportExcel } from "@/utils/export-excel.js";
import moment from "moment";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const { pageTitle } = usePageName()
    const state = reactive({
      columns: [
        {
          dataIndex: "targetName",
          title: "对象名称",
          slots: {
            customRender: "targetName",
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
          dataIndex: "targetCategory",
          title: "对象类型",
          slots: {
            customRender: "targetCategory",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let obj = {
              'DEVICE': '设备',
              'STALL': '档位',
              'PROPERTY': '资产',
              'SITE_POINT': '现场点',
              'RISK_SOURCE': '风险源',
              'SMALL_ENGINEERING': '小散工程',
            }
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {obj[text] ? obj[text] : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaName",
          title: "所在区域",
          slots: {
            customRender: "areaName",
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
          dataIndex: "organizationName",
          title: "所属部门",
          slots: {
            customRender: "organizationName",
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
          dataIndex: "nickname",
          title: "巡检人员",
          slots: {
            customRender: "nickname",
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
          dataIndex: "time",
          title: "最近一次巡检时间",
          slots: {
            customRender: "time",
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
        {
          dataIndex: "result",
          title: "最近一次巡检结果",
          slots: {
            customRender: "result",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? (text === "NORMAL" ? "正常" : "异常") : ""}
              >
                <span class={text?.toLocaleLowerCase()}>
                  {text ? (text === "NORMAL" ? "正常" : "异常") : "--"}
                </span>
              </PopOver>
            );
          },
          ellipsis: true,
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          // width: 200,
        },
      ],
      api: {
        list: "targetRecordPage",
        path: "/inspectionAccountFileDetails",
      },
      btns: ["detail"],
      search: [
        {
          label: "类型",
          value: "targetCategory",
          component: "g-select",
          defaultValue: null,
          field: { name: "label", id: "value" },
          options: [{
            name: '全部',
            id: null
          }, {
            name: '设备',
            id: "DEVICE"
          }, {
            name: '资产',
            id: "STALL"
          }, {
            name: '档位',
            id: "PROPERTY"
          }, {
            name: '现场点',
            id: "SITE_POINT"
          }, {
            name: '风险源',
            id: "RISK_SOURCE"
          }
          ],
          placeholder: "",
        },
        {
          label: "时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
          placeholder: "名称",
        },
        // {
        //   label: "区域",
        //   value: "areaId",
        //   component: "g-select",
        //   defaultValue: "",
        //   options: [],
        //   field: { name: "label", id: "value" },
        //   placeholder: "请选择区域",
        // },
        {
          label: "区域",
          value: "areaId",
          placeholder: "请选择区域",
          component: "gCascader",
          url: "getAreaList",
          field: { id: "value", name: "label" },
        },
        { label: "", value: "keyword", placeholder: "巡检对象名称" },
      ],
      btnStatus: "all",
    });

    const changeBtnStatus = (type) => {
      state.btnStatus = type;
      tableRef.value.searchRecord();
    };

    const beforeGet = (params) => {
      return {
        ...params,
        status: state.btnStatus === "all" ? "" : state.btnStatus,
        areaId: Array.isArray(params.areaId) ? params.areaId[params.areaId.length - 1] : params.areaId
      };
    };
    const getArelList = () => {
      proxy.$api.getAreaList().then((res) => {
        res = JSON.parse(JSON.stringify(res).replace(/"name"/g, '"label"'))
        res = JSON.parse(JSON.stringify(res).replace(/"id"/g, '"value"'))
        state.search[2].options = res
      });
    }
    onMounted(() => {
      getArelList()

    });

    const exportLoading = ref(false)
    const downloadExcel = async () => {
      try {
        exportLoading.value = true
        const count = Math.ceil(Number(tableRef.value?.page?.total) / 999)
        const exportData = []
        let period = ''

        if (tableRef.value.form.date) {
            const date =
              tableRef.value.form.date && tableRef.value.form.date.length > 0
                ? [
                  moment(tableRef.value.form.date[0]).format("YYYY-MM-DD 00:00:00"),
                  moment(tableRef.value.form.date[1]).format("YYYY-MM-DD 23:59:59"),
                ]
                : []

            if (date.length > 0) {
              period = date.join(",");
            } else {
              period = null;
            }
          }
        for (let i = 0; i < count; i++) {
          const params = {
            ...tableRef.value?.form,
            period,
            pageNumber: i + 1,
            pageSize: 999,
          };
          delete params.date;
          if (params.areaId && Array.isArray(params.areaId)) params.areaId = params.areaId[params.areaId.length - 1]
          const result = await proxy.$api.targetRecordPage(params);
          exportData.push(...result.records)
        }
        let excelColumns = state.columns.slice(0, -1);
        excelColumns.push({
          title: "巡检结果说明",
          dataIndex: "errorDesc",
        })
        await exportExcel('巡检档案', excelColumns, exportData)
      } catch (error) {
      } finally {
        exportLoading.value = false
      }
    }
    return {
      tableRef,
      ...toRefs(state),
      changeBtnStatus,
      beforeGet,
      exportLoading,
      downloadExcel,
      pageTitle
    };
  },
});
</script>
