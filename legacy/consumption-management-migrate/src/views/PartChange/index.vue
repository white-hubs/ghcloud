<template>
  <gLayout :title="pageTitle ?? '份变更明细'">
    <template #content-search>
      <div style="display: inline;">
        <Button
          @click="Copiesexport"
          type="primary"
          style="float: right; margin-bottom: 15px"
        >
          导出
        </Button>
      </div>
      <div class="queryCondition">
        <Input
          v-model:value="PartChangeData.enterParam"
          style="width: 300px"
          :maxlength="50"
          placeholder="请输入人工序号、工号、卡号、姓名搜索"
        />
        <div style="margin: 0 10px;white-space: nowrap;">交易时间:</div>
        <RangePicker
          :allowClear="false"
          v-model:value="timeData"
          :placeholder="['开始时间', '结束时间']"
          :disabled-date="disabledDate"
        />
        <div style="margin: 0 10px;white-space: nowrap;">交易类型:</div>
        <Select
          style="width: 300px"
          v-model:value="PartChangeData.transactionType"
          :options="statusList"
          :field-names="{ label: 'name', value: 'value' }"
        ></Select>
        <Button type="primary" @click="getList()" style="margin: 0 10px;">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
      <div
        style="display: flex; justify-content: space-between; margin-top: 20px"
      >
        <div class="money" style="background: #e6f7ff">
          <div>补贴份数</div>
          <div class="num">
            {{
              GetificationData["份补贴"] !== undefined
                ? GetificationData["份补贴"]
                : 0
            }}
          </div>
        </div>
        <div class="money" style="background: #f6ffed">
          <div>消费份数</div>
          <div class="num">
            {{
              GetificationData["份消费"] !== undefined
                ? GetificationData["份消费"]
                : 0
            }}
          </div>
        </div>
        <div class="money" style="background: #e6fffb">
          <div>清除份数</div>
          <div class="num">
            {{
              GetificationData["份清零"] !== undefined
                ? GetificationData["份清零"]
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
          :data-source="PartChangeList"
          :pagination="PartChangeData"
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
import { onErrorCaptured, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useRoute, useRouter } from "vue-router";
import {
  TransactionType,
  GetCopiesChange,
  GetShareStatistics,
  CopiesExport,
} from "@/api/management";
import { usePageName } from '@ghcloud/cube-utils'

const route = useRoute();
const { pageTitle } = usePageName()
const statusList = ref<{ name: string; value: number }[]>([]);
TransactionType().then(res => {
  statusList.value = res.data.filter((res: any) => {
    return res.value % 2 == 0;
  });
});
let timeData = ref<any>([
  dayjs(
    dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format("YYYY-MM-DD "),
  ),
  dayjs(dayjs(), "YYYY-MM-DD "),
]);

const queryData = reactive<PartChange.QueryType>({
  userCard: route.query?.userCard,
});

/**账户管理查询值 */
const PartChangeData = reactive<PartChange.PartChangeData>({
  transactionType: undefined,
  enterParam: "",

  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: "",
});

const columns: TableColumnsType = [
  {
    title: "交易时间",
    dataIndex: "transactionTime",
    align: "center",
    width: 170,
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
  },
  {
    title: "交易份数（数量）",
    dataIndex: "transactionCount",
    align: "center",
    width: 100,
    key: "transactionCount",
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
      // return statusList.value.find((res: any) => res.value == text)?.name;
      return text;
    },
  },
  {
    title: "补贴有效日期",
    dataIndex: "subsidyBeginDate",
    align: "center",
    width: 170,
    key: "subsidyBeginDate",
    slots: {
      customRender: "subsidyBeginDate",
    },
    customRender: ({ text, record }) => {
      return text == "" ? "--" : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "补贴有效截止日期",
    dataIndex: "subsidyEndDate",
    align: "center",
    width: 170,
    key: "subsidyEndDate",
    slots: {
      customRender: "subsidyEndDate",
    },
    customRender: ({ text, record }) => {
      return text == "" ? "--" : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "交易场所",
    dataIndex: "depName",
    align: "center",
    key: "depName",
  },
  {
    title: "交易状态",
    dataIndex: "transactionStatus",
    align: "center",
    key: "transactionStatus",
    slots: {
      customRender: "transactionStatus",
    },
    customRender: ({ text, record }) => {
      return text == "0" ? "失败" : text == "" ? "--" : "成功";
    },
  },
  {
    title: "人员序号",
    dataIndex: "userSerial",
    align: "center",
    key: "userSerial",
  },
  {
    title: "工号",
    dataIndex: "userNo",
    align: "center",
    key: "userNo",
  },
  {
    title: "姓名",
    dataIndex: "userName",
    align: "center",
    key: "userName",
  },
];
const GetificationData = ref<any>({});
const PartChangeList = ref<PartChange.PartChangeList[]>([]);

const Getification = (): void => {
  GetShareStatistics({
    enterParam: PartChangeData.enterParam,
    period: `${
      dayjs(timeData.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"
    },${dayjs(timeData.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"}`,
  }).then(res => {
    GetificationData.value = res.data?.map;
  });
};
let queryList = ref<boolean>(true);
const getList = async () => {
  if (queryList.value) {
    PartChangeData.period = `${
      dayjs(timeData.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"
    },${dayjs(timeData.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"}`;
    let { data } = await GetCopiesChange(PartChangeData);

    queryList.value = false;
    Getification();
    PartChangeList.value = data.records;
    PartChangeData.total = data.total;
  }
  setTimeout(() => {
    queryList.value = true;
  }, 1000);
};
/**重置 */
const reset = () => {
  PartChangeData.enterParam = "";
  PartChangeData.transactionType = "";
  timeData.value = [
    dayjs(
      dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format(
        "YYYY-MM-DD ",
      ),
    ),
    dayjs(dayjs(), "YYYY-MM-DD "),
  ];
  getList();
};
const changeSize = async ({
  current,
  pageSize,
}: {
  current: number;
  pageSize: number;
}) => {
  PartChangeData.pageNumber = current;
  PartChangeData.pageSize = pageSize;
  getList();
};
/**判断是否从详情点过来 */
if (queryData.userCard) {
  PartChangeData.enterParam = queryData.userCard;
  getList();
}
getList();

/**禁止选择 */
const disabledDate = (current: Dayjs): boolean => {
  // Can not select days before today and today
  return (
    (current && current > dayjs().endOf("day")) ||
    current < dayjs().subtract(1, "year")
  );
};
/**导出 */
const Copiesexport = async () => {
  let { data } = await CopiesExport({
    transactionType: PartChangeData.transactionType,
    enterParam: PartChangeData.enterParam,
    period: `${
      dayjs(timeData.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"
    },${dayjs(timeData.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"}`,
  });
  const link = document.createElement("a");
  let blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  link.style.display = "none";
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${pageTitle || '份变更明细'}.xlsx`);
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
  width: 30%;
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
