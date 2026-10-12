<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="手动开闸记录"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :search="search")
</template>

<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  reactive,
  toRefs,
  ref,
} from "vue";
import { millennial, timeFormat } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const tableRef = ref();
    const state = reactive({
      columns: [
        {
          dataIndex: "plateNo",
          title: "车牌号",
          slots: {
            customRender: "plateNo",
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
          dataIndex: "cardName",
          title: "车卡类型",
          slots: {
            customRender: "cardName",
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
          dataIndex: "liftTime",
          title: "开闸时间",
          slots: {
            customRender: "liftTime",
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
          dataIndex: "operatorName",
          title: "开闸操作员",
          slots: {
            customRender: "operatorName",
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
          dataIndex: "laneName",
          title: "开闸车道",
          slots: {
            customRender: "laneName",
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
          dataIndex: "laneType",
          title: "车道类型",
          slots: {
            customRender: "laneType",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            let res;
            switch (text) {
              case "ENTRANCE":
                res = "入口";
                break;
              case "EXIT":
                res = "出口";
                break;
            }
            return (
              <PopOver position="topLeft" content={text ? res : ""}>
                {text ? res : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaName",
          title: "开闸区域",
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
          dataIndex: "liftReason",
          title: "开闸原因",
          slots: {
            customRender: "liftReason",
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
      ],
      api: {
        list: "manualOpenGateRcord",
      },
      btns: [],
      search: [
        // {
        //   label: "车辆类型",
        //   value: "status",
        //   component: "gSelect",
        //   options: [
        //     { label: "普通车辆", value: " " },
        //     { label: "车卡车辆", value: "EXIT" },
        //     { label: "普通车辆", value: "EXIT" },
        //     { label: "白名单车辆", value: "ENTRANCE" },
        //   ],
        //   placeholder: "请选择车辆类型",
        // },
        {
          label: "车道",
          value: "laneIds",
          component: "gCascader",
          url: "laneTreeNoEquip",
          placeholder: "请选择车道",
          params: {
            tenant: getNowEnterprise().code,
          },
        },
        {
          label: "车道类型",
          value: "laneType",
          component: "gSelect",
          placeholder: "请选择车道类型",
          options: [
            { label: "全部", value: " " },
            { label: "出口", value: "EXIT" },
            { label: "入口", value: "ENTRANCE" },
          ],
        },
        {
          label: "开闸时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "period",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车牌号/操作员",
        },
      ],
      visible: false,
      choseRecord: null,
    });

    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
    };
  },
});
</script>

<style lang="less" scoped>
.modalGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  span {
    display: inline-block;
    height: 32px;
    line-height: 1.5;
    &.title {
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
