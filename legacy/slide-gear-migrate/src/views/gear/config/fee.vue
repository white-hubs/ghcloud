<template lang="pug">
div
  g-table(
      :title="pageTitle"
      :columns="columns" 
      :search="search" 
      :btns="btns"
      :api="api"
      :rowSelection="true"
      ref="tableRef")
      template(v-slot:btn='item')
        a-button(type="link" @click="handleRecord(item.record)") 设置
      template(v-slot:batch='item')
        a-button(type="primary" @click="batchRecord(item.record)") 批量应用模板
  feeTemplateModal(:visible="feeTemplateVisible"  @close="closeFeeTemplate")
          
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
import { timeFormat } from "@/utils/common";
import { useRouter } from "vue-router";
import feeTemplateModal from "../../components/feeTemplate.vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: { feeTemplateModal },
  setup() {
    const { pageTitle } = usePageName()
    const tableRef = ref();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      feeTemplateVisible: false,
      api: {
        list: "getStallCosts",
        path: "/gearFeeSet",
      },
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "档位名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "code",
          key: "code",
          title: "档位编号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "costRuleCount",
          key: "costRuleCount",
          title: "收费项目数",
          slots: {
            customRender: "costRuleCount",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
          key: "updateTime",
          title: "更新时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={timeFormat(text, true)}>
                {timeFormat(text, true)}
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 100,
          fixed: "right",
        },
      ],
      btns: [],
      search: [
        { label: "", value: "keyword", placeholder: "档位名称/档位编号" },
      ],
      selectedRowKeys: [],
    });

    /*点击处理*/
    const handleRecord = (record) => {
      const id = record?.id ? record.id : "";
      history.pushState(
        { current: location.pathname + location.search }, '',
        `/portal/charge/gearFeeSet?type=detail&id=${id}`
      )
    };

    /*批量处理*/
    const batchRecord = (record) => {
      state.selectedRowKeys = record;
      if (state.selectedRowKeys.length === 0) {
        proxy.$message.warn("请选择档位费用");
        return;
      }
      state.feeTemplateVisible = true;
    };

    /*关闭弹框*/
    const closeFeeTemplate = (data) => {
      tableRef.value.getData();
      if (data) {
        if (state.selectedRowKeys.length === 0) {
          proxy.$message.warn("请选择档位费用");
        } else {
          proxy.$api
            .postStallCostBatch({
              costTmpId: data,
              stallIds: state.selectedRowKeys,
            },"post")
            .then(() => {
              proxy.$message.success("操作成功");
              state.feeTemplateVisible = false;
              state.selectedRowKeys = [];
              tableRef.value.getData();
            });
        }
      } else {
        state.feeTemplateVisible = false;
      }
    };
    return {
      tableRef,
      ...toRefs(state),
      handleRecord,
      closeFeeTemplate,
      batchRecord,
      pageTitle
    };
  },
});
</script>
<style scoped lang="less">

</style>
