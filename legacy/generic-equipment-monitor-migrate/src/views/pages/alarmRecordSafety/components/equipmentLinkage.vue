<template>
  <div>
    <div class="item-title">设备联动</div>
    <div class="table-box">
      <a-table
        :data-source="data"
        :columns="headquarters?columns.slice(0,columns.length-1):columns"
        :pagination="false"
        :bordered="true"
        size="small"
      >
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
    headquarters:{
      type:Boolean,
      default:false
    }
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    // const {businessKey} = route.query;
    const businessKeyID = ref("");

    if (route.query.businessKey !== undefined) {
      businessKeyID.value = route.query.businessKey
        ? route.query.businessKey
        : route.query.id;
    } else {
      businessKeyID.value = props.id;
    }
    const state = reactive({
      data: [],
      deviceInfoList:[],
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
          customRender: ({record}) => {
           
            return translateAttr(record.deviceId,record.propCode,record.propValue)
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
    const translateAttr = (deviceId, propCode, propValue) => {
      const deviceInfo = state.deviceInfoList.find((e) => e.detail.id === deviceId);
      if (deviceInfo) {
        const attributeKeyValueVos =
          deviceInfo.deviceAttributes.find((e) => e.attributeCode === propCode)
            .attributeKeyValueVos ?? [];

        return (
          attributeKeyValueVos.find((e) => e.value === propValue)?.keyName || propValue
        );
      }
      return propValue;
    };
    onMounted(() => {
      getDeviceLinkageList();
    });
    const getDeviceLinkageList = async () => {
      const data = await proxy.$api.getIotDeviceListByEvent({
        eventId: businessKeyID.value,
      });
      if (data) {
        state.data = data;
        data.forEach((e) => {
        
        proxy.$api.getDeviceInfo({ deviceId: e.deviceId }).then((res) => {
          state.deviceInfoList.push(res);
        });
      });
      }
    };
    const implement = async record => {
      const data = await proxy.$api.manualControlIotDevice({
        eventIotDeviceId: record.id,
      });
      if (data) {
        proxy.$message.success("下发指令成功！");
      }
    };
    return {
      ...toRefs(state),
      translateAttr,
      implement,
      businessKeyID,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
