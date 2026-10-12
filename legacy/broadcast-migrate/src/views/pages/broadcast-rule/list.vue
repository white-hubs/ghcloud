<template>
  <g-table ref="tableRef" :title="pageTitle" :api="api" editMode="custom" :btns="btns" @operation="handleTableOperation"
    :search="search" :columns="columns" tableCode="broadcastCenterRuleList" scrollX="0">
    <template v-slot:beforeBtn="{ record }">
      <a-button type="link" @click="handleInfo(record)">详情</a-button>
      <a-button type="link" @click="handleEdit(record)">编辑</a-button>
      <a-popconfirm title="删除当前选中？" @confirm="handleDelete(record)">
        <a-button type="link" v-if="!record.defaulted" danger>删除</a-button>
      </a-popconfirm>
    </template>
  </g-table>
</template>

<script lang="jsx">
import moment from "moment";
import {Switch} from 'ant-design-vue'
import {
  defineComponent,
  getCurrentInstance,
  reactive, ref, toRefs
} from "vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      api: {
        list: "getBroadcastRulePage",
      },
      btns: ["add"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入名称搜索",
        },
      ],
      columns: [
        {
          dataIndex: "",
          title: "序号",
          width:60,
          align: "center",
          slots: {
            customRender: "",
          },
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "name",
          title: "规则名称",
          width:100,
          ellipsis: true,
        },
        {
          dataIndex: "remark",
          title: "说明",
          width:400,
          ellipsis: true,
        },
        {
          dataIndex: "enabled",
          title: "开关",
          width:100,
          align:'center',
          customRender: ({record,text }) => {
            return (
                <Switch v-model:checked={record.enabled} onChange={()=>handleChange(record,record.enabled)} />
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          width:100,
          slots: {
            customRender: "action",
          },
        },
      ],
    });
    const handleChange=async (record,checked)=>{
      try {
        await proxy.$api.updateRuleEnabled(record.id,checked)
        proxy.$message.success("操作成功")
        tableRef.value.getData()
      } catch (error) {
        record.enabled = !checked
        proxy.$message.error("操作失败")
      }
    }
    const handleDelete=async (record)=>{
      await proxy.$api.deleteBroadcastRule(record.id)
      proxy.$message.success("操作成功")
      tableRef.value.getData()
    }
    const handleEdit=(record)=>{
      const target = `/portal/broadcastCenter/broadcastCenterRuleDetails?type=edit&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    }
    const handleInfo=(record)=>{
      const target = `/portal/broadcastCenter/broadcastCenterRuleDetails?type=info&id=${record.id}`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    }
    const handleTableOperation = () => {
      const target = `/portal/broadcastCenter/broadcastCenterRuleDetails?type=add`;
      history.pushState({ current: location.pathname + location.search }, "", target);
    }
    return {
      ...toRefs(state),
      handleEdit,
      handleInfo,
      handleTableOperation,
      handleDelete,
      tableRef,
    };
  },
});
</script>
