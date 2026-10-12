<template lang="pug">
g-layout-no-footer(
  title="销售报表")
  template(#content-search)
    a-form(ref="condition" :model="model" :rules="rules" layout="inline")
      a-form-item(label="")
        g-select(v-model:value="model.shop" style="width:180px" :placeholder="'请选择店铺'")
      a-form-item(label)  
        //- a-space(:size="8")
        a-button(:type="model.date === 'nowWeek' ? 'primary' : 'default'" @click="changeSlot('nowWeek')") 本周
        a-button(:type="model.date === 'preWeek' ? 'primary' : 'default'" @click="changeSlot('preWeek')") 上周
        a-button(:type="model.date === 'nowMonth' ? 'primary' : 'default'" @click="changeSlot('nowMonth')") 本月
        a-button(:type="model.date === 'preMonth' ? 'primary' : 'default'" @click="changeSlot('preMonth')") 本月
      a-form-item(style="width:225px")
        a-range-picker(v-model="model.period" :format="'YYYY/MM/DD'" :valueFormat="'YYYY/MM/DD'")  
    div.cardGrid
      a-card
        div.flex.justify-between  
          a-statistic(title="订货单" :value="1128")
          span.vertical
          a-statistic(title="退货单" :value="1128")
      a-card   
        div.flex.justify-between  
          a-statistic(title="订货数量" :value="11289")
          span.vertical
          a-statistic(title="退货数量" :value="11289") 
      a-card    
        div.flex.justify-between 
          a-statistic(title="订货重量" :value="1893" :precision="2" )
          span.vertical
          a-statistic(title="退货重量" :value="1893" :precision="2" )
      a-card    
        div.flex.justify-between
          a-statistic(title="订货总金额" :value="112893" :precision="2" )
          span.vertical
          a-statistic(title="退货总金额" :value="112893" :precision="2" )
          span.vertical
          a-statistic(title="总金额合计" :value="112893" :precision="2" )
  template(#content-table)
    div   
      g-select(style="width:180px" placeholder="请选择统计标准")
      div#echarts
      div
        a-table(
        :columns="columns"
        :dataSource="sendData"
        :rowKey="'id'"
        :pagination="false")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  nextTick,
  inject,
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
    const echarts = inject("echarts");

    const tableRef = ref();
    const state = reactive({
      api: {
        list: "sendType",
      },
      columns: [
        {
          dataIndex: "distributionWay",
          title: "品类名称",
          slots: {
            customRender: "distributionWay",
          },
        },
        {
          dataIndex: "status",
          title: "订货单",
          slots: {
            customRender: "status",
          },
        },
        {
          dataIndex: "openStatus",
          title: "退货单",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "订货数量",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "退货数量",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "订货重量",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "退货重量",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "订货商品总金额",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "退货商品总金额",
          slots: {
            customRender: "openStatus",
          },
        },
        {
          dataIndex: "openStatus",
          title: "金额小计",
          slots: {
            customRender: "openStatus",
          },
        },
      ],
      sendData: [],
      model: { shop: "", period: "", date: "nowWeek" },
      rules: {},
      options: {
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: "bar",
          },
        ],
      },
    });

    const changeStatus = async (slot, record) => {
      // 判断type改变不同的字段状态
      await proxy.$api.sendTypeEdit(record,"put" );
      tableRef.value.getData();
    };

    const getEchartsData = async () => {
      nextTick(() => {
        let myCharts1 = echarts.init(document.getElementById("echarts"));
        myCharts1.setOption(state.options);
      });
    };

    const changeSlot = (type) => {
      state.model.date = type;
    };

    onMounted(() => {
      getEchartsData();
    });

    return {
      tableRef,
      ...toRefs(state),
      changeStatus,
      changeSlot,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-form) {
  text-align: left;
}
.cardGrid {
  width: 100%;
  overflow-x: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  grid-column-gap: 8px;
}
:deep(.ant-card) {
  .ant-card-body {
    padding: 16px;
    > div {
      align-items: center;
    }
    .ant-statistic {
      width: 50%;
      vertical-align: middle;
      // .ant-statistic-content {
      //   display: inline-block;
      // }
      // &:not(:last-child)::after {
      //   content: "";
      //   border-right: 1px dashed #000;
      // }
    }
    .vertical {
      width: 1px;
      border-right: 1px dashed rgba(0, 0, 0, 0.2);
      height: 42px;
      vertical-align: middle;
    }
  }
}
:deep(.content-table) {
  > div {
    width: 100%;
    height: calc(100% - 16px);
    padding: 0 16px 0 0;
    margin-top: 16px;
    overflow-y: auto;
    text-align: left;
  }
}
#echarts {
  width: 100%;
  height: 500px;
}
</style>
