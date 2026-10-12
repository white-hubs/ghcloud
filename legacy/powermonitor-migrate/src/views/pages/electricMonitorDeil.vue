<template>
  <div class="fireControlLookPageDeil">
    <g-layout title="设备信息">
      <template #content-table>
        <a-tabs v-model:activeKey="activeKey" @change="changeTab">
          <a-tab-pane key="1" tab="设备信息">
            <div class="tab-pane-content">
              <deviceBasicData
                ref="deviceBasicData"
                :deviceId="deviceId"
              ></deviceBasicData>
            </div>
          </a-tab-pane>

          <a-tab-pane key="3" tab="历史数据">
            <div class="tab-pane-content">
              <historyData :deviceId="deviceId"></historyData>
            </div>
          </a-tab-pane>
          <a-tab-pane key="4" tab="关联监控">
            <div
              class="tab-pane-content gvideo-box"
              v-if="deviceDataVideos.length > 0"
            >
              <div v-for="(item, index) in deviceDataVideos" :key="index">
                <div>
                  <span class="gvideo-title">{{ item.name }}</span>
                  <g-video class="gvideo" :token="item.token"></g-video>
                </div>
              </div>
            </div>
            <div v-else>
              <a-empty />
            </div>
          </a-tab-pane>
        </a-tabs>
      </template>

      <template #footer-page>
        <div class="buttom-btn" style="text-align: right">
          <a-button @click="goBack">返回</a-button>
        </div>
      </template>
    </g-layout>
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
  nextTick,
} from "vue";

import { useRoute, useRouter } from "vue-router";
import historyData from "./components/historyData.vue";
import deviceBasicData from "./components/deviceBasicData.vue";

export default defineComponent({
  name: "",
  components: { historyData, deviceBasicData },
  setup() {
    const state = reactive({
      title: "监测详情",
      deviceData: {
        images: [],
      },
      deviceAttributes: {},
      deviceDataVideos: [
        {
          name: "南半区监控",
          token: "TFXGNVR--39",
        },
        {
          name: "北半区监控",

          token: "TFXGNVR--33",
        },
        {
          name: "南半区监控",

          token: "TFXGNVR--33",
        },
      ],
    });
    const { proxy } = getCurrentInstance();

    const route = useRoute();
    const router = useRouter();
    const deviceId = route.query.deviceId;
    const deviceBasicData = ref();
    const activeKey = ref("1");

    const changeTab = () => {
      // deviceBasicData.value.getReadData();
    };

    // 监控
    const getBasicVideosData = async () => {
      const data = await proxy.$api.getDeviceVideosInfo({
        deviceInstanceId: deviceId,
      });
      if (data) {
        state.deviceDataVideos = data;
      }
    };
    const goBack = () => {
      history.go(-1)
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted

      getBasicVideosData();
    });
    return {
      ...toRefs(state),
      activeKey,
      changeTab,

      deviceId,
      getBasicVideosData,
      goBack,
      deviceBasicData,
    };
  },
});
</script>
<style scoped lang="less">
.fireControlLookPageDeil {
  padding: 20px 10px;
  position: relative;
  height: 100%;
  .buttom-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
}
.gvideo-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  .gvideo {
    margin-bottom: 10px;
    margin-right: 10px;
    width: 504px;
    height: 304px;
  }
  .gvideo-title {
    font-size: 16px;
    color: #3d3d3d;
  }
}
</style>
