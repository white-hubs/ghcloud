<template>
  <div>
    <div class="item-title">联动日志</div>
    <div class="table-box">
      <a-table
        :data-source="data"
        :columns="columns"
        :pagination="false"
        :bordered="true"
        size="small"
      ></a-table>
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
} from "vue";
import { actionResult } from "@/utils/enumerate";
import moment from "moment";
import { useRoute } from "vue-router";
export default defineComponent({
  props: {
    id: {
      type: String,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
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
          title: "执行时间",
          dataIndex: "executeTime",
          key: "executeTime",
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
          customRender: ({record}) => {
           
            return translateAttr(record.deviceId,record.propCode,record.propValue)
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
      getDeviceLinkageRecord();
    });
    const getDeviceLinkageRecord = async () => {
      const data = await proxy.$api.getIotDeviceProRecords({
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
    return {
      ...toRefs(state),
      businessKeyID,
      translateAttr
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-bordered.ant-table-empty .ant-table-placeholder) {
  border-bottom: 1px solid #f0f0f0;
}
</style>
