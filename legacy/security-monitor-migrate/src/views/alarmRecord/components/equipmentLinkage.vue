<template>
  <div>
    <div class="item-title">设备联动</div>
    <div class="table-box">
      <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small">
        <template #action="{ record }">
          <a-button type="link" @click="implement(record)">执行</a-button>
        </template>
      </a-table>
    </div>
  </div>
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
  emits: ['update:isExecute'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    // const {businessKey} = route.query;
    const businessKey = ref("");
    if (route.query.businessKey !== undefined) {
      businessKey.value = route.query.businessKey
        ? route.query.businessKey
        : route.query.id;
    } else {
      businessKey.value = props.id;
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
        eventId: businessKey.value,
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
    return {
      ...toRefs(state),
      implement,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
