<template>
  <div class="feeDetail">
    <!-- <div class="fee-status">
      <div v-for="item in formState.statusList" :key="item.status">
        <div>{{ formState.statusObj[item.status] }}</div>
        <div>{{ item.count }}</div>
      </div>
    </div> -->
    <a-form layout="inline" :model="formState" class="fee-form">
      <a-form-item label="收费项目">
        <a-tree-select
          :tree-data="chargeProjectDataSource"
          v-model:value="formState.chargeProjectId"
          placeholder="请选择收费项目"
          style="width: 200px"
          :allowClear="true"
        ></a-tree-select>
      </a-form-item>
      <!-- <a-form-item label="期数"> -->
      <!-- <a-input v-model:value="formState.periodNumber" placeholder="请输入" /> -->
      <!-- <a-select v-model:value="formState.periodNumber" placeholder="请选择期数">
                <a-select-option :value="item.value" v-for="item in calculationMode" :key="item.value">{{ item.name }}</a-select-option>
            </a-select> -->
      <!-- </a-form-item> -->
      <a-form-item label="缴费状态">
        <a-select
          v-model:value="formState.status"
          placeholder="请选择缴费状态"
          style="width: 200px"
          :allowClear="true"
        >
          <a-select-option value="BE_PAID" key="BE_PAID">待缴</a-select-option>
          <a-select-option value="HANDLE" key="HANDLE">处理</a-select-option>
          <a-select-option value="PAID" key="PAID">已缴</a-select-option>
          <a-select-option value="ABOLISH" key="ABOLISH">作废</a-select-option>
          <a-select-option value="RETIRED" key="RETIRED">已退</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-input
          v-model:value="formState.keyword"
          placeholder="请输入档位名称"
          :allowClear="true"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
      <div
        class="right-btn"
        v-if="
          route.query.status !== 'STATUS_DRAFT' &&
          route.query.status !== 'STATUS_ABOLISH'
        "
      >
        <a-button
          type="primary"
          @click="paymentNotice"
          :disabled="selectedRowKeys.length === 0"
          style="margin-right: 10px"
          >创建缴费单</a-button
        >
        <a-button
          type="primary"
          @click="refundNotice"
          :disabled="selectedRowKeys.length === 0"
          danger
          >创建退费单</a-button
        >
      </div>
    </a-form>
    <a-table
      rowKey="id"
      :dataSource="dataSource"
      :columns="columns"
      :pagination="formState.pagination"
      :row-selection="
        route.query.status !== 'STATUS_DRAFT' &&
        route.query.status !== 'STATUS_ABOLISH'
          ? rowSelection
          : null
      "
      @change="changeTable"
      :scroll="{ y: 400 }"
    >
    </a-table>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  ref,
  toRefs,
  computed,
  unref,
  reactive,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@/utils/common.js";
import { replaceObjectKeys } from "@pansy/utils";

