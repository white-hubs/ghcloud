<template>
  <g-table modalTitle="报警原因" tableCode="ALARM_CENTER_ALARM_REASON" title="报警原因" :modal="modalFormState" :columns="columns" :search="search"
    :editMode="editMode" rowKey="id" :api="api" :btns="btns" :scrollX="1000" ref="tableRef" :beforeGet="beforeGet">
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
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const store = useStore();
    const state = reactive({
      btnStatus: "",
      editMode: "modal",
      rowSelection: true,
      btns: ['edit', 'deleteSingle', 'add'],
      modalFormState: [
        {
          label: "报警原因",
          value: "reason",
          maxlength: '20',
          placeholder: "请输入"
        },
        {
          label: "备注说明",
          value: "remark",
          component: 'a-textarea',
          maxlength: 200,
          placeholder: "请输入",
        },
      ],
      api: {
        list: "getAlarmReasons",
        detail: "record",
        add: 'addAlarmReason',
        deleteSingle: "deleteAlarmReason",
        edit: 'updateAlarmReason'
      },
      columns: [
        {
          dataIndex: "Index",
          title: "序号",
        },
        {
          dataIndex: "reason",
          title: "报警原因",
          slots: {
            customRender: "reason",
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
          dataIndex: "remark",
          title: "备注说明",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text || '--'}
              </PopOver >
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
          label: "报警原因",
          value: "keyword",
        },
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
      if (record.url) {
        target = `${record.url}?id=${record.id}&businessKey=${record.businessKey}&type=detail`
      } else {
        target = `/portal/genericEquipmentMonitor/alarmDetail?businessKey=${record.businessKey}&alarmStatus=${record.alarmStatus}&type=detail&id=${record.id}`
      }
      history.pushState({ current: location.pathname + location.search }, "", target)
    }
    return {
      tableRef,
      ...toRefs(state),
      handleRepeatPush,
      allRead,
      checkedRead,
      changeData,
      beforeGet,
      handleDetail
    };
  },
});
</script>
<style lang="less" scoped></style>
