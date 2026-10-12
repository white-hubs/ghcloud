<template lang="pug">
g-table(
  title="业务日志记录"
  :columns="columns" 
  :search="search" 
  :btns="btns"
  tableCode="MATE_BIZ_LOG"
  :api="api"
  :scrollX="850"
  :beforeGet="beforeGet"
  @reset="reset"
  ref="tableRef")
  template(v-slot:pre-item="{record}")
    a-form-item(label="时间" )
      a-range-picker(v-model:value="date" :style="{width:'218px'}" :disabledDate="disabledDate" 
    @calendarChange="onCalendarChange")
  template(#header-btns)
    a-button(type="primary" @click="clickExport()" :loading="exportLoading") 导出   
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
  import { tallyDataStatus } from "@/utils/enumerate";
  import { replaceObjectKeys } from "@pansy/utils";
  import { timeFormat, millennial, getFreshLabel } from "@/utils/common";
  import moment from "moment";
  export default defineComponent({
    setup() {
      const { proxy } = getCurrentInstance();
      const router = useRouter();
      const state = reactive({
        columns: [
          {
            mark: "createTime",
            dataIndex: "createTime",
            key: "createTime",
            title: "操作时间",
            slots: {
              customRender: "createTime",
            },
            width: 120,
            ellipsis: true,
            customRender: ({ text, record }) => {
              return (
                <PopOver
                  position="topLeft"
                  content={text ? timeFormat(text, true) : ""}
                >
                  {text ? `${timeFormat(text, true)}` : "--"}
                </PopOver>
              );
            },
          },
          {
            mark: "userName",
            dataIndex: "userName",
            key: "userName",
            title: "操作人",
            slots: {
              customRender: "userName",
            },
            width: 100,
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
            mark: "typeName",
            dataIndex: "typeName",
            key: "typeName",
            title: "业务应用",
            slots: {
              customRender: "typeName",
            },
            width: 100,
            ellipsis: true,
            customRender: ({ text, record }) => {
              return (
                <PopOver position="topLeft" content={text}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            mark: "operationType",
            dataIndex: "operationType",
            key: "operationType",
            title: "操作",
            slots: {
              customRender: "operationType",
            },
            width: 100,
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
            mark: "subTypeName",
            dataIndex: "subTypeName",
            key: "subTypeName",
            title: "操作对象",
            slots: {
              customRender: "subTypeName",
            },
            width: 150,
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
          {
            mark: "action",
            dataIndex: "action",
            key: "action",
            title: "操作内容",
            slots: {
              customRender: "action", 
            },
            width: 200,
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  <span style=" display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;overflow: hidden;text-overflow: ellipsis;">
                    {text || text === 0 ? text : "--"}
                  </span>
                </PopOver>
              );
            },
          }, 
        ],
        api: {
          list: "getBizLogRecord",
        },
        btns: [],
        date: [],
        search: [
          {
            label: "操作人",
            value: "userName",
            placeholder: "请输入操作人员姓名",
          },
          {
            label: "操作对象",
            value: "handleTarget",
            component: "g-cascader",
            placeholder: "请选择操作对象",
            url: "getBizList",
            field: {
              code: "value",
              value: "label",
            },
          },
        ],
        exportLoading: false,
        searchParams: {}
      })
    const beforeGet = (params) => {
      const targetType = params.handleTarget ? (typeof params.handleTarget === 'string' ? params.handleTarget.split(',') : Array.isArray(params.handleTarget) ? params.handleTarget : ["MEATTRADE"] ) : ["MEATTRADE"]
      const data = {
        type: targetType[0] ?? '',
        subType: targetType[1] ?? '',
        userName: params.userName,
        pageSize: params.pageSize,
        pageNumber: params.pageNumber,
      }
      if (state.date.length > 0) {
        data.period = `${timeFormat(state.date[0], false)},${timeFormat(state.date[1], false)}`;
      } else {
        const nowTime = moment().format("YYYY-MM-DD");
        const startTime = moment().startOf('days').add('-6','days').format("YYYY-MM-DD");
        data.period = `${startTime},${nowTime}`;
      }
      state.searchParams = {...data}
      return {
        ...state.searchParams
      };
    };
      // 导出
    const clickExport = () => {
      try {
        state.exportLoading = true
        proxy.$api
          .exportBizLog({
            ...state.searchParams
          })
          .then((res) => {
            const link = document.createElement("a");
            let blob = new Blob([res], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "业务日志记录.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        } catch (error) {
          state.exportLoading = false
        } finally {
          setTimeout(() => { state.exportLoading = false }, 1000);
        }
      };
    onMounted(() => {
      const nowTime = moment().format("YYYY-MM-DD");
      const startTime = moment().startOf('days').add('-6','days').format("YYYY-MM-DD");
      state.date = [startTime, nowTime];
    });
    const reset = () => {
      const nowTime = moment().format("YYYY-MM-DD");
      const startTime = moment().startOf('days').add('-6','days').format("YYYY-MM-DD");
      state.date = [startTime, nowTime];
    }
    const disabledDate = (current) => {
      if (!state.date || state.date.length === 0) {
        return false;
      }
      const diffDate = current.diff(state.date[0], 'days');
      return Math.abs(diffDate) > 7;
    };
    const onCalendarChange = (val) => {
      state.date = val.length === 2 ? val : [];
    };
      return {
        ...toRefs(state),
        clickExport,
        beforeGet,
        disabledDate,
        onCalendarChange,
        reset
      };
    },
  });
  </script>
  <style scoped lang="less">
  </style>
  