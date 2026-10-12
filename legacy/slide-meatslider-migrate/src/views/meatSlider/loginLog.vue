<template lang="pug">
g-table(
  title="登录日志记录"
  :columns="columns" 
  :search="search" 
  :btns="btns" 
  :api="api"
  :scrollX="850"
  tableCode="MATE_LOGIN_LOG"
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
            title: "登录时间",
            slots: {
              customRender: "createTime",
            },
            width: 200,
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
            title: "用户",
            slots: {
              customRender: "userName",
            },
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
            mark: "extra",
            dataIndex: "extra",
            key: "extra",
            title: "登录平台",
            slots: {
              customRender: "extra",
            },
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
            mark: "action",
            dataIndex: "action",
            key: "action",
            title: "登录状态",
            slots: {
              customRender: "action",
            },
            ellipsis: true,
            customRender: ({ text }) => {
              return (
                <PopOver position="topLeft" content={text}>
                  {text ? text : "--"}
                </PopOver>
              );
            },
          },
        ],
        api: {
          list: "getLoginLogRecord",
        },
        btns: [],
        date: [],
        search: [
          {
            label: "用户",
            value: "userName",
            placeholder: "请输入用户姓名",
          },
          {
            label: "状态",
            value: "fail",
            component: "a-select",
            defaultValue: " ",
            options: [
              {
                value: false,
                label: "成功",
              },
              {
                value: true,
                label: "失败",
              },
            ],
            placeholder: "请选择",
          },
        ],
        exportLoading: false,
        searchParams: {}
      })
    const beforeGet = (params) => {
      const data = {
        fail: params.fail,
        userName: params.userName,
        type: 'OUAA',
        subType: 'LOGIN',
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
          .exportLoginLog({
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
  