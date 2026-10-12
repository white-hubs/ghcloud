<template>
  <div class="preview-panel">
    <div class="preview-panel-title">
      <div class="device-name-area">
        <div class="device-name">
          <div class="name">{{ itemProp.deviceName }}</div>
          <a-tag :color="itemProp.deviceStatus?'green':'red'">{{ itemProp.deviceStatus?"在线":"离线" }}</a-tag>
        </div>
        <div class="device-area">区域: {{ itemProp.areaName || '--' }}</div>
      </div>
      <div class="device-collect-more">
        <a-image @click="handleCollection" v-if="itemProp.collection" :width="20" :height="20" :preview="false"
          :src="collectImg.collect"></a-image>
        <a-image v-else :width="20" :height="20" :preview="false" :src="collectImg.unCollect"
          @click="handleCollection"></a-image>
        <div @click="handleInfo">更多></div>
      </div>
    </div>
    <div class="preview-panel-content">
      <a-image width="80px" height="80px" v-if="itemProp.picture&&itemProp.picture.path" :src="itemProp.picture.path"></a-image>
      <a-image :width="80" :height="80" v-else :src="devicePng"></a-image>
      <div class="config-content">
        <a-row>
          <a-col :span="12" v-for="item in customPanelConfig.slice(0,2)" :key="item.propCode">
            <div :class="['custom-item']">
              <a-popover :content="item.propName">
                <span class="label">{{ item.propName }}</span>
              </a-popover>
              <span>：</span>
              <a-popover :content="itemPropValueJson[item.propCode]">
                <span class="value">{{itemPropValueJson[item.propCode]||'--' }}</span>
              </a-popover>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12" v-for="item in customPanelConfig.slice(2)" :key="item.propCode">
            <div :class="['custom-item']">
              <a-popover :content="item.propName">
                <span class="label">{{ item.propName }}</span>
              </a-popover>
              <span>：</span>
              <a-popover :content="itemPropValueJson[item.propCode]">
                <span class="value">{{itemPropValueJson[item.propCode] }}</span>
              </a-popover>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const collect = `${GEM}/sz1.png`
const unCollect = `${GEM}/sz2.png`
const devicePng = `${GEM}/device.png`
export default defineComponent({
  name: "",
  components: {},
  props: {
    panelsConfig: {
      type: Array,
      default: () => []
    },
    itemProp: {
      type: Object,
      default: () => { }
    }
  },
  emits: ['getList'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    const customPanelConfig = computed(() => {
      const customConfig = props.panelsConfig.find(item => item.businessKey === props.itemProp.deviceProdId)
      if (!customConfig) return []
      return JSON.parse(customConfig.panelConfig)
    })
    const itemPropValueJson = computed(() => {
      let propJson = {}
      for (const item of props.itemProp.devicePropWithTsDTOS) {
        const value = item.translatedValue || ' '
        propJson[item.key] = value !== ' ' ? value + item.unitName : ""
      }
      return propJson
    })
    const applicationCode = computed(() => {
      return JSON.parse(sessionStorage.getItem("GH-currentApplication")).code
    })
    const handleCollection = async () => {
      await proxy.$api.addDeviceCollection({
        applicationCode: applicationCode.value,
        deviceId: props.itemProp.deviceId,
      });
      proxy.$message.success('操作成功')
      emit('getList')
    }
    const handleInfo = () => {
      history.pushState({}, '', `/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=${props.itemProp.deviceId}`)
    }
    return {
      handleInfo,
      customPanelConfig,
      itemPropValueJson,
      handleCollection,
      collectImg: {
        collect,
        unCollect,
      },
      devicePng
    };
  },
});
</script>
<style scoped lang="less">
.preview-panel {
  width: 380px;

  .preview-panel-title {
    background: #F5F7FA;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 14px;

    .device-name-area {
      .device-name {
        display: flex;
        align-items: center;
        gap: 6px;

        .name {
          font-size: 16px;
          font-family: Source Han Sans, Source Han Sans;
          font-weight: 500;
          color: #1D2129;
        }

        .false {
          color: #fba33f !important;
        }

        .true {
          color: #5ccd4d !important;
        }

        .status {
          padding: 3px 8px;
          font-size: 12px;
          background: rgba(92, 205, 77, 0.2);
          border-radius: 3px 3px 3px 3px;
          font-family: Source Han Sans, Source Han Sans;
          font-weight: 400;
        }

      }

      .device-area {
        font-size: 12px;
        margin-top: 5px;
        font-family: Source Han Sans, Source Han Sans;
        font-weight: 400;
        color: #86909C;
      }
    }

    .device-collect-more {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      cursor: pointer;
      font-size: 12px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 400;
      color: #1890FF;
    }


  }

  .preview-panel-content {
    padding: 20px 12px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.04);
    opacity: 1;
    border: 1px solid #E5E8EF;

    .config-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: calc(100% - 100px);

      .has-line::after {
        content: '';
        display: block;
        width: 0px;
        border-left: 1px dashed #D8D8D8;
        height: 90%;
        right: 12px;
        position: absolute;


      }

      .has-line {
        .value {
          max-width: 40px !important;
        }
      }

      .custom-item {
        display: flex;
        align-items: center;
        position: relative;

        .label {
          font-size: 14px;
          max-width: 80px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: Source Han Sans, Source Han Sans;
          font-weight: 800;
          color: #000;
        }

        .value {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: DIN, DIN;
          font-weight: 800;
          color: #000;
        }
      }


    }

  }

}
</style>
