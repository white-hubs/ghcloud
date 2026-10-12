<template>
  <div class="item-title">
    <span>设备联动</span>
    <a-button type="primary" :loading="loading" @click="oneKeyLinkage">一键执行</a-button>
  </div>
  <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small">
    <template #action="{ record }">
      <a-button type="link" @click="implement(record)">执行</a-button>
    </template>
  </a-table>
</template>
<script lang="jsx">
import { cubeLinkageService } from "@/api/service";
import { message } from "ant-design-vue";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    id: {
      type: String,
    },
    isExecute: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ['update:isExecute', 'change'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const businessKeyID = ref("");
    const loading = ref(false)

    if (route.query.businessKey !== undefined) {
      businessKeyID.value = route.query.businessKey
        ? route.query.businessKey
        : route.query.id;
    } else {
      businessKeyID.value = props.id;
    }
    const state = reactive({
      data: [],
      deviceInfoList: [],
      columns: [
        {
          title: "设备名称",
          dataIndex: "deviceName",
          key: "deviceName",
        },
        {
          title: "设备属性",
          dataIndex: "propName",
          key: "propName",
        },
        {
          title: "执行动作",
          dataIndex: "propValue",
          key: "propValue",
          customRender: ({ record }) => {
            return record.translatedValue || '--'
          },
        },
        {
          title: "执行时机",
          dataIndex: "executeMode",
          key: "executeMode",
          slots: {
            customRender: "executeMode",
          },
          customRender: ({ text }) => {
            return text === "AUTOMATIC" ? "自动" : "手动";
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
        },
      ],
    });
    onMounted(() => {
      getDeviceLinkageList();
    });
    const getDeviceLinkageList = async () => {
      const data = await proxy.$api.getIotDeviceListByEvent({
        eventId: businessKeyID.value,
      });
      if (data) {
        state.data = data;
      }
    };
    const implement = async record => {
      const data = await proxy.$api.manualControlIotDevice({
        eventIotDeviceId: record.id,
      });
      if (data) {
        emit('update:isExecute', true)
        proxy.$message.success("下发指令成功！");
      }
    };
    /** 一键联动 */
    const oneKeyLinkage = async () => { 
      try {
        loading.value = true
        await cubeLinkageService.oneKeyExecuteOrder(businessKeyID.value)
        message.success("执行成功")
        emit('change')
      } catch (error) {
        message.error("执行失败")
      }finally{
        loading.value = false
      }
    };
    return {
      ...toRefs(state),
      implement,
      businessKeyID,
      loading,
      oneKeyLinkage
    };
  },
});
</script>

<style lang="less" scoped>
.item-title {
  width: 100%;
  height: auto !important;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000D9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 16px !important;
  font-family: PingFang SC-Medium;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
