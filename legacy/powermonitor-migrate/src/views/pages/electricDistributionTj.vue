<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :columns="columns"
    :api="api"
    :btns="btns"
    :search="search"
    editMode="page"
    :rowSelection="true"
    :beforeGet="beforeGet"
  >
    <template v-slot:more="{ record }">
      <div>
        <a @click="exportSinger(record)" type="primary">导出</a>
        <a @click="details(record)" type="primary" style="margin-left: 10px">
          详情
        </a>
      </div>
    </template>
    <template v-slot:table="{ record }">
      <a-button
        @click="exportAll(record)"
        :disabled="!record.selectedRowKeys.length"
        type="primary"
      >
        批量导出
      </a-button>
    </template>
  </g-table>
  <a-modal v-model:visible="visible" title="详情" width="1250px" @ok="handleOk">
    <a-table :columns="tablecolumns" :data-source="tableDate"></a-table>
  </a-modal>
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
} from "vue";
import moment from "moment";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  setup() {
    const visible = ref(false);
    const tableDate = ref([]);
    const handleOk = () => {
      visible.value = false;
    };
    const tablecolumns = [
      {
        dataIndex: "electricA",
        title: "变压器a相电流",
      },
      {
        dataIndex: "temperatureA",
        title: "变压器温升a",
      },
      {
        dataIndex: "electricB",
        title: "变压器B相电流",
      },
      {
        dataIndex: "temperatureB",
        title: "变压器温升B",
      },
      {
        dataIndex: "electricC",
        title: "变压器c相电流",
      },
      {
        dataIndex: "temperatureC",
        title: "变压器温升c",
      },
      {
        dataIndex: "powerFactor",
        title: "功率因素",
      },
      {
        dataIndex: "voltageA",
        title: "高压侧电压a",
      },
      {
        dataIndex: "voltageD",
        title: "高压侧电压b",
      },
      {
        dataIndex: "voltageC",
        title: "高压侧电压c",
      },
    ];
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      columns: [
        {
          dataIndex: "recordTime",
          title: "记录日期",
          slots: {
            customRender: "recordTime",
          },
          customRender: ({ text }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },

        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      api: {
        list: "getDistributionTimeRecord",
        deleteSingle: "",
        delete: "",
        path: "",
      },
      btns: [],
      search: [
        {
          label: "时间范围",
          value: "date",
          defaultDate: "period",
          component: "a-range-picker",
          placeholder: "请选择",
        },
      ],
    });
    const { proxy } = getCurrentInstance();
    const tableRef = ref();
    const details = data => {
      proxy.$api
        .getDistributionsTimeRecordDetails({
          period: `${moment(data.recordTime).format(
            "YYYY-MM-DD HH:mm:ss",
          )},${moment(data.recordTime).format("YYYY-MM-DD ")}23:59:59`,
          deviceId: data.deviceId,
        })
        .then(res => {
          visible.value = true;
          tableDate.value = res;
        });
    };
    const exportSinger = data => {
      state.exportLoading = true;

      proxy.$api
        .distributionsDownloadExcel({
          period: `${moment(data.recordTime).format(
            "YYYY-MM-DD HH:mm:ss",
          )},${moment(data.recordTime).format("YYYY-MM-DD ")}23:59:59`,
          deviceId: data.deviceId,
        })
        .then(res => {
          state.exportLoading = false;
          const link = document.createElement("a");
          let blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "园区配电统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(error => {
          state.exportLoading = false;
        });
    };
    const beforeGet = params => {
      const res = {
        ...params,
        areaId: params?.areaList?.length
          ? _.cloneDeep(params?.areaList).reverse()[0]
          : "",
      };
      delete res.areaList;
      return res;
    };
    const exportAll = data => {
      let download = [];
      data.selectedRowKeys.forEach(element => {
        data.dataSource.forEach((res, index) => {
          if (element == index) {
            download.push(res);
          }
        });
      });
      download.forEach(element => {
        proxy.$api
          .electricityDownloadExcel({
            period: `${moment(element.recordTime).format(
              "YYYY-MM-DD HH:mm:ss",
            )},${moment(element.recordTime).format("YYYY-MM-DD ")}23:59:59`,
            deviceId: element.deviceId,
          })
          .then(res => {
            state.exportLoading = false;
            const link = document.createElement("a");
            let blob = new Blob([res], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", "园区配电电统计.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      });
    };
    return {
      ...toRefs(state),
      exportAll,
      tablecolumns,
      visible,
      tableDate,
      handleOk,
      details,
      tableRef,
      beforeGet,
      exportSinger,
    };
  },
});
</script>

<style lang="less" scoped></style>
