<template>
  <div>
    <div class="item-title">联动日志</div>
    <div class="table-box">
      <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small"></a-table>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
  watch
} from "vue";
import { actionResult } from "@/utils/enumerate";
import moment from "moment";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    id: {
      type: String,
    },
    execute: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ['update:execute'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const businessKey = ref("");
    watch(() => props.execute, async (newValue, oldValue) => {
      if (newValue) {
        await getDeviceLinkageRecord()
        emit('update:execute', false)
      }
    })
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
          title: "执行时间",
          dataIndex: "executeTime",
          key: "executeTime",
          slots: {
            customRender: "executeTime",
          },
          customRender: ({ text, record }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          },
        },
        {
          title: "触发人",
          dataIndex: "operatorName",
          key: "operatorName",
        },
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
          title: "执行结果",
          dataIndex: "executeStatus",
          key: "executeStatus",
          slots: {
            customRender: "executeStatus",
          },
          customRender: ({ text }) => {
            const data = actionResult.find(item => item.value === text);
            if (data) {
              return data.label;
            } else {
              return "--";
            }
          },
        },
      ],
    });
    onMounted(() => {
      getDeviceLinkageRecord();
    });
    const getDeviceLinkageRecord = async () => {
      const data = await proxy.$api.getIotDeviceProRecords({
        eventId: businessKey.value,
      });
      if (data) {
        state.data = data;
      }
    };
    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
