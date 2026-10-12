<template>
  <g-table
    ref="tableRef"
    :title="pageTitle"
    :api="api"
    :btns="btns"
    :search="search"
    :editMode="'page'"
    :columns="columns"
    tableCode="MAINTENANCE_TASK"
    :beforeGet="beforeGet"
    :scrollX="800"
    :rowSelection="false"
    searchCache="true"
    :extraSearchModel="extraSearchModel"
    @reset="handleReset"
  >
    <template v-slot:pre-item>
      <div class="mr1">
        <a-button @click="changeBtnStatus('all')" :type="extraSearchModel.btnStatus == 'all' ? 'primary' : 'default'">所有任务</a-button>
        <a-button @click="changeBtnStatus('BE_MAINTAINED')" :type="extraSearchModel.btnStatus == 'BE_MAINTAINED' ? 'primary' : 'default'"
          >待维保</a-button
        >
        <a-button @click="changeBtnStatus('COMPLETED')" :type="extraSearchModel.btnStatus == 'COMPLETED' ? 'primary' : 'default'"
          >已完成</a-button
        >
      </div>
      <a-form-item label="时间范围">
        <a-range-picker v-model:value="extraSearchModel.date" value-format="YYYY-MM-DD" />
      </a-form-item>
    </template>
  </g-table>
</template>
<script lang="jsx">
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

import { queryParameter, usePageName } from "@ghcloud/cube-utils";

export default defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const tableRef = ref();
    const route = useRoute();
    const state = reactive({
      api: {
        list: "maintenanceTask",
        path: "/maintenanceTaskDetails",
      },
      btns: ["detail"],
      search: [
        {
          label: "产品品类",
          value: "categoryCode",
          component: "g-cascader",
          url: "getDeviceProduct",
          field: { categoryName: "label", categoryCode: "value", children: "children" },
          placeholder: "请选择产品品类",
        },
        { label: "", value: "objectName", placeholder: "设备名称" },
      ],
      columns: [
        {
          dataIndex: "maintenanceTime",
          title: "发布时间",
          slots: {
            customRender: "maintenanceTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "maintenancePlanName",
          title: "维保计划名称",
          slots: {
            customRender: "maintenancePlanName",
          },
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
          dataIndex: "objectName",
          title: "设备名称",
          slots: {
            customRender: "objectName",
          },
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
          dataIndex: "categoryName",
          title: "产品品类",
          slots: {
            customRender: "categoryName",
          },
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
          dataIndex: "responsibilityPersonName",
          title: "责任人",
          slots: {
            customRender: "responsibilityPersonName",
          },
          ellipsis: true,
          customRender: ({ text, record }) => {
            if (record.responsibilityType === "per") {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {text ? text : "--"}
                </PopOver>
              );
            } else {
              return (
                <PopOver position="topLeft" content={text ? text : ""}>
                  {record?.responsibilityPositionName ? record?.responsibilityPositionName : "--"}
                </PopOver>
              );
            }
          },
        },
        {
          dataIndex: "maintenanceTaskStatus",
          title: "状态",
          slots: {
            customRender: "maintenanceTaskStatus",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text === "BE_MAINTAINED") {
              return <g-table-dot content="待维保" status="audit" />;
            } else if (text === "COMPLETED") {
              return <g-table-dot content="已完成" status="normal" />;
            } else if (text === "STOP") {
              return "--";
            }
          },
        },
        {
          dataIndex: "maintenanceFinishTime",
          title: "维保完成时间",
          slots: {
            customRender: "maintenanceFinishTime",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 80,
          customRender: ({ record }) => {
            return (
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  onClick={() => {
                    history.pushState(
                      { current: location.pathname + location.search },
                      "",
                      `/portal/maintenance/maintenanceTaskDetails?type=detail&id=${record.id}`,
                    );
                  }}
                >
                  详情
                </a-button>
                {record.maintenanceTaskStatus === "BE_MAINTAINED" && (
                  <a-button
                    type="link"
                    size="small"
                    onClick={() => {
                      history.pushState(
                        { current: location.pathname + location.search },
                        "",
                        `/portal/maintenance/maintenance-execute?id=${record.id}`,
                      );
                    }}
                  >
                    维保
                  </a-button>
                )}
              </a-space>
            );
          },
        },
      ],
    });

    const normalizeDateRange = (value) => {
      if (!value) return null;
      const list = Array.isArray(value) ? value : `${value}`.split(",");
      const dates = list
        .filter(Boolean)
        .map((item) => {
          const text = `${item}`;
          return text.length > 10 ? text.slice(0, 10) : text;
        })
        .filter(Boolean);
      return dates.length === 2 ? dates : null;
    };

    const cachedQuery = queryParameter.getQuery() || {};
    const extraSearchModel = reactive({
      btnStatus: cachedQuery.btnStatus || "all",
      date: normalizeDateRange(cachedQuery.date || cachedQuery.period),
    });

    const beforeGet = (params) => {
      if (Array.isArray(params.categoryCode)) params.categoryCode = params.categoryCode[params.categoryCode.length - 1];
      const result = {
        ...params,
        maintenanceTaskStatus: extraSearchModel.btnStatus === "all" ? "" : extraSearchModel.btnStatus,
      };
      const dateRange = normalizeDateRange(extraSearchModel.date);
      if (dateRange) {
        result.period = `${dateRange[0]} 00:00:00,${dateRange[1]} 23:59:59`;
      }
      return result;
    };

    const handleReset = () => {
      extraSearchModel.date = null;
    };

    watch(
      () => extraSearchModel.date,
      (val) => {
        const dateRange = normalizeDateRange(val);
        if (dateRange && (!Array.isArray(val) || val[0] !== dateRange[0] || val[1] !== dateRange[1])) {
          extraSearchModel.date = dateRange;
        }
      },
    );

    watch(
      () => tableRef.value,
      (val) => {
        if (!val) return;
        const { deviceName, type } = route.query;
        if (deviceName) {
          val.form.objectName = deviceName;
        }
        if (type) {
          extraSearchModel.btnStatus = type;
        }
        // 只有存在跨页跳转参数时才主动触发一次查询，避免与 g-table 自身的 URL 回填重复请求
        if (deviceName || type) {
          val.searchRecord();
        }
      },
    );
    const changeBtnStatus = (type) => {
      extraSearchModel.btnStatus = type;
      tableRef.value.searchRecord();
    };

    return {
      tableRef,
      ...toRefs(state),
      extraSearchModel,
      changeBtnStatus,
      beforeGet,
      handleReset,
      pageTitle,
    };
  },
});
</script>
