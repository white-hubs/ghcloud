<template lang="pug">
//- g-layout(
  title="物流配置")
  template(#content-table)
    a-table(
      :columns="sendCol"
      :dataSource="sendData"
      :rowKey="'id'"
      :pagination="false")
      template(#default="{record}")
        a-switch(:checked="record.default" un-checked-children="否" checked-children="是" @change="(e) => change(e,'default')")
      template(#status="{record}")
        //-  @change="(e) => change(e,'status')"
        a-switch(v-model:checked="record.status" un-checked-children="禁用" checked-children="启用")
g-table(
  ref="tableRef"
  title="物流配置"
  :columns="sendCol"
  :api="api"
  :rowKey="'id'"
  :scrollX="600"
  :slots="slots"
  @slot="changeStatus"
  :btns="[]")        
  //- template(#footer-page)          
    //- a-button 返回
    a-button(type="primary") 保存
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();
    const state = reactive({
      api: {
        list: "sendType",
      },
      sendCol: [
        {
          dataIndex: "distributionWay",
          title: "配送方式",
          slots: {
            customRender: "distributionWay",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  text
                    ? text === "provide_home"
                      ? "送货上门"
                      : "到店自取"
                    : ""
                }
              >
                {text
                  ? text === "provide_home"
                    ? "送货上门"
                    : "到店自取"
                  : ""}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "status",
          title: "设为默认",
          slots: {
            customRender: "status",
          },
        },
        {
          dataIndex: "openStatus",
          title: "状态",
          slots: {
            customRender: "openStatus",
          },
        },
      ],
      slots: [
        { slot: "openStatus", component: "a-switch" },
        {
          slot: "status",
          component: "a-switch",
          unCheckedValue: "否",
          checkedValue: "是",
        },
      ],
    });

    const changeStatus = async (slot, record) => {
      // 判断type改变不同的字段状态
      await proxy.$api.sendTypeEdit(record,"put" );
      proxy.$message.success("操作成功");
      tableRef.value.getData();
    };

    onMounted(function(){});

    return {
      tableRef,
      ...toRefs(state),
      changeStatus,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-form) {
  padding: 16px;
  text-align-last: left;
}
:deep(.ant-table) {
  .ant-form {
    padding: 0;
    text-align: left;
    .ant-form-item {
      margin-bottom: 0;
      // height: 56px;
    }
  }
}
</style>
