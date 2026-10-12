<template>
  <div class="alarmDetail-plan">
    <div class="plan-table">
      <div class="title">设备联动</div>
      <div class="table-container">
        <div class="table-header">
          <div>设备名称</div>
          <div>设备属性</div>
          <div>执行动作</div>
          <div>执行时机</div>
        </div>
        <div class="table-body">
          <div
            class="table-body-item"
            v-for="item in linkageData"
            :key="item.id"
          >
            <div>{{ item.deviceName }}</div>
            <div>{{ item.propName }}</div>
            <div>{{ translateAttr(item.deviceId,item.propCode,item.propValue) }}</div>
            <div>{{ item.executeMode == "AUTOMATIC" ? "自动" : "手动" }}</div>
            <!-- <div>
              <a-button type="link" @click="implement(item)">执行</a-button>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="plan-table">
      <div class="title">联动日志</div>
      <div class="table-container">
        <div class="table-header">
          <div>执行时间</div>
          <div>触发人员</div>
          <div>设备名称</div>
          <div>设备属性</div>
          <div>执行动作</div>
          <div>执行结果</div>
        </div>
        <div class="table-body">
          <div
            class="table-body-item"
            v-for="item in recordData"
            :key="item.id"
          >
            <div>{{ moment(item.executeTime).format("YYYY-MM-DD HH:mm:ss") }}</div>
            <div>{{ item.operatorName }}</div>
            <div>{{ item.deviceName }}</div>
            <div>{{ item.propName }}</div>
            <div>{{ translateAttr(item.deviceId,item.propCode,item.propValue) }}</div>
            <div :style="{color:item.executeStatus === 'SUCCESS'?'#1EC138':item.executeStatus === 'FAIL'?'#FF3D3D':'#FF9737'}">{{ actionResult[item.executeStatus] }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  computed
} from "vue";
import moment from "moment";
import { message } from "ant-design-vue";
import { getIotDeviceListByEventSn,getDeviceInfoSn,manualControlIotDeviceSn,getIotDeviceProRecordsSn } from "../../api/snMarket.ts";
export default defineComponent({
  props: {
    id: {
      type: [String, Number],
      default: null,
    },
    businessKey: {
      type: [String, Number],
      default: null,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const actionResult = {
ARRIVAL: "下发成功",
ISSUING: "下发中",
SUCCESS: "执行成功",
FAIL: "执行失败",
EXPIRED: "执行超时",
};
    const state = reactive({
      linkageData: [],
      recordData: [],
      deviceInfoList:[]
    });
    onMounted(() => {
      getDeviceLinkageRecord();
    });
    // 执行
    const implement = async (record) => {
      try {
        const data = await manualControlIotDeviceSn({
          eventIotDeviceId: record.id,
        });
        message.success("下发指令成功！");
      } catch (error) {
        message.destroy();
        error && message.error(error?.message || error);
      }
    };
    // 联动日志
    const getDeviceLinkageRecord = async () => {
      if (!props.businessKey) return;
      const data = await getIotDeviceProRecordsSn({
        eventId: props.businessKey,
      });
      if (data) {
        state.recordData = data;
        state.linkageData = data;
      }
    };

    const translateAttr=computed(()=>{
      return (deviceId,propCode,propValue)=>{
        const deviceInfo=state.deviceInfoList.find(e=>e.detail.id===deviceId)
        if(deviceInfo){
          const attributeKeyValueVos= deviceInfo.deviceAttributes.find(e=>e.attributeCode===propCode).attributeKeyValueVos ??[]
          return  attributeKeyValueVos.find(e=>e.value===propValue)?.keyName || propValue
        }
        return propValue
      }
    })

    return {
      ...toRefs(state),
      implement,
      actionResult: actionResult,
      moment:moment,
      translateAttr
    };
  },
});
</script>

<style lang="less" scoped>
.alarmDetail-plan {
  height: 100%;
  overflow: auto;
  font-size: 14px;
  .plan-table {
    .title {
      color: #ffffff;
      line-height: 40px;
    }
  }
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    font-family: "PingFang SC-中黑体, PingFang SC";
    background: #275386;
    height: 42px;
    > div {
      flex: 1;
      text-align: center;
    }
  }
  .table-body {
    &-item {
      height: 42px;
      border-bottom: solid 1px rgba(255, 255, 255, 0.2);
      color: #e4e4e4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      > div {
        text-align: center;
        flex: 1;
      }
    }
  }
}
</style>
