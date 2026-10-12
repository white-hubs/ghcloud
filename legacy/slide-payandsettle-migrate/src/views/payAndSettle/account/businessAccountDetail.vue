<template lang="pug">
g-layout(title="账户详情")
  template(#content-table)
    .detail-form
      a-form(:model="detailsInfo" layout="inline")
        .item-title 基础信息
        a-form-item(label="账户状态") {{detailsInfo?.status === 'ACTIVATED'? '已激活':'待激活'}}
        a-form-item(label="客户名称") {{detailsInfo?.adminUserName? detailsInfo.adminUserName:'--'}}
        .item-title 资金信息
        a-form-item(label="账户余额") {{detailsInfo?.balance? "￥"+millennial(detailsInfo?.balance):'--'}}
        a-form-item(label="免密支付") {{detailsInfo?.paymentQuickly? '开启':"关闭"}}
        a-form-item(label="开通时间") {{detailsInfo?.activateTime? timeFormat(detailsInfo?.activateTime,true):"--"}}
        template(v-if="detailsInfo?.status === 'ACTIVATED'")
          .item-title 交易流水
      div
        a-form.default(layout="inline")
          a-form-item(label="业务类型")
            a-select(v-model:value="condition.business" allowClear placeholder="请选择业务类型" @change="search")
              a-select-option(v-for="item in fundType" :value="item.value") {{item.name}}
          a-form-item(label="资金流向")
            a-select(v-model:value="condition.flow" allowClear placeholder="请选择资金流向" @change="search")
              a-select-option(v-for="item in moneyFlow" :value="item.value") {{item.name}}
          a-form-item(label="交易时间")
            a-range-picker(v-model:value="time" :format="dateFormat" :valueFormat="dateFormat" @change="search")
          a-form-item(label="" style="margin-left:20px")    
            a-input( v-model:value.trim="condition.keyword" placeholder="流水号" allowClear @pressEnter="search")
          a-form-item(style="margin-left:20px")
            a-space(:size="16") 
              a-button(type="primary" @click="search") 查询
              a-button(@click="reset") 重置
        a-table.pl2(
          :data-source="tableData" 
          size="middle" 
          :loading="loading"
          :columns="columns" 
          :rowKey="(record)=> record.createTime" 
          @change="changePage"
          :scroll="{x: 1000}" 
          :pagination="pagination")
  template(#footer-page)
    a-button( @click="cancel") 返回  
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  toRefs,
  ref,
  onMounted,
} from "vue";
import { moneyFlow, fundType } from "@/utils/enumerate.js";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, millennial, tableColumns } from "@/utils/common";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  setup() {
    const dateFormat = "YYYY/MM/DD";
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      data: null,
      columnList: [
        "business",
        "type",
        "flow",
        "payer",
        "payee",
        "amount",
        "createTime",
        "remark",
      ],
      columns: [
        {
          mark: "business",
          dataIndex: "business",
          key: "business",
          title: "流水号",
          slots: {
            customRender: "business",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text.id : ""}>
                {text ? text.id : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        }, {
          mark: "type",
          dataIndex: "type",
          key: "type",
          title: "业务类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text, record }) => {
            return (
              <PopOver
                position="topLeft"
                content={record.business ? record.business.name : ""}
              >
                {record.business ? record.business.name : "--"}
              </PopOver>
            );
          },
          // width: 150,
          ellipsis: true,
        }, {
          mark: "flow",
          dataIndex: "flow",
          key: "flow",
          title: "资金流向",
          slots: {
            customRender: "flow",
          },
          customRender: ({ text }) => {
            if (text === "INCOME") {
              return (
                <PopOver position="topLeft" content="入账">
                  入账
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content="出账">
                  出账
                </PopOver>
              );
            }
          },
          ellipsis: true,
        }, {
          mark: "payer",
          dataIndex: "sourceMerchant.name",
          key: "sourceMerchant.name",
          title: "出账方",
          slots: {
            customRender: "payer",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "payee",
          dataIndex: "targetMerchant.name",
          key: "targetMerchant.name",
          title: "入账方",
          slots: {
            customRender: "payee",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "amount",
          dataIndex: "amount",
          key: "amount",
          title: "金额",
          slots: {
            customRender: "amount",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? `￥${millennial(text)}` : ""}
              >
                {text || text === 0 ? `￥${millennial(text)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "createTime",
          dataIndex: "createTime",
          key: "createTime",
          title: "交易时间",
          slots: {
            customRender: "createTime",
          },

          customRender: ({ text }) => {
            return (
              <PopOver
                position="topLeft"
                content={text ? timeFormat(text, true) : ""}
              >
                {text ? `${timeFormat(text, true)}` : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }, {
          mark: "remark",
          dataIndex: "remark",
          key: "remark",
          title: "备注",
          slots: {
            customRender: "remark",
          },

          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
          ellipsis: true,
        }
      ],
      spinning: false,
    });
    const tableState = reactive({
      tableData: null,
      loading: false,
      time: [],
      fundType: null,
      pagination: {
        pageSize: 10,
        total: 0,
      },
    });

    const condition = ref({
      id: null,
      keyword: null,
      flow: null,
      business: null,
      period: null,
      tenant: getNowEnterprise().code,
      pageNumber: 1,
      pageSize: 10,
    });

    // 有id
    const detailsInfo = JSON.parse(route.query.details);
    condition.value.id = detailsInfo.id;

    const getTableData = (data) => {
      tableState.loading = true;
      proxy.$api.merchantAccountDetail(data, "get").then((res) => {
        tableState.tableData = res.records;
        tableState.pagination.total = res.total;
      })
        .finally(() => {
          tableState.loading = false;
        });
    };

    const search = () => {
      if (tableState.time.length) {
        if (!tableState.time[1].includes("23:59:59")) {
          tableState.time[1] = tableState.time[1] + " 23:59:59";
        }
      }
      condition.value.period = tableState.time.join(",");
      tableState.pagination.current = 1;
      condition.value.pageNumber = 1;
      getTableData(condition.value);
    };

    const cancel = () => {
      formState.data = null;
      router.back(-1);
    };

    const getTrafficType = async (keyName, addKeyName) => {
      await proxy.$api.transactionsType(null, "get").then((res) => {
        if (addKeyName) {
          for (let i of res) {
            i[addKeyName] = i[keyName];
          }
        }
        tableState.fundType = res;
        tableState.fundType.unshift({
          value: "",
          name: "全部",
        });
      });
    };

    const changePage = (e) => {
      condition.value.pageNumber = e.current;
      tableState.pagination.current = e.current;
      getTableData(condition.value);
    };

    const reset = () => {
      tableState.time = [];
      condition.value = {
        id: detailsInfo.id,
        keyword: null,
        flow: null,
        business: null,
        period: null,
        tenant: getNowEnterprise().code,
        pageNumber: 1,
        pageSize: 10,
      };
      getTableData(condition.value);
    };

    onMounted(() => {
      getTrafficType("code", "value");
      // formState.columns = tableColumns("accountManage", formState.columnList);
      getTableData(condition.value);
    });

    return {
      dateFormat,
      detailsInfo,
      condition,
      moneyFlow,
      // fundType,
      ...toRefs(formState),
      ...toRefs(tableState),
      cancel,
      timeFormat,
      millennial,
      search,
      changePage,
      reset,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
<style lang="less">
.detail-form {
  .default {
    &.ant-form-inline {
      .ant-form-item {
        width: auto !important;
      }
    }

    .ant-form-item-control-input-content .ant-select {
      width: 200px !important;
    }

    .ant-form-item-control-input-content>span {
      width: 200px !important;
    }
  }
}
</style>
