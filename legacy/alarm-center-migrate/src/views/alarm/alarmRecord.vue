<template>
  <g-table :title="pageTitle ?? '报警记录'" tableCode="ALARM_CENTER_ALARM_RECORD" :columns="columns" :search="search" :editMode="editMode"
    :api="api" :btns="btns" :scrollX="0" ref="tableRef" :beforeGet="beforeGet">
    <template #header-btns>
      <a-button style="margin-left: 16px;" type="primary" :loading="exportLoading" :disabled="dataCount === 0"
        @click="downloadExcel">导出</a-button>
    </template>
    <template #pre-item="{record}">
      <a-radio-group v-model:value="btnStatus" button-style="solid" @change="changeData(record)"
        style="margin-right:16px">
        <a-radio-button v-for="item in options" :key="item.value" :value="item.value">{{item.label}}</a-radio-button>
      </a-radio-group>
    </template>
    <template #beforeBtn="{record}">
      <a-button type="link" @click="handleDetail(record)">详情</a-button>
      <a-popconfirm title="再次推送该报警？" @confirm="handleRepeatPush(record)">
        <a-button type="link">再次推送</a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>
<script lang="jsx">
import {
  defineComponent,
  toRefs,
  reactive,
  createVNode,
  ref,
  getCurrentInstance,
  computed
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { timeFormat } from "@/utils/common";
import { exportExcel } from "@/utils/export-excel";
import { getAlarmRecords } from "@/api/alarm";
import { usePageName } from '@ghcloud/cube-utils'

const color = {
  一级: 'rgb(255, 59, 52)',
  二级: 'rgb(255, 110, 52)',
  三级: 'rgb(255, 194, 52)',
  四级: 'rgb(24, 144, 255)'
}
const handstatus = {
  已挂起: '#02A7F0',
  待接收: '#D9001B',
  处理中: '#F59A23',
  已关闭: '#7F7F7F',
  已处理: '#70B603'
}
export default defineComponent({
  setup() {
    const { pageTitle } = usePageName()
    const tableRef = ref();
    const dataCount = computed(() => {
      if (!tableRef.value) return 0
      return tableRef.value.page.total
    })
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const store = useStore();
    const state = reactive({
      btnStatus: "",
      editMode: "modal",
      btns: [],
      rowSelection: true,
      api: {
        list: "getAlarmRecords",
        delete: "",
        detail: "record",
        path: "",
      },
      columns: [
        {
          dataIndex: "alarmTime",
          title: "报警时间",
          slots: {
            customRender: "alarmTime",
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
          dataIndex: "alarmTargetName",
          title: "报警对象",
          slots: {
            customRender: "alarmTargetName",
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
          dataIndex: "alarmLevelName",
          title: "报警级别",
          slots: {
            customRender: "alarmLevelName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                <span style={{ color: color[text] }}>{text || '--'}</span>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "alarmTypeName",
          title: "报警类型",
          slots: {
            customRender: "alarmTypeName",
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
          dataIndex: "alarmEventName",
          title: "报警事件",
          slots: {
            customRender: "alarmEventName",
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
          dataIndex: "alarmStatusName",
          title: "处理状态",
          slots: {
            customRender: "alarmStatusName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                <span style={{ color: handstatus[text] }}>{text || '--'}</span>
              </PopOver>
            );
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action'
          }
        },
      ],
      search: [
        {
          label: "报警级别",
          value: "alarmLevelId",
          component: "g-select",
          placeholder: "报警级别",
          url: "getSatAlarmLevels",
          field: { name: "label", id: "value" },
        },
        {
          label: "报警类型",
          value: "alarmTypeId",
          component: "g-select",
          placeholder: "报警类型",
          url: "getSatAlarmTypes",
          field: { name: "label", id: "value" },
        },
        {
          label: "报警时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
      ],
      options: [
        {
          label: "所有",
          value: ""
        },
        {
          label: "待确认",
          value: "ALARM_UN_CONFIRMED",
        },
        {
          label: "处理中",
          value: "ALARM_PROGRESS_CONFIRMED",
        },
        {
          label: "已挂起",
          value: "ALARM_SUSPEND",
        },
        {
          label: "已处理",
          value: "ALARM_HANDLER",
        }
      ],
    });
    const changeData = (record) => {
      tableRef.value.searchRecord();
    }
    const handleRepeatPush = async (record) => {
      await proxy.$api.repeatPushAlarm(record.businessKey)
      proxy.$message.success("操作成功");
    }
    const beforeGet = (params) => {
      return {
        ...params,
        alarmStatus: state.btnStatus,
      };
    };

    const allRead = async (item) => {
      await proxy.$api.allRead("put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
      getMsgNum();
    };

    const checkedRead = async (record) => {
      await proxy.$api.checkedRead({ ids: record }, "put");
      proxy.$message.success("操作成功");
      tableRef.value.getData();
      getMsgNum();
    };
    const getMsgNum = async () => {
      const data = await proxy.$api.unReadNum("CHANNEL_SITE", "get");
      store.commit("unReadMsgNum/SET_UNREAD_NUM", data === true ? "" : data);
    };
    const handleDetail = (record) => {
      let target = ''
      target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`
      history.pushState({ current: location.pathname + location.search }, "", target)
    }
    const exportLoading = ref(false)
    const downloadExcel = async () => {
      try {
        exportLoading.value = true
        const count = Math.ceil(dataCount.value / 999)

        const exportData = []
        for (let i = 0; i < count; i++) {
          const params = {
            pageNumber: i + 1,
            pageSize: 999,
            alarmLevelId: tableRef.value.form.alarmLevelId,
            alarmTypeId: tableRef.value.form.alarmTypeId,
            period: tableRef.value.form.period,
            alarmStatus: tableRef.value.form.alarmStatus,
          };
          const result = await getAlarmRecords(params);
          exportData.push(...result.records)
        }
        let excelColumns = state.columns.slice(0, -1);
        await exportExcel(pageTitle, excelColumns, exportData)
      } catch (error) {
      } finally {
        exportLoading.value = false
      }
    }
    return {
      tableRef,
      ...toRefs(state),
      handleRepeatPush,
      allRead,
      checkedRead,
      changeData,
      beforeGet,
      handleDetail,
      pageTitle,
      dataCount,
      exportLoading,
      downloadExcel
    };
  },
});
</script>
<style lang="less" scoped></style>
