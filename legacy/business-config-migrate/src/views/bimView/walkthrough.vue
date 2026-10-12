<template lang="pug">
g-table(
    ref="modelTable"
    title="漫游路径"
    modalTitle="漫游路径"
    :columns="columns"
    :api="api"
    :search="search"
    :btns="btns"
    :modal="modal"
    :rules="rules",
    @operation="handelEdit"
)
    template(v-slot:beforeBtn="{record}")
        a-button(type="link" @click="clickDetail(record)") 自定路径
</template>
<script lang="jsx">
import gCascader from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gCascader.vue";
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
import PopOver from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/PopOver.vue";
import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  components: { gTable, gCascader },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const modelTable = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "漫游名称",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaNames",
          title: "管理区域",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text && text.length > 0 ? text.join("/") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
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
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      btns: ["edit", "add", "deleteSingle"],
      api: {
        list: "getAreaRoamingConfigPage",
        add: "postAreaRoamingConfig",
        edit: "putAreaRoamingConfig",
        deleteSingle: "deleteAreaRoamingConfig",
        detail: "getAreaRoamingConfigDetail",
        path: "/walkthroughDetail",
      },
      search: [{ label: "", value: "keyword", placeholder: "漫游名称" }],
      rules: {
        name: [{ required: true, message: "请输入模型名称" }],
        areaIds: [{ required: true, message: "请选择关联区域" }],
      },
      modal: [
        { label: "漫游名称", value: "name" },
        {
          label: "关联区域",
          value: "areaIds",
          component: gCascader,
          url: "getAreaList",
        },
      ],
      rowBimFloors: [],
      curRowBim: null,
      floorModal: false,
    });
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data) {
        state.areaList = data;
      }
    };

    onMounted(() => {
      getAreaList();
    });
    //
    const clickDetail = (record) => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/legacy-business-config/walkthroughDetail?id=${record.id}`,
      );
    };
    return {
      ...toRefs(state),
      modelTable,
      clickDetail,
    };
  },
});
</script>

<style lang="less" scoped>
.floors-container {
  .floor-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    > div {
      width: 100px;
    }
    :deep(.ant-btn) {
      margin-left: 32px;
    }
  }
}
</style>