export default defineComponent({
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      layout: "horizontal",
      keyword: null,
      chargeProjectId: null,
      periodNumber: null,
      status: null,
      pageNumber: 1,
      pageSize: 10,
      pagination: {
        total: 0,
        pageSize: 10,
      },
      statusObj: {
        BE_PAID: "代缴",
        HANDLE: "处理",
        PAID: "已缴",
        ABOLISH: "作废",
        RETIRED: "已退",
      },
      statusList: [],
    });
    const columns = [
      {
        title: "档位名称",
        dataIndex: "businessName",
        key: "businessName",
      },
      {
        title: "档位编号",
        dataIndex: "businessCode",
        key: "businessCode",
      },
      {
        title: "收费项目",
        dataIndex: "chargeProjectName",
        key: "chargeProjectName",
      },
      {
        title: "计费周期",
        dataIndex: "billingCycle",
        key: "billingCycle",
        slots: {
          customRender: "billingCycle",
        },
        customRender: ({ text }) => {
          if (text === "MONTH") {
            return (
              <PopOver position="topLeft" content="按月计费">
                按月计费
              </PopOver>
            );
          } else if (text === "QUARTER") {
            return (
              <PopOver position="topLeft" content="按季度计费">
                按季度计费
              </PopOver>
            );
          } else if (text === "HALF_YEAR") {
            return (
              <PopOver position="topLeft" content="按半年计费">
                按半年计费
              </PopOver>
            );
          } else if (text === "YEAR") {
            return (
              <PopOver position="topLeft" content="按年计费">
                按年计费
              </PopOver>
            );
          } else if (text === "NOTHING") {
            return "无";
          }
        },
      },
      {
        title: "期数",
        dataIndex: "periodNumber",
        key: "periodNumber",
        slots: { customRender: "periodNumber" },
        customRender: ({ text }) => {
          return (
            <PopOver position="topLeft" content={`第${text}期`}>
              {`第${text}期`}
            </PopOver>
          );
        },
      },
      {
        title: "周期时间",
        dataIndex: "periodStartTime",
        key: "periodStartTime",
        slots: {
          customRender: "periodStartTime",
        },
        customRender: ({ text, record }) => {
          return (
            <PopOver
              position="topLeft"
              content={
                timeFormat(record.periodStartTime, false) +
                "~" +
                timeFormat(record.periodEndTime, false)
              }
            >
              {timeFormat(record.periodStartTime, false) +
                "~" +
                timeFormat(record.periodEndTime, false)}
            </PopOver>
          );
        },
      },
      {
        title: "金额(元)",
        dataIndex: "projectMoney",
        key: "projectMoney",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        slots: {
          customRender: "status",
        },
        customRender: ({ text }) => {
          switch (text) {
            case "BE_PAID":
              return (
                <PopOver position="topLeft" content="待缴">
                  待缴
                </PopOver>
              );
            case "HANDLE":
              return (
                <PopOver position="topLeft" content="处理">
                  处理
                </PopOver>
              );
            case "PAID":
              return (
                <PopOver position="topLeft" content="已缴">
                  已缴
                </PopOver>
              );
            case "ABOLISH":
              return (
                <PopOver position="topLeft" content="作废">
                  作废
                </PopOver>
              );
            case "RETIRED":
              return (
                <PopOver position="topLeft" content="已退">
                  已退
                </PopOver>
              );
            default:
              break;
          }
        },
      },
    ];
    const state = reactive({
      dataSource: [],
      chargeProjectDataSource: [],
      selectedRowKeys: [],
      selected: null,
    });

    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        getCheckboxProps: (record) => ({
          disabled: record.status === "HANDLE",
        }),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.selected = selectedRows;
        },
      };
    });

    const getChargeProjects = () => {
      proxy.$api.getChargeProjects().then((res) => {
        const data = res.map((item) => {
          return Object.assign(item, {
            disabled: true,
          });
        });
        state.chargeProjectDataSource = replaceObjectKeys(data, {
          children: "children",
          id: "value",
          name: "title",
        });
      });
    };
    getChargeProjects();
    const getData = () => {
      proxy.$api
        .getContractLeaseCostDetails({
          contractId: route.query.id,
          keyword: formState.keyword,
          chargeProjectId: formState.chargeProjectId,
          periodNumber: formState.periodNumber,
          status: formState.status,
          pageNumber: formState.pageNumber,
          pageSize: formState.pageSize,
        })
        .then((res) => {
          state.dataSource = res.records;
          formState.pagination.total = res.total;
        });

      proxy.$api
        .getContractLeaseCostDetailStatistics(route.query.id)
        .then((res) => {
          formState.statusList = res;
        });
    };
    if (route.query.id) {
      getData();
    }
    const changeTable = (pagination) => {
      formState.pageNumber = pagination.current;
      getData();
    };
    /*创建缴费单*/
    const paymentNotice = () => {
      const boo = state.selected.some((item) => item.status !== "BE_PAID");
      if (boo) {
        proxy.$message.warn("只能选择待缴状态！");
        return;
      }
      const ids = state.selectedRowKeys.join(",");
      history.pushState({},'',`/portal/contract/paymentDetail?ids=${ids}&type=add`)

   
    };
    /*创建退费单*/
    const refundNotice = () => {
      const boo = state.selected.some((item) => item.status !== "PAID");
      if (boo) {
        proxy.$message.warn("只能选择已缴状态！");
        return;
      }
      const ids = state.selectedRowKeys.join(",");
      history.pushState(
        { current: location.pathname + location.search }, '',
        `/portal/contract/refundDetail?type=add&ids=${ids}`
      )
    };

    const close = () => {
      emit("close", state.selected);
    };
    const reset = () => {
      formState.chargeProjectId = null;
      formState.keyword = null;
      formState.status = null;
      getData();
    };
    return {
      ...toRefs(state),
      route,
      columns,
      rowSelection,
      formState,
      close,
      reset,
      getData,
      changeTable,
      paymentNotice,
      refundNotice,
    };
  },
});
</script>

<style lang="less" scoped>
.feeDetail {
  .fee-form {
    margin: 20px 0;
    padding-left: 10px;
  }

  .fee-status {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 80px;
  }

  .right-btn {
    flex: 1;
    padding-right: 19px;
    text-align: right;
  }
}
</style>
