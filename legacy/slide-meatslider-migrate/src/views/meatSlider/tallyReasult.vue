<template lang="pug">
g-layout(
  title="理货商品明细"
)
  template(#content-search)
     a-form.p2(layout="inline")
          a-form-item 
            a-space
              a-button(@click="handleDateClick('TODAY')" :type="condition.type === 'TODAY'? 'primary':'default'") 今日
              a-button(@click="handleDateClick('WEEK')" :type="condition.type === 'WEEK'? 'primary':'default'") 近7天
              a-button(@click="handleDateClick('MONTH')" :type="condition.type === 'MONTH'? 'primary':'default'") 近30天
          a-form-item(label="理货时间")
            a-range-picker(v-model:value="time" :format="dateFormat" :valueFormat="dateFormat" allowClear @change="timeChange")
          a-form-item(label="")    
            a-input(v-model:value.trim="condition.keyword" placeholder="商家名称/商家编号" @pressEnter="search" allowClear)
          a-form-item 
            a-space(:size="16")
              a-button(type="primary" @click="search") 查询
              a-button( @click="reset") 重置
  template(#content-table)
    a-table(
      :columns="columns"
      :data-source="data"
      size="middle"
      :pagination="pagination"
      :rowKey="(record) => record.porkReportCode"
      :scroll="{y: tableHeight}"
      @change="changePage"
      :loading="loading")
      template(#action="{record}") 
        a(@click="handleClick(record.porkReportCode)") 查看
  template(#footer-page)
    a-button(@click="handleBack") 返回             
</template>
<script lang="jsx">
// import { cloneDeep } from "lodash-es";
// import { flattenTree } from "@/utils/common.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
// import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const dateFormat = "YYYY/MM/DD";
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    // 数据
    const date = route.query.date;
    const state = reactive({
      columnList: [
        "sort",
        "tallyMachine",
        "porkReportCode",
        "merchantName",
        "merchantCode",
        "porkReportSlices",
        "porkReportWeight",
        "slices",
        "tallyWeight",
        "cheatStatus",
        "auditStatus",
        "action",
      ],
      columns: [
        {
          title: "理货机名称",
          dataIndex: "machineName",
          key: "machineName",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货批次",
          dataIndex: "porkReportCode",
          key: "porkReportCode",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "商家名称",
          dataIndex: "supplierName",
          key: "supplierName",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "商家编号",
          dataIndex: "supplierCode",
          key: "supplierCode",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货片数",
          dataIndex: "porkArrangeSlices",
          key: "porkArrangeSlices",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          title: "理货结果",
          dataIndex: "result",
          key: "result",
          slots: {
            customRender: "result",
          },
          customRender: ({ text }) => {
            if (text) {
              return <g-table-dot content="正常" />;
            } else {
              return <g-table-dot content="作弊嫌疑" status="delete" />;
            }
          },
        },
      ],
      data: [],
      icon: createVNode(CaretDownOutlined),
      loading: true,
      pagination: null,
      tableHeight: 0,
    });

    const time = ref([null, null]);

    const condition = ref({
      keyword: null,
      type: "TODAY",
      pageNumber: 1,
      pageSize: 10,
    });
    // 默认显示一页5条
    state.pagination = {
      total: 0,
      position: "bottom",
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "30", "50"],
      // showTotal: (total) => `共${total}条数据`,
      showTotal: () => `共${state.data.length}条数据`,
    };

    // 获取表格数据
    const getTableData = (data) => {
      if (data.type === "CUSTOM") data.type = ''
      proxy.$api
        .getPorkStatArrangeDetail(data, "get")
        .then((res) => {
          state.pagination.total = res.total;
          state.data = res.details;
        })
        .finally(() => {
          state.loading = false;
        });
    };

    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      condition.value.pageNumber = e.current;
      condition.value.pageSize = e.pageSize;
      getTableData(condition.value);
    };

    const search = () => {
      state.loading = true;
      state.pagination.current = 1;
      condition.value.pageNumber = 1;
      getTableData(condition.value);
    };

    const reset = () => {
      time.value = [null, null];
      condition.value = {
        keyword: null,
        type: "TODAY",
        pageNumber: 1,
        pageSize: 10,
      };
      state.loading = true;
      getTableData(condition.value);
    };

    const handleBack = () => {
      router.back(-1);
    };
    const handleClick = (code) => {
      const porkReportCode = code ? code : "";
      history.pushState({ current: location.pathname + location.search }, "", `/portal/meatSlider/followUpDetails?porkReportCode=${porkReportCode}`)
    };

    const handleDateClick = (date) => {
      condition.value.type = date;
      time.value = [null, null];
      getTableData(condition.value);
    };

    const timeChange = (e) => {
      if (e.length) {
        condition.value.type = null;
        condition.value.period = [e[0], e[1]].join(",");
      } else {
        condition.value.type = "TODAY";
        condition.value.period = null;
      }
      getTableData(condition.value);
    };

    onMounted(() => {
      // condition.value.type = date;
      setTimeout(() => {
        const contentHei = document.querySelector(
          ".view_content .ant-layout-content"
        ).clientHeight;
        state.tableHeight = contentHei - 300;
      }, 100);
      // debugger;
      if (sessionStorage.getItem("panelTime")) {
        let data = sessionStorage.getItem("panelTime");
        data = data.split(",");
        if (data.length === 2) {
          condition.value.period = [data[0], data[1]].join(",");
          condition.value.type = null;
          time.value = data;
        } else {
          condition.value.type = data[0];
        }
      }
      getTableData(condition.value);
    });

    return {
      dateFormat,
      ...toRefs(state),
      condition,
      getTableData,
      search,
      reset,
      changePage,
      handleBack,
      handleClick,
      handleDateClick,
      time,
      timeChange,
    };
  },
});
</script>
<style scoped lang="less">

:deep(.ant-table-pagination) {
  position: fixed;
  bottom: 100px;
  right: 30px;
  z-index: 1;
}
:deep(.ant-layout-footer) {
  width: 100%;
  height: 70px;
  line-height: 70px;
  padding: 0 20px 0 0;
  background-color: @white;
  text-align: right;
  border-top: 1px solid @colorEee;
}
</style>
