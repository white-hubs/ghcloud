<template>
  <gLayout :title="pageTitle ?? '金额变更明细'">
    <template #content-search>
      <div style="display: inline;">
        <Button
          type="primary"
          style="float: right; margin-bottom: 15px"
          @click="Moneyexport"
        >
          导出
        </Button>
      </div>
      <div class="queryCondition">
        <Input
          v-model:value="MoneyChangeData.enterParam"
          style="width: 300px"
          :maxlength="50"
          placeholder="请输入人工序号、工号、卡号、姓名搜索"
        />
        <div style="white-space: nowrap;margin: 0 10px;">交易时间:</div>
        <RangePicker
          v-model:value="time"
          :allowClear="false"
          :placeholder="['开始时间', '结束时间']"
          :disabled-date="disabledDate"
        />
        <div style="white-space: nowrap;margin: 0 10px;">交易类型:</div>
        <Select
          style="width: 300px"
          v-model:value="MoneyChangeData.transactionType"
          :options="statusList"
          :field-names="{ label: 'name', value: 'value' }"
          placeholder="请选择"
        ></Select>
        <Button type="primary" @click="getList()" style="margin: 0 10px;">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
      <div
        style="display: flex; justify-content: space-between; margin-top: 20px"
      >
        <div class="money" style="background: #e6f7ff">
          <div>消费金额</div>
          <div class="num">
            {{
              AmountChangeClassification["消费金额"] !== undefined
                ? AmountChangeClassification["消费金额"]
                : 0
            }}
          </div>
        </div>
        <div class="money" style="background: #f6ffed">
          <div>消费退款金额</div>
          <div class="num">
            {{
              AmountChangeClassification["退款金额"] !== undefined
                ? AmountChangeClassification["退款金额"]
                : 0
            }}
          </div>
        </div>
        <div class="money" style="background: #e6fffb">
          <div>充值金额</div>
          <div class="num">
            {{
              AmountChangeClassification["充值金额"] !== undefined
                ? AmountChangeClassification["充值金额"]
                : 0
            }}
          </div>
        </div>
        <div class="money" style="background: #fff7e6">
          <div>补贴金额</div>
          <div class="num">
            {{
              AmountChangeClassification["补贴金额"] !== undefined
                ? AmountChangeClassification["补贴金额"]
                : 0
            }}
          </div>
        </div>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 473px)">
        <gTable
          :columns="columns"
          :scroll-info="{ y: 300 }"
          :data-source="MoneyChangeList"
          :pagination="MoneyChangeData"
          @changeSize="changeSize"
        ></gTable>
      </div>
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import {
  Button,
  Input,
  Select,
  TableColumnsType,
  RangePicker,
} from "ant-design-vue";
import gTable from "@/components/common/gTable.vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, onErrorCaptured, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useDebounceFn, useThrottleFn } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import {
  TransactionType,
  GetAmountChange,
  GetAmountChangeClassification,
  MoneyExport,
} from "@/api/management";
import { usePageName } from '@ghcloud/cube-utils'

const { pageTitle } = usePageName()
const statusList = ref<{ name: string; value: number }[]>([]);
TransactionType().then(res => {
  statusList.value = res.data.filter((res: any) => {
    return res.value % 2 !== 0;
  });
});
const route = useRoute();
let time = ref<any>([
  dayjs(
    dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format("YYYY-MM-DD "),
  ),
  dayjs(dayjs(), "YYYY-MM-DD "),
]);

const queryData = reactive<MoneyChange.QueryType>({
  userCard: route.query?.userCard,
});

/**账户管理查询值 */
const MoneyChangeData = reactive<MoneyChange.MoneyChangeData>({
  transactionType: undefined,
  enterParam: "",
  period: "",
  pageNumber: 1,
  pageSize: 10,
  total: 0,
});

