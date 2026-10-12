<template>
  <g-table tableCode="INSPECTION_ACCOUNT" :title="pageTitle" :columns="columns" :api="api" :search="search" :btns="btns"
    :slots="slots" :editMode="'page'" :rowKey="'id'" :rules="rules" :beforeGet="beforeGet" :scrollX="900"
    ref="tableRef">
    <template v-slot:header-btns>
      <a-button style="margin-left: 10px;" type="primary" :loading="exportLoading"
        :disabled="Number(tableRef?.page?.total) === 0" @click="downloadExcel">导出</a-button>
    </template>
  </g-table>
  <a-modal v-if="exportProgressTotal > 1" v-model:visible="exportLoading" title="导出进度" width="400px" centered :footer="null">
    <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 10px;">
      <div v-if="exportProgressPercent < 100" style="padding-bottom: 10px;">正在获取数据...</div>
      <div v-else style="padding-bottom: 10px;">正在生成Excel文件...</div>
      <a-progress
        :stroke-color="{
          from: '#108ee9',
          to: '#87d068',
        }"
        :percent="exportProgressPercent"
        status="active"
        style="width: 80%;"
      />

    </div>
  </a-modal>
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
          dataIndex: "inspectMethod",
          title: "巡检方式",
          ellipsis: true,
        },
        {
          dataIndex: "taskName",
          title: "任务名称",
          ellipsis: true,
        },
        {
          dataIndex: "nickname",
          title: "巡检人员",
          ellipsis: true,
        },
        {
          dataIndex: "time",
          title: "巡检时间",
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
          title: "结果",
          ellipsis: true,
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
        },
        {
          dataIndex: "standardVOS",
          title: "异常内容",
          ellipsis: true,
          customRender: ({ record }) => {
            const data = record.standardVOS || []
            const content = () => {
              return (
                <div>
                  {data.length > 0 ? data.map(e => {
                    const errResult = e?.itemVOS?.filter(item => item.errorValueFlag)
                    return (
                      <>
                      {
                        errResult?.length > 0 && (
                          <>
                            <div style="font-weight: 700;">
                              {e.standardName}
                            </div>
                            <div>
                              {errResult.map((item, index) => (
                                <div class="list-item" key={item.itemId}>
                                  <div>{index + 1}、{item.itemName}</div>
                                  <div style="padding-left: 16px;">{item.errorDesc}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        )
                      }
                      </>
                    )
                  }) : '--'}
                </div>
              )

            }
            const desc = data?.map(e => {
              const errResult = e?.itemVOS?.filter(item => item.errorValueFlag)
              if (errResult?.length > 0){
                return errResult.map((item, index) => {
                  return `${e.standardName} \n ${index + 1}、${item.itemName} \n ${item.errorDesc}`
                })
              }
            }).join('')
            return (
              <PopOver
                position="topLeft"
                content={content || '--'}
              >
              {desc || '--'}
              </PopOver>
            );
          },
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
        list: "inspectRecordPagination",
        path: "/inspectionAccountDetails",
      },
      btns: ["detail"],
      search: [
        {
          label: "巡检部门",
          value: "departmentId",
          component: "g-select",
          defaultValue: null,
          placeholder: "请选择巡检部门",
          url: "deptList",
          field: { name: "label", id: "value" },
        },
        {
          label: "巡检方式",
          value: "temporary",
          component: "g-select",
          placeholder: "请选择巡检方式",
          defaultValue: null,
          field: { name: "label", id: "value" },
          options: [{
            name: '全部记录',
            id: 0
          }, {
            name: '日常记录',
            id: 1,
          }, {
            name: '临时记录',
            id: 2
          }
          ],
          placeholder: "",
        },
        {
          label: "巡检结果",
          value: "result",
          component: "g-select",
          placeholder: "请选择巡检结果",
          defaultValue: null,
          field: { name: "label", id: "value" },
          options: [{
            name: '正常',
            id: 'NORMAL'
          }, {
            name: '异常',
            id: 'ABNORMAL',
          }
          ],
          placeholder: "",
        },
        {
          label: "巡检时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "时间段",
          value: "timeRange",
          component: "TimeRangePicker",
          placeholder: "请选择时间段",
          width: "320px",
        },
        { label: "", value: "keyword", placeholder: "巡检对象名称" },
      ],
      btnStatus: "all",
      exportProgressPercent: 0,
      exportProgressTotal: 0,
    });
    const beforeGet = (params) => {
      const result = {
        ...params,
        status: state.btnStatus === "all" ? "" : state.btnStatus,
      };
      // 时间段：将 "10:30-12:20" 拆分为 timeStart、timeEnd 供接口使用
      if (result.timeRange && typeof result.timeRange === "string") {
        const parts = result.timeRange.split("-");
        if (parts.length === 2) {
          result.timeStart = parts[0].trim();
          result.timeEnd = parts[1].trim();
        }
      }
      return result;
    };

    const exportLoading = ref(false)
    const downloadExcel = async () => {
      try {
        exportLoading.value = true
        state.exportProgressPercent = 0
        state.exportProgressTotal = 0
        const count = Math.ceil(Number(tableRef.value?.page?.total) / 999)
        state.exportProgressTotal = count
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
          if (params.timeRange && typeof params.timeRange === "string") {
            const parts = params.timeRange.split("-");
            if (parts.length === 2) {
              params.timeStart = parts[0].trim();
              params.timeEnd = parts[1].trim();
            }
          }
          delete params.timeRange;
          state.exportProgressPercent = Math.floor(((i + 1) / count) * 100); 
          const result = await proxy.$api.inspectRecordPagination(params);
          exportData.push(...result.records)
        }
        let excelColumns = state.columns.slice(0, -1);
        await exportExcel('巡检记录', excelColumns, exportData)
      } catch (error) {
      } finally {
        exportLoading.value = false
      }
    }
    return {
      tableRef,
      ...toRefs(state),
      beforeGet,
      exportLoading,
      downloadExcel,
      pageTitle
    };
  },
});
</script>
