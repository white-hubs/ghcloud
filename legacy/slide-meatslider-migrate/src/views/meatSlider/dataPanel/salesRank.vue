<template lang="pug">
g-layout(
  title="销售排名"
)
  template(#content-search)
    a-form.p2(layout="inline")
      a-form-item 
        a-space
          a-button(@click="handleDateClick('TODAY')" :type="condition.type === 'TODAY'? 'primary':'default'") 今日
          a-button(@click="handleDateClick('WEEK')" :type="condition.type === 'WEEK'? 'primary':'default'") 近7天
          a-button(@click="handleDateClick('MONTH')" :type="condition.type === 'MONTH'? 'primary':'default'") 近30天
      a-form-item(label="订单完成时间" :label-col="labelCol")
        a-range-picker(v-model:value="time" :format="dateFormat" :valueFormat="dateFormat" allowClear @change="timeChange")
      a-form-item(label="")
        a-input(v-model:value.trim="condition.keyword" placeholder="商家名称/商家编号" @pressEnter="search" allowClear)  
      a-form-item 
        a-space
          a-button(type="primary" @click="search") 查询
          a-button( @click="reset") 重置
  template(#content-table)
    a-table(
      :columns="columns"
      :data-source="data"
      size="middle"
      :pagination="pagination"
      :rowKey="(record) => record.merchantCode"
      :scroll="{y: tableHeight}"
      @change="changePage"
      :loading="loading")
  template(#footer-page)
    a-button(@click="handleBack") 返回       
</template>
<script lang="jsx">
import { timeFormat, millennial } from "@/utils/common";
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
    const date = route.query.date;

    const state = reactive({
      // columnList: ["label", "merchantName", "merchantCode", "amount"],
      columnList: ["label", "supplyName", "supplierCode", "tradeAmount"],
      columns: [
        {
          mark: "label",
          dataIndex: "sort",
          key: "sort",
          title: "序号",
          slots: {
            customRender: "sort",
          },
          width: 80,
          ellipsis: true,
        }, {
          mark: "supplyName",
          dataIndex: "supplyName",
          key: "supplyName",
          title: "商家名称",
          slots: {
            customRender: "supplyName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "supplierCode",
          dataIndex: "supplierCode",
          key: "supplierCode",
          title: "商家编号",
          slots: {
            customRender: "supplierCode",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "tradeAmount",
          dataIndex: "tradeAmount",
          key: "tradeAmount",
          title: "销售额",
          slots: {
            customRender: "tradeAmount",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? millennial(text) : ""}>
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }
      ],
      data: [],
      icon: createVNode(CaretDownOutlined),
      loading: true,
      pagination: null,
      tableHeight: 0,
    });
    const condition = ref({
      keyword: null,
      type: "TODAY",
      period: null,
      pageNumber: 1,
      pageSize: 10,
    });

    const time = ref([null, null]);

    // 获取表格数据
    const getTableData = (data) => {
      if (data.type === "CUSTOM") data.type = ''
      proxy.$api
        .getPorkSupplyTradeRank(data)
        .then((res) => {
          state.pagination.total = res.total;
          state.data = res.records;
        })
        .finally(() => {
          state.loading = false;
        });
    };
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
        bizType: null,
        type: "TODAY",
        auditStatus: null,
        period: null,
        pageNumber: 1,
        pageSize: 10,
      };
      state.loading = true;
      getTableData(condition.value);
    };

    const handleBack = () => {
      router.back(-1);
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

      if (sessionStorage.getItem("panelTime")) {
        let data = sessionStorage.getItem("panelTime");
        data = data.split(",");
        if (data.length === 2) {
          condition.value.period = [data[0], data[1]].join(",");
          condition.value.type = null;
          time.value = data;
        } else {
          condition.value.type = data[0];
          condition.value.period = null;
        }
      }
      getTableData(condition.value);

      setTimeout(() => {
        const contentHei = document.querySelector(
          ".view_content .ant-layout-content"
        ).clientHeight;
        state.tableHeight = contentHei - 300;
      }, 100);
    });
    return {
      labelCol: {
        style: {
          width: "98px",
        },
      },
      dateFormat,
      time,
      ...toRefs(state),
      condition,
      getTableData,
      search,
      reset,
      changePage,
      handleBack,
      handleDateClick,
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
