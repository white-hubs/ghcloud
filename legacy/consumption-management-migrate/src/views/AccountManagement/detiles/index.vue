<template>
  <gLayout title="基础信息" :showSearch="false">
    <template #content-table>
      <Row style="margin-top: 20px">
        <Col :span="8">
          <span class="infoRight">卡号：</span>
          {{ detilesData.userCard == "" ? "--" : detilesData.userCard }}
        </Col>
        <Col :span="8">
          <span class="infoRight">人员序号:</span>
          {{
            detilesData.userSerial == undefined ? "--" : detilesData.userSerial
          }}
        </Col>
        <Col :span="8">
          <span class="infoRight">姓名:</span>
          {{ detilesData.userName == "" ? "--" : detilesData.userName }}
        </Col>
      </Row>
      <Row class="infoTop">
        <Col :span="8">
          <span class="infoRight">工号:</span>
          {{ detilesData.userNo == "" ? "--" : detilesData.userNo }}
        </Col>
        <Col :span="8">
          <span class="infoRight">账户余额(元):</span>
          {{
            detilesData.accountBalance == 0 ? "--" : detilesData.accountBalance
          }}
        </Col>
        <Col :span="8">
          <span class="infoRight">补贴余额（元）：</span>
          {{
            detilesData.subsidyBalance == 0 ? "--" : detilesData.subsidyBalance
          }}
        </Col>
      </Row>
      <Row class="infoTop">
        <Col :span="8">
          <span class="infoRight">现金余额（元）：</span>
          {{ detilesData.cashBalance == 0 ? "--" : detilesData.cashBalance }}
        </Col>
      </Row>
    </template>
  </gLayout>

  <gLayout title="金额变更记录" :showSearch="false">
    <a class="more" @click="goamountRecord">查看更多</a>
    <template #content-table>
      <gTable
        :scroll-info="{ y: 170 }"
        :showpagination="false"
        :columns="amountRecordcolumns"
        :data-source="detilesData.amountRecord"
      ></gTable>
    </template>
  </gLayout>
  <gLayout title="份变更记录" :showSearch="false">
    <a class="more" @click="gocopiesRecord">查看更多</a>
    <template #content-table>
      <gTable
        :showpagination="false"
        :scroll-info="{ y: 170 }"
        :columns="copiesRecordcolumns"
        :data-source="detilesData.copiesRecord"
      ></gTable>
    </template>
  </gLayout>
  <div style="position: absolute; bottom: 38px; right: 38px">
    <Button @click="goBack">返回</Button>
  </div>
</template>

<script setup lang="ts">
import { Row, Col, TableColumnsType, Button } from "ant-design-vue";
import gTable from "@/components/common/gTable.vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { GetAccountDetails, TransactionType } from "@/api/management";
const router = useRouter();
const route: any = useRoute();
const detilesData = reactive<AccountManagement.AccountManagementDetiles>({
  userCard: "1234",
  userSerial: undefined,
  userName: "",
  userNo: "",
  subsidyBalance: 0,
  cashBalance: 0,
  accountBalance: 0,
  amountRecord: [],
  copiesRecord: [],
});
const amountRecordcolumns: TableColumnsType = [
  {
    title: "交易时间",
    dataIndex: "transactionTime",
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
    title: "交易金额(元)",
    dataIndex: "transactionMoney",
    align: "center",
    key: "transactionMoney",
  },
  {
    title: "账户余额(元)",
    dataIndex: "balance",
    align: "center",
    key: "balance",
  },
  // 1, 消费 2 充值 3 补贴 4 补贴清零 5金额消费纠错 6 退款
  {
    title: "交易类型",
    dataIndex: "transactionType",
    align: "center",
    key: "transactionType",
    slots: {
      customRender: "transactionType",
    },
    customRender: ({ text, record }) => {
      return statusList.value?.find(data => data.value == text)?.name;
    },
  },
  {
    title: "补贴有效日期",
    dataIndex: "subsidyBeginDate",
    align: "center",
    key: "subsidyBeginDate",
    slots: {
      customRender: "subsidyBeginDate",
    },
    customRender: ({ text, record }) => {
      return text == null
        ? "--"
        : text == ""
        ? "--"
        : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "补贴有效截止日期",
    dataIndex: "subsidyEndDate",
    align: "center",
    key: "subsidyEndDate",
    slots: {
      customRender: "subsidyEndDate",
    },
    customRender: ({ text, record }) => {
      return text == null
        ? "--"
        : text == ""
        ? "--"
        : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "交易场所",
    dataIndex: "depName",
    align: "center",
    key: "depName",
  },
  // 1支付宝  2 微信 3 银行卡 4 其他
  {
    title: "交易渠道",
    dataIndex: "transactionChannel",
    align: "center",
    key: "transactionChannel",
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
      return text == 1 ? "成功" : "失败";
    },
  },
  {
    title: "订单号",
    dataIndex: "orderId",
    align: "center",
    key: "orderId",
  },
];
const statusList = ref<{ name: string; value: number }[]>([]);
TransactionType().then(res => {
  statusList.value = res.data;
});
const copiesRecordcolumns: TableColumnsType = [
  {
    title: "交易时间",
    dataIndex: "transactionTime",
    align: "center",
    key: "transactionTime",
    slots: {
      customRender: "transactionTime",
    },
    customRender: ({ text, record }) => {
      return text == null
        ? "--"
        : text == ""
        ? "--"
        : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "交易数量(份)",
    dataIndex: "transactionCount",
    align: "center",
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
      return statusList.value.find((res: any) => res.value == text)?.name;
    },
  },
  {
    title: "交易场所",
    dataIndex: "depName",
    align: "center",
    key: "depName",
  },
  {
    title: "补贴有效日期",
    dataIndex: "subsidyBeginDate",
    align: "center",
    key: "subsidyBeginDate",
    slots: {
      customRender: "subsidyBeginDate",
    },
    customRender: ({ text, record }) => {
      return text == null
        ? "--"
        : text == ""
        ? "--"
        : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
  },
  {
    title: "补贴有效截止日期",
    dataIndex: "subsidyEndDate",
    align: "center",
    key: "subsidyEndDate",
    slots: {
      customRender: "subsidyEndDate",
    },
    customRender: ({ text, record }) => {
      return text == null
        ? "--"
        : text == ""
        ? "--"
        : dayjs(text).format("YYYY-MM-DD HH:mm:ss");
    },
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
      return text == "1" ? "成功" : text == "0" ? "失败" : "--";
    },
  },
];
const getDetailes = async () => {
  let { data } = await GetAccountDetails(route.query?.id);
  Object.assign(detilesData, data);
};
getDetailes();
const goBack = () => {
  router.go(-1);
};
const goamountRecord = () => {
  router.push({
    path: "/moneychange",
    query: {
      userCard: detilesData.userCard,
    },
  });
};
const gocopiesRecord = () => {
  router.push({
    path: "/partchange",
    query: {
      userCard: detilesData.userCard,
    },
  });
};
</script>

<style scoped lang="less">
.infoRight {
  padding-right: 20px;
}
.infoTop {
  margin-top: 20px;
}
.more {
  position: absolute;
  right: 30px;
  top: 19px;
}
</style>
