<template>
  <g-table
    v-if="!loading"
    title="滞留车辆"
    :columns="columns"
    :search="search"
    :btns="btns"
    :api="api"
    ref="tableRef"
    :beforeGet="beforeGet"
    :searchCache="false"
    :extraSearchModel="extraSearchModel"
    @reset="reset"
  >
    <template #behind-item="{ record }">
      <a-form-item label="入场时间">
        <a-range-picker
          v-model:value="extraSearchModel.date"
          value-format="YYYY-MM-DD"
          :allowClear="false"
          :disabledDate="disabledDate"
          @calendarChange="onCalendarChange"
          style="width: 218px"
        />
        <a-popover title="入场时间最多可选择30天" trigger="hover">
          <a-button type="link"><QuestionCircleOutlined /></a-button>
        </a-popover>
      </a-form-item>
    </template>
  </g-table>
</template>

<script lang="jsx">
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import moment from "moment";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted } from "vue";

export default defineComponent({
  components: {
    QuestionCircleOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const today = moment().format("YYYY-MM-DD");
    const extraSearchModel = reactive({
      date: [today, today],
    });
    const state = reactive({
      columns: [
        {
          dataIndex: "vehicleNo",
          title: "车牌号码",
        },
        {
          dataIndex: "accessTime",
          title: "入场时间",
          key: "accessTime",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : ""}>
                {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "parkingInfoName",
          title: "所属停车场",
          key: "parkingInfoName",
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
          dataIndex: "channelName",
          title: "位置",
        },
        {
          dataIndex: "imageUrl",
          title: "图片",
          slots: {
            customRender: "imageUrl",
          },
          customRender: ({ text }) => {
            return text ? <a-image width={50} height={50} src={text} /> : "暂无图片";
          },
        },
      ],
      loading: false,
      api: { list: "getStrandedVehicles" }, // 滞留车辆列表
      btns: [],
      search: [
        {
          label: "停车场",
          value: "parkingInfoCode",
          placeholder: "请选择停车场",
          component: "g-select",
          // url: "getParkingInfors",
          field: {
            code: "value",
            name: "label",
          },
        },
        {
          label: "搜索",
          value: "keyword",
          placeholder: "请输入车牌号码查询",
        },
      ],
    });
    const beforeGet = (params) => {
      const data = {
        ...params,
      };
      if (extraSearchModel.date.length > 0) {
        const start = moment(extraSearchModel.date[0]).format("YYYY-MM-DD 00:00:00");
        const end = moment(extraSearchModel.date[1]).format("YYYY-MM-DD 23:59:59");
        data.period = `${start},${end}`;
      } else {
        const start = moment(today).format("YYYY-MM-DD 00:00:00");
        const end = moment(today).format("YYYY-MM-DD 23:59:59");
        data.period = `${start},${end}`;
      }
      return {
        ...data,
      };
    };
    onMounted(async () => {
      try {
        state.loading = true;
        const res = await proxy.$api.getParkingInfors();
        state.search[0].options = res;
        res.length && (state.search[0].defaultDate = res[res.length - 1].code);
      } catch {
        message.error("停车场数据获取失败");
      } finally {
        state.loading = false;
      }
    });
    const reset = () => {
      extraSearchModel.date = [today, today];
    };
    const disabledDate = (current) => {
      if (!extraSearchModel.date || extraSearchModel.date.length === 0) {
        return false;
      }
      const tooLate = extraSearchModel.date[0] && current.diff(extraSearchModel.date[0], "days") > 30;
      return tooLate;
    };
    const onCalendarChange = (val) => {
      extraSearchModel.date = val;
    };
    return {
      ...toRefs(state),
      extraSearchModel,
      moment,
      beforeGet,
      disabledDate,
      onCalendarChange,
      reset,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-column-title) {
  font-weight: bold !important;
}
// 面包屑
/deep/ .layout-header {
  padding: 0 15px;
  background-color: #fff;
}
// 搜索
/deep/ .content-search {
  padding-left: 16px;
  background-color: #fff;
}
// 表格
/deep/ .content-table {
  padding: 0 16px;
  background-color: #fff;
}
// 分页
/deep/ .layout-footer {
  height: 56px !important;
  padding-left: 16px;
  margin-bottom: 16px;
  background-color: #fff;
}
</style>
