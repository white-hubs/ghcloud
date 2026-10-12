<template>
  <div>
    <div class="header-name">
      <div class="item-title">基本信息</div>
    </div>
    <div class="fireControlMsg">
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备名称：</div>
        <div class="fireControlMsg-item-right">{{ deviceData.name }}</div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备型号：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.modelName }}
        </div>
      </div>

      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备品牌：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.brandName }}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备状态：</div>
        <div class="fireControlMsg-item-right">
          <span
            v-if="deviceData.deviceStatus == 'NORMAL'"
            style="color: #5ccd4d"
          >
            正常
          </span>
          <span
            v-if="deviceData.deviceStatus == 'OFFLINE'"
            style="color: #fba33f"
          >
            离线
          </span>
          <span
            v-if="deviceData.deviceStatus == 'ALARM'"
            style="color: #ff4070"
          >
            报警
          </span>
          <span
            v-if="deviceData.deviceStatus == 'TROUBLE'"
            style="color: #fba33f"
          >
            故障
          </span>
          <span
            v-if="
              deviceData.deviceStatus == '' || deviceData.deviceStatus == null
            "
            style="color: #fba33f"
          >
            暂无状态
          </span>
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">所属区域：</div>
        <div class="fireControlMsg-item-right">
          {{ deviceData.areaName }}
        </div>
      </div>
      <div class="fireControlMsg-item">
        <div class="fireControlMsg-item-left">设备图片：</div>
        <div class="fireControlMsg-item-right bg">
          <a-image
            v-if="deviceData.images.length > 0"
            :width="80"
            :height="80"
            :src="deviceData.images[0].path"
          ></a-image>
          <a-image
            v-else
            :width="80"
            :height="80"
            :src="xfUrl"
          ></a-image>
        </div>
      </div>
    </div>
    <div class="item-title">现场数据</div>
    <div class="fireControlMsg">
      <div
        class="fireControlMsg-item"
        v-for="(item, index) in readData"
        :key="index"
      >
        <div class="fireControlMsg-item-left">{{ item.attributeName }}</div>
        <div class="fireControlMsg-item-right">{{ "--" }}</div>
      </div>
    </div>

    <div class="item-title" v-if="basicData.length > 0">设备控制</div>
    <div class="fireControlMsg-control">
      <deviceControlPanelVue
        :BOOLEANData="BOOLEANData"
        :ENUMData="ENUMData"
        :FLOATData="FLOATData"
      ></deviceControlPanelVue>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import deviceControlPanelVue from "./deviceControlPanel.vue";
export default defineComponent({
  name: "",
  components: { deviceControlPanelVue },
  props: {
    deviceId: {
      type: String,
      defalut: "",
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      basicData: [],
      readData: [],
      BOOLEANData: [],
      ENUMData: [],
      FLOATData: [],
      deviceData: {
        images: [],
      },
      deviceAttributes: {},
    });
    const { proxy } = getCurrentInstance();
    const data = ref();
    // 处理只读的现场数据
    // 基础信息
    const getBasicData = async () => {
      const data = await proxy.$api.getDeviceInfo({
        deviceId: props.deviceId,
      });
      if (data) {
        state.deviceData = data.detail;
        state.deviceAttributes = data.deviceAttributes;
        state.basicData = data.deviceAttributes ? data.deviceAttributes : [];
        // 现场只读
        state.readData = state.basicData.filter(item => {
          return item.permission == "READ";
        });

        // 三种通用类型  物联配置数据暂时没有限制规则，先弄三个判断面板
        state.BOOLEANData = [];
        state.basicData.forEach(item => {
          if (item.dataType == "BOOLEAN" && item.permission != "READ") {
            state.BOOLEANData.push(item);
          }
        });
        state.ENUMData = [];
        state.basicData.forEach(item => {
          if (item.dataType == "ENUM" && item.permission != "READ") {
            state.ENUMData.push(item);
          }
        });
        state.FLOATData = [];
        state.basicData.forEach(item => {
          if ((item.valueMax || item.valueMin) && item.permission != "READ") {
            state.FLOATData.push(item);
          }
        });
      }
    };

    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
      setTimeout(() => {
        getBasicData();
      }, 50);
    });
    const PM = '/resource/v1/powermonitor-migrate'
    const xfUrl = `${PM}/xf.png`
    return {
      ...toRefs(state),
      getBasicData,
      xfUrl,
    };
  },
});
</script>
<style scoped lang="less">
.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;
  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;
    .fireControlMsg-item-left {
      font-weight: 400;
    }
    .fireControlMsg-item-right {
      margin-left: 10px;
    }
  }
  .bg {
    width: 82px;
    height: 82px;
    background: #f8f8f8;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #f2f2f2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.item-title {
  width: 100%;
  height: 35px;
  line-height: 35px;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-top: 1px solid #e8e8e88c;
  padding-top: 5px;
  &:first-child {
    border: none;
  }
}
.fireControlMsg-control {
  overflow-y: auto;
}
</style>
