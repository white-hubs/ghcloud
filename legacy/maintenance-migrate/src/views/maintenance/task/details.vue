<template>
  <g-layout title="维保任务详情">
    <template #content-table>
      <g-maintenance-task-details-form :api="api" :formList="formList">
        <template v-slot:maintenanceProgetRecordVos="{ record }">
          <div v-if="['BE_MAINTAINED', 'STOP'].includes(record.maintenanceTaskStatus)">
            --
          </div>
          <a-table v-else :dataSource="record.maintenanceProgetRecordVos" :columns="columns" :pagination="false"
            :size="'small'" :rowKey="'id'" />

        </template>
      </g-maintenance-task-details-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
    </template>
  </g-layout>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import gMaintenanceTaskDetailsForm from "../../../components/Common/gMaintenanceTaskDetailsForm.vue";
export default defineComponent({
  components: { gMaintenanceTaskDetailsForm },
  setup() {
    const router = useRouter();
    const state = reactive({
      api: {
        detail: "maintenanceTaskId",
      },
      formList: [
        {
          title: "基本信息",
          form: [
            { label: "任务编号", value: "code" },
            {
              label: "发布时间",
              value: "maintenanceTime",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            { label: "维保计划名称", value: "maintenancePlanName" },
            { label: "设备名称", value: "objectName" },
            { label: "产品品类", value: "categoryName" },
            {
              label: "责任人",
              value: "responsibilityType",
              detailFun: (value, form) => {
                if (form.responsibilityType === "per") {
                  return form.responsibilityPersonName
                    ? form.responsibilityPersonName
                    : "--";
                } else {
                  if (form.responsibilityPositionName) {
                    return form.responsibilityPositionName
                  } 
                }
              },
            },
            {
              label: "任务状态",
              value: "maintenanceTaskStatus",
              detailFun: (value) => {
                if (value === "BE_MAINTAINED") {
                  return "待维保";
                } else if (value === "COMPLETED") {
                  return "已完成";
                } else if (value === "STOP") {
                  return "--";
                }
              },
            },
          ],
        },
        {
          title: "维保记录",
          form: [
            { label: "维保人员", value: "maintenanceTaskPerson" },
            {
              label: "维保完成时间",
              value: "maintenanceFinishTime",
              detailFun: (value) => {
                return value ? timeFormat(value, true) : "--";
              },
            },
            { label: "描述信息", value: "taskRemark", singleLine: true },
            {
              label: "现场图片",
              value: "fileVOS",
              component: "a-upload",
              singleLine: true,
              detailValue: "fileVOS",
            },
            {
              label: "维保结果",
              value: "maintenanceProgetRecordVos",
              slot: true,
              singleLine: true,
            },
          ],
        },
      ],
      columns: [
        {
          dataIndex: "maintrenaceProject",
          title: "维保项",
          slots: {
            customRender: "maintrenaceProject",
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
          dataIndex: "record",
          title: "维保记录",
          slots: {
            customRender: "record",
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
          dataIndex: "maintenanceDescribe",
          title: "维保说明",
          slots: {
            customRender: "maintenanceDescribe",
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
      ],
    });

    const goBack = () => {
      history.go(-1);
    };

    return {
      ...toRefs(state),
      goBack,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
