<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="入场修正记录"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :scrollX="600"
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
          title: "入场识别车牌",
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
          dataIndex: "inoutTime",
          title: "入场时间",
          slots: {
            customRender: "inoutTime",
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
          dataIndex: "createTime",
          title: "修正时间",
          slots: {
            customRender: "createTime",
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
          dataIndex: "laneName",
          title: "入场车道",
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
          dataIndex: "areaName",
          title: "入场区域",
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
          dataIndex: "correctPlateNo",
          title: "入场修正车牌",
          slots: {
            customRender: "correctPlateNo",
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
        // {
        //   dataIndex: "correctInoutTime",
        //   title: "入场修正时间",
        //   slots: {
        //     customRender: "correctInoutTime",
        //   },
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       <PopOver
        //         position="topLeft"
        //         content={text ? timeFormat(text, true) : ""}
        //       >
        //         {text ? timeFormat(text, true) : "--"}
        //       </PopOver>
        //     );
        //   },
        // },
        {
          dataIndex: "operatorName",
          title: "入场修正操作员",
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
      ],
      api: {
        list: "enterCorrect",
      },
      btns: [],
      search: [
        {
          label: "入场修正时间",
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
