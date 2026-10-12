<template>
  <g-layout title="巡逻路线详情">
    <template #content-table>
      <a-row :gutter="[16, 16]">
        <a-col :span="10">
          <span>路线名称：{{ detail.name }}</span>
        </a-col>
        <a-col :span="10" :offset="2">
          <span>建议巡逻时间：{{ detail.patrolProposalTime }}</span>
        </a-col>
        <a-col :span="24">
          <span
            >巡逻人员：

            <span v-for="item in detail.patrolPerson" :key="item.id">
              {{
                item.authType == "DEPARTMENT"
                  ? "部门:"
                  : item.authType == "ROLE"
                  ? "角色:"
                  : "用户:"
              }}
              <a-tag v-for="(data, index) in item.authConfig" :key="index">{{
                item.authType == "DEPARTMENT"
                  ? data["departmentName"]
                  : item.authType == "ROLE"
                  ? data["roleName"]
                  : data["userName"]
              }}</a-tag>
            </span>
          </span>
        </a-col>
        <a-col :span="24">
          <span>视频巡逻点：</span>
          <a-table
            class="tableData"
            :pagination="false"
            :columns="dataColumns"
            :data-source="detail.cameraPatrolDeviceVOS"
            bordered
            size="small"
          ></a-table>
        </a-col>
      </a-row>
    </template>
    <template #footer-btn>
      <a-button @click="back">返回</a-button>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs } from "vue";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { id } = route.query;
    const { proxy } = getCurrentInstance();
    const state = reactive({
      detail: {
        name: "猪肉交易区大厅",
        time: "早上9点",
        person: "产品管理部门，产品经理",
        cameraPatrolDeviceVOS: [],
      },
      dataColumns: [
        {
          dataIndex: "sort",
          title: "巡逻序号",
          slots: {
            customRender: "areaNames",
          },
          customRender: ({ text, index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "areaNames",
          title: "所属区域",
          slots: {
            customRender: "areaNames",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
      ],
    });
    onMounted(() => {
      getPatrolLineDetail();
    });
    const getPatrolLineDetail = async () => {
      const data = await proxy.$api.patrolLineId({ id: id }, "get");
      if (data) {
        state.detail = data;
        state.detail.patrolPerson = state.detail.cameraPatrolPersonVOS;
        // state.detail.patrolPerson = state.detail.patrolPerson.join("，")
      }
    };
    const back = () => {
      router.back();
    };
    return {
      ...toRefs(state),
      back,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.footer-btn) {
  width: 100%;
  text-align: right;
}
.tableData {
  margin: 16px 84px;
}
</style>
