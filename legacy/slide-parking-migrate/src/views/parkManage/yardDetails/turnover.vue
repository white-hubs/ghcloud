<template lang="pug">
div.ctr
  g-table(
    ref="tableRef"
    title="进出流水记录"
    :editMode="'page'"
    :columns="columns"
    :btns="btns"
    :api="api"
    :beforeGet="beforeGet"
    :search="search"
    @resetSearch="resetSearch"
    )
    template(v-slot:pre-item="{record}")
      a-form-item(label="入场时间" )
        a-range-picker(v-model:value="enterDate" :style="{width:'218px'}")
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
          dataIndex: "entryTime",
          title: "入场时间",
          slots: {
            customRender: "entryTime",
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
          dataIndex: "entryLaneName",
          title: "入场车道",
          slots: {
            customRender: "entryLaneName",
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
          dataIndex: "entryAreaName",
          title: "入场区域",
          slots: {
            customRender: "entryAreaName",
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
          dataIndex: "entryOperatorName",
          title: "入场操作员",
          slots: {
            customRender: "entryOperatorName",
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
          dataIndex: "plateNo",
          title: "出场识别车牌",
          slots: {
            customRender: "plateNo",
          },
          ellipsis: true,
          customRender: (listDataSource) => {
            return (
              <PopOver
                position="topLeft"
                content={
                  listDataSource.record.exitTime ? listDataSource?.text : ""
                }
              >
                {listDataSource.record.exitTime ? listDataSource?.text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "exitTime",
          title: "出场时间",
          slots: {
            customRender: "exitTime",
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
          dataIndex: "exitLaneName",
          title: "出场车道",
          slots: {
            customRender: "exitLaneName",
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
          dataIndex: "exitAreaName",
          title: "出场区域",
          slots: {
            customRender: "exitAreaName",
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
          dataIndex: "exitOperatorName",
          title: "出场操作员",
          slots: {
            customRender: "exitOperatorName",
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
        list: "turnoverRecord",
      },
      btns: [],
      enterDate: [],
      search: [
        // {
        //   label: "入场时间",
        //   value: "inPeriod",
        //   component: "span",
        // },
        {
          label: "出场时间",
          value: "date",
          component: "a-range-picker",
          defaultDate: "outPeriod",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "车牌号/操作员",
        },
      ],
      visible: false,
    });

    const beforeGet = (params) => {
      if (state.enterDate.length > 0) {
        params.inPeriod = `${timeFormat(
          state.enterDate[0],
          false
        )},${timeFormat(state.enterDate[1], false)}`;
      } else {
        params.inPeriod = "";
      }

      return params;
    };
    const resetSearch = () => {
      state.enterDate = [];
    };
    return {
      tableRef,
      ...toRefs(state),
      millennial,
      timeFormat,
      beforeGet,
      resetSearch,
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
