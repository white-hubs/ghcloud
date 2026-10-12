<template>
  <div class="item-title">联动日志</div>
  <a-table :data-source="data" :columns="columns" :pagination="false" :bordered="true" size="small"></a-table>
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
    refresh: {
      type: Number,
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
    const businessKeyID = ref("");
    watch(() => props.execute, async (newValue, oldValue) => {
      if (newValue) {
        await getDeviceLinkageRecord()
        emit('update:execute', false)
      }
    })
    watch(() => props.refresh, async (newValue, oldValue) => {
      if (newValue) {
        getDeviceLinkageRecord();
      }
    })
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
          title: "执行时间",
          dataIndex: "executeTime",
          key: "executeTime",
          width: '200px',
          slots: {
            customRender: "executeTime",
          },
          customRender: ({ text, record }) => {
            return text ? moment(text).format("YYYY-MM-DD HH:mm:SS") : "--";
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
        eventId: businessKeyID.value,
      });
      if (data) {
        state.data = data;
      }
    };
    return {
      ...toRefs(state),
      businessKeyID,
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
}
:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
