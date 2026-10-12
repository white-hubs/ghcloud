<template>
  <gLayout :title="pageTitle ?? '个人记录明细'">
    <template #content-search>
      <div class="queryCondition">
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
          v-model:value="search.interfaceEnum"
          :options="statusList"
          :field-names="{ label: 'name', value: 'value' }"
        ></Select>
        <Button type="primary" @click="getList()" style="margin: 0 10px;">查询</Button>
        <Button @click="reset">重置</Button>
      </div>
      <div style="margin-top: 15px; background: rgb(230, 247, 255); padding: 10px 15px;">
        <Descriptions :column="4">
        <DescriptionsItem label="姓名">{{ info?.userName ?? '--' }}</DescriptionsItem>
        <DescriptionsItem label="消费卡号">{{ info?.userCard ?? '--' }}</DescriptionsItem>
        <DescriptionsItem label="现金余额(元)">{{ info?.cashBalance ?? '--' }}</DescriptionsItem>
        <DescriptionsItem label="补贴余额(元)">{{ info?.subsidyBalance ?? '--' }}</DescriptionsItem>
        <DescriptionsItem label="理发券余额(元)">{{ info?.haircutCount ?? '--' }}</DescriptionsItem>
        <DescriptionsItem label="洗衣次数">{{ info?.laundryCount ?? '--' }}</DescriptionsItem>
      </Descriptions>
      </div>
    </template>
    <template #content-table>
      <div style="height: calc(100vh - 473px)">
        <gTable
          :columns="columns"
          :scroll-info="{ y: 300 }"
          :data-source="PartChangeList"
          :pagination="search"
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
  Popover,
  Descriptions,
  DescriptionsItem
} from "ant-design-vue";
import gTable from "@/components/common/gTable.vue";
import gLayout from "@/components/common/gLayout.vue";
import { h, onMounted, reactive, ref } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { useRoute } from "vue-router";
import {
  RecordType,
  getConsumeRecordPage,
  getConsumeAccountInfo,
} from "@/api/management";
import { usePageName } from '@ghcloud/cube-utils'
import { getUserInfo } from "@/utils/auth";

const route = useRoute();
const { pageTitle } = usePageName()
const statusList = ref<{ name: string; value: number }[]>([]);
RecordType().then(res => {
  statusList.value = res.data;
});
let timeData = ref<any>([
  dayjs(
    dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format("YYYY-MM-DD "),
  ),
  dayjs(dayjs(), "YYYY-MM-DD "),
]);

/**账户管理查询值 */
const search = reactive({
  interfaceEnum: undefined,
  enterParam: '',
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  period: '',
  accountId: '',
});

const columns: TableColumnsType = [
  {
    title: "交易时间",
    dataIndex: "tradeTime",
    align: "center",
    width: 180,
    key: "tradeTime",
    customRender: ({ text }) => {
      const textVal = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ''
      return [
        h(Popover, { content: textVal }, { default: () => textVal as string || '--' })
      ]
    }
  },
  {
    title: "现金金额（元）",
    dataIndex: "tradeAmount",
    align: "center",
    width: 180,
    key: "tradeAmount",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "补贴金额（元）",
    dataIndex: "subsidyAmount",
    align: "center",
    width: 180,
    key: "subsidyAmount",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "交易类型",
    dataIndex: "recordType",
    align: "center",
    width: 180,
    key: "recordType",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "账户类型",
    dataIndex: "type",
    align: "center",
    width: 180,
    key: "type",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "交易次数",
    dataIndex: "times",
    align: "center",
    width: 180,
    key: "times",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: "交易设备",
    dataIndex: "device",
    align: "center",
    width: 180,
    key: "device",
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
  {
    title: '消费类型',
    dataIndex: 'mode',
    align: "center",
    width: 180,
    key: 'mode',
    ellipsis: true,
    customRender: ({ text }) => {
      return [
        h(Popover, { content: text }, { default: () => text as string || '--' })
      ]
    }
  },
];
const info = ref<any>({});
const PartChangeList = ref<PartChange.PartChangeList[]>([]);
const user = getUserInfo()

const getInfo = (): void => {
  getConsumeAccountInfo({id: user?.id}).then(res => {
    info.value = res.data;
  });
};
let queryList = ref<boolean>(true);
const getList = async () => {
  if (queryList.value) {
    search.period = `${
      dayjs(timeData.value[0]).format("YYYY-MM-DD") + " " + "00:00:00"
    },${dayjs(timeData.value[1]).format("YYYY-MM-DD") + " " + "23:59:59"}`;
    search.accountId = user?.id;
    let { data } = await getConsumeRecordPage(search);
    queryList.value = false;
    PartChangeList.value = data.records;
    search.total = data.total;
  }
  setTimeout(() => {
    queryList.value = true;
  }, 1000);
};
/**重置 */
const reset = () => {
  search.enterParam = '';
  search.interfaceEnum = undefined;
  search.period = '';
  search.accountId = '';
  timeData.value = [
    dayjs(
      dayjs(dayjs(+new Date() - 1000 * 60 * 60 * 24 * 30)).format(
        "YYYY-MM-DD ",
      ),
    ),
    dayjs(dayjs(), "YYYY-MM-DD "),
  ];
  getData();
};
const changeSize = async ({
  current,
  pageSize,
}: {
  current: number;
  pageSize: number;
}) => {
  search.pageNumber = current;
  search.pageSize = pageSize;
  getData();
};
const getData = () => {
  getInfo();
  getList();
}
onMounted(() => {
  getData()
});
/**禁止选择 */
const disabledDate = (current: Dayjs): boolean => {
  return (
    (current && current > dayjs().endOf("day")) ||
    current < dayjs().subtract(1, "year")
  );
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
