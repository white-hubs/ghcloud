<template>
  <div class="preview-container">
    <div class="preview-panel">
      <div class="preview-panel-title">
        <div class="device-name-area">
          <div class="device-name">
            <div class="name">xxx探测器</div>
            <div class="status">在线</div>
          </div>
          <div class="device-area">区域: xxxxx</div>
        </div>
        <div class="device-collect-more">
          <a-image :width="20" :height="20" :preview="false" :src="collectImg.collect"></a-image>
          <div>更多></div>
        </div>
      </div>
      <div class="preview-panel-content">
        <a-image :width="112" :height="112"
          src="https://minio-test.guhecloud.com:30000/guhecloud-prod-mdata/1643862841800863746.jpeg"></a-image>
        <div class="config-content">
          <a-row>
            <a-col :span="12" v-for="(item,index) in selectedDeviceModelAttr.slice(0,2)" :key="item.propCode">
              <div :class="['custom-item',(index===0&&selectedDeviceModelAttr.length>1)&&'has-line']">
                <a-popover :content="item.propName">
                  <span class="label">{{item.propName}}</span>
                </a-popover>
                <span>：</span>
                <span class="value">xxxx</span>
              </div>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12" v-for="(item,index) in selectedDeviceModelAttr.slice(2)" :key="item.propCode">
              <div :class="['custom-item',(index===0&&selectedDeviceModelAttr.length>3)&&'has-line']">
                <a-popover :content="item.propName">
                  <span class="label">{{item.propName}}</span>
                </a-popover>
                <span>：</span>
                <span class="value">xxxxxxxxxx</span>
              </div>

            </a-col>
          </a-row>
        </div>
      </div>
    </div>
    <a-button type="primary" style="margin-top: auto;" @click="handleSave">保存</a-button>
  </div>
</template>


<script lang="jsx">
import { defineComponent, reactive, toRefs, watch, getCurrentInstance, computed } from "vue";
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const collect = `${GEM}/sz1.png`
const unCollect = `${GEM}/sz2.png`
import { useStore } from "vuex";
import { usePanelConfigAttr } from '@/hooks/device-panel'
export default defineComponent({
  name: 'Preview',
  emits: ['updateConfig'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore()
    const state = reactive()
    const application = computed(() => {
      return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
    });
    const { selectedDeviceModelAttr, activeModelTypeId } = usePanelConfigAttr()
    const handleSave = async () => {
      const params = {
        businessKey: activeModelTypeId.value,
        sceneType: 'LIST_PANEL',
        panelConfig: JSON.stringify(selectedDeviceModelAttr.value),
        applicationCode: application.value.code
      }
      await proxy.$api.saveDevicePanelConfig(params)
      proxy.$message.success('保存成功')
      emit('updateConfig')
    }
    return {
      ...toRefs(state),
      selectedDeviceModelAttr,
      handleSave,
      collectImg: {
        collect,
        unCollect
      }
    };
  },
});
</script>
<style scoped lang='less'>
.preview-container {
  height: 100%;
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .preview-panel {
    width: 418px;
    margin-top: auto;

    .preview-panel-title {
      background: #F5F7FA;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 16px 16px 20px;

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

          .status {
            padding: 3px 8px;
            font-size: 12px;
            background: rgba(92, 205, 77, 0.2);
            border-radius: 3px 3px 3px 3px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 400;
            color: #5CCD4D
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
        // justify-content: flex-st;
        align-items: flex-end;
        font-size: 12px;
        font-family: Source Han Sans, Source Han Sans;
        font-weight: 400;
        color: #1890FF;
      }


    }

    .preview-panel-content {
      padding: 20px 16px;
      background: #fff;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.04);
      opacity: 1;
      border: 1px solid #E5E8EF;

      .config-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;

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
            font-size: 12px;
            max-width: 60px;
            flex-shrink: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 400;
            color: #86909C;
          }

          .value {
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: DIN, DIN;
            font-weight: 700;
            color: #4E5969;
          }
        }


      }

    }

  }
}
</style>