const columns: TableColumnsType = [
  {
    title: "交易时间",
    dataIndex: "transactionTime",
    width: 170,
    align: "center",
    key: "transactionTime",
    slots: {
      customRender: "transactionTime",
    },
    customRender: ({ text, record }) => {
      return dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "卡号",
    dataIndex: "userCard",
    align: "center",
    key: "userCard",
    slots: {
      customRender: "userCard",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "交易金额（元）",
    dataIndex: "transactionMoney",
    align: "center",
    key: "transactionMoney",
    slots: {
      customRender: "transactionMoney",
    },
    customRender: ({ text }) => {
      return text == null ? "--" : text;
    },
  },
  {
    title: "交易类型",
    dataIndex: "transactionType",
    align: "center",
    key: "transactionType",
    slots: {
      customRender: "transactionType",
    },
    customRender: ({ text, record }) => {
      // return
      return text;
    },
  },
  {
    title: "账户余额（元）",
    dataIndex: "balance",
    align: "center",
    key: "balance",
    slots: {
      customRender: "balance",
    },
    customRender: ({ text }) => {
      return text == null ? "--" : text;
    },
  },
  {
    title: "交易场所",
    dataIndex: "depName",
    align: "center",
    key: "depName",
    slots: {
      customRender: "depName",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "交易渠道",
    dataIndex: "transactionChannel",
    align: "center",
    key: "transactionChannel",
    slots: {
      customRender: "transactionChannel",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "订单号",
    dataIndex: "orderId",
    align: "center",
    key: "orderId",
    slots: {
      customRender: "orderId",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "人员序号",
    dataIndex: "userSerial",
    align: "center",
    key: "userSerial",
    slots: {
      customRender: "userSerial",
    },
    customRender: ({ text }) => {
      return text == null ? "--" : text;
    },
  },
  {
    title: "工号",
    dataIndex: "userNo",
    align: "center",
    key: "userNo",
    slots: {
      customRender: "userNo",
    },
    customRender: ({ text }) => {
      return text == "" ? "--" : text;
    },
  },
  {
    title: "姓名",
    dataIndex: "userName",
    align: "center",
    slots: {
      customRender: "userName",
    },
    customRender: ({ text, record, index }) => {
      return text == "" ? "--" : text;
    },
  },
];
const MoneyChangeList = ref<MoneyChange.MoneyChangeList[]>([]);
const AmountChangeClassification = ref<any>({});
const Getification = () => {
  GetAmountChangeClassification({
    enterParam: MoneyChangeData.enterParam,
    period: `${dayjs(time.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"},${
      dayjs(time.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"
    }`,
  }).then(res => {
    AmountChangeClassification.value = res.data.map;
  });
};
let queryList = ref<boolean>(true);
const getList = async () => {
  if (queryList.value) {
    MoneyChangeData.period = `${
      dayjs(time.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"
    },${dayjs(time.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"}`;
    Getification();
    let { data } = await GetAmountChange(MoneyChangeData);
    queryList.value = false;
    MoneyChangeList.value = data.records;
    MoneyChangeData.total = data.total;
  }
  setTimeout(() => {
    queryList.value = true;
  }, 1000);
};
const changeSize = async ({
  current,
  pageSize,
}: {
  current: number;
  pageSize: number;
}) => {
  MoneyChangeData.pageNumber = current;
  MoneyChangeData.pageSize = pageSize;
  getList();
};
/**重置 */
const reset = () => {
  MoneyChangeData.enterParam = "";
  MoneyChangeData.transactionType = "";
  time.value = [
    dayjs(
      dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format(
        "YYYY-MM-DD ",
      ),
    ),
    dayjs(dayjs(), "YYYY-MM-DD "),
  ];
  getList();
};
/**判断是否从详情点过来 */
if (queryData.userCard) {
  MoneyChangeData.enterParam = queryData.userCard;
  getList();
}
getList();

/**禁止选择 */
const disabledDate = (current: Dayjs): boolean => {
  // Can not select days before today and today

  // return current > dayjs().subtract(1, "days").endOf("day");
  // return current && current > dayjs().endOf("day");
  return (
    (current && current > dayjs().endOf("day")) ||
    current < dayjs().subtract(1, "year")
  );
};
/**导出 */
const Moneyexport = async () => {
  let { data } = await MoneyExport({
    transactionType: MoneyChangeData.transactionType,
    enterParam: MoneyChangeData.enterParam,
    period: `${dayjs(time.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"},${
      dayjs(time.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"
    }`,
  });

  const link = document.createElement("a");
  let blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  link.style.display = "none";
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${pageTitle || '金额变更明细'}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped lang="less">
.queryCondition {
  width: 73%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.money {
  width: 23%;
  height: 112px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  padding: 20px;
  box-sizing: border-box;
}
.num {
  margin-top: 10px;
  font-size: 24px;
  color: black;
}
</style>
