<template lang="pug">
  div.event-detail
    AlarmVoiceTest(:canAutoPlay.sync="canAutoPlay" ref="alarmVoiceTest")
    h4.bold 设备定位
      a-radio-group.ml2(v-model="locationMode" button-style="solid" @change="handleLocationModeChange")
        //- a-radio-button(value="2D") 
          span.px2 平面
        a-radio-button(value="Video") 
          span.px2 实时视频
        a-radio-button(value="3D") 
          span.px2 三维模型
    //- div.divice_location(v-show="locationMode === '2D'")
      img.fake_location(:src="fakeLocation")
    //- TODO: 这里还要加设备类型的判断
    div.divice_location(v-show="locationMode === 'Video'")
      div.nearby_cams(v-if="host && device && ['com_camera'].includes(device.typeCode)" )
        div.nearby_cam
          PlayMonitor(:host="host" :token="device.token" :showControl="false")
        div.cant_autoplay_mask(v-if="!canAutoPlay")
          a-button(type="primary" @click="$refs.alarmVoiceTest.reTest()") 
            span 播放实时视频
            a-icon(type="play-circle")
      div.nearby_cams(v-else-if="host && device && device.nearbyCamDTOS" )
        div.nearby_cam(v-for="cam in device.nearbyCamDTOS" :key="cam.id")
          PlayMonitor(:host="host" :token="cam.token" :showControl="false")
        div.cant_autoplay_mask(v-if="!canAutoPlay")
          a-button(type="primary" @click="$refs.alarmVoiceTest.reTest()") 
            span 播放实时视频
            a-icon(type="play-circle")
      div.abs-fit.flex.align-center.justify-center(v-else-if="!device")
        a-spin
      div.abs-fit.flex.align-center.justify-center(v-else-if="!loading")
        a-empty(description="设备附近未配置摄像头")


    div.divice_location(v-if="locationMode === '3D' || showMarkerFlag" :style="{visibility: locationMode === '3D' ? 'visible' : 'hidden' }")
      BimLoader(ref="bim" hideTools)
      div.abs-fit.flex.align-center.justify-center(v-if="elementLoading || modelFileLoading")
        a-spin
      div.abs-fit.flex.align-center.justify-center(v-else-if="device && (!element || !modelFile)")
        a-empty(description="设备没有关联模型")
      
    div.marker-box(v-if="element" ref="marker")
      div.element-info.p1.px2(v-show="showMarkerFlag")
        div.element-info-item
          span.p1.element-item-label 设备名称:
          span.p1.element-item-value {{device.name}}
        div.element-info-item
          span.p1.element-item-label 所属区域:
          span.p1.element-item-value {{device.areaNames ? device.areaNames.join('/') : '--'}}
        div.element-info-item
          span.p1.element-item-label 安装地址:
          span.p1.element-item-value {{device.installAddress || '--'}}
        //- div.element-info-item
          span.p1.element-item-label 绑定模型:
          span.p1.element-item-value(v-if="modelFile") {{modelFile.name}}
        div.element-info-item
          span.p1.element-item-label 绑定构件:
          //- span.p1.element-item-value {{element.name}}
          span.p1.element-item-value {{element.elementCode}}
        //- div.element-info-item
          span.p1.element-item-label 构件编号:
          span.p1.element-item-value {{element.elementCode}}
</template>

<script>
import BimLoader from '@/components/common/Bim/BimLoader';
import PlayMonitor from '@/components/PlayH5S/PlayMonitor';
// 探测是否可以自动播放
import AlarmVoiceTest from '../../AlarmVoice/test';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    BimLoader,
    PlayMonitor,
    AlarmVoiceTest,
  },
  props: {
    eventData: Object,
  },
  data() {
    return {
      canAutoPlay: false,

      fakeLocation: require('./location.png'),
      locationMode: 'Video',
      showMarkerFlag: false,
      loading: false,
      device: null,
      host: null,
      elementLoading: false,
      element: null,
      modelFileLoading: false,
      modelFile: null,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.loadDevice();
    this.loadHost();
  },
  methods: {
    handleLocationModeChange() {
      if (this.locationMode === '3D') {
        if (this.device.bimInfo?.ecode) {
          this.getBindElement(this.device.bimInfo.ecode);
        }
      } else {
        //
      }
    },
    // 获取流媒体视频地址
    loadHost() {
      this.$restful('GET:/project-merchant/streamconfig', {
        projectId: this.project.id,
      }).then((res) => {
        this.host = res.host ? res.host + ':' + res.port : '';
      });
    },
    // 获取设备详情
    loadDevice() {
      this.loading = true;
      this.$restful(`GET:/project-merchant/devices/${this.eventData.deviceId}`, {
        projectId: this.project.id,
      })
        .then((res) => {
          this.device = res;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getBindElement(elementCode) {
      this.elementLoading = false;
      this.$restful(`GET:/bim/elements/code`, {
        code: elementCode,
        // projectId: this.project.id,
      })
        .then((element) => {
          this.element = element;
          this.loadBimByElement(element);
        })
        .finally(() => {
          this.elementLoading = false;
        });
    },
    async loadBimByElement(element) {
      if (element?.modelFileId) {
        this.modelFileLoading = true;
        this.$restful(
          `GET:/bim/bim-models/file-id?fileId=${element.modelFileId}`,
        )
          .then((modelFile) => {
            this.modelFile = modelFile;
            this.$refs.bim.reload(this.modelFile.loadPath);
            this.$refs.bim.handleViewAdded = async () => {
              const { objectId, levelName } = element;
              if (levelName) {
                this.$refs.bim.hideComponents(
                  [{ levelName: levelName }],
                  'HideOthers',
                );
              }
              this.$refs.bim.viewer3D.getComponentProperty(objectId, (res) => {
                const {
                  boundingBox: { min, max },
                } = res;
                const position = {
                  x: (min.x + max.x) / 2,
                  y: (min.y + max.y) / 2,
                  z: (min.z + max.z) / 2,
                };
                this.$refs.bim.addLabel({ position }, this.$refs.marker, 0, 0);
                this.showMarker();
                this.$refs.bim.zoomToComponents([objectId]);
                this.$refs.bim.setBlinkColor([objectId]);
              });
            };
          })
          .finally(() => {
            this.modelFileLoading = false;
          });
      }
    },
    showMarker() {
      this.showMarkerFlag = true;
    },
    hideMarker() {
      this.showMarkerFlag = false;
    },
    setLocation() {},
  },
};
</script>

<style lang="less" scoped>
@import '~@/styles/variables';
.event-detail {
  height: 500px;
  // display: flex;
  // flex-direction: column;
  .divice_location {
    height: 470px;
    overflow: hidden;
    position: relative;
    .fake_location {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
    }
    .nearby_cams {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: stretch;
      gap: 12px;
      position: relative;
      .nearby_cam {
        flex: 1;
      }
      .cant_autoplay_mask {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(125, 125, 125, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  .marker-box {
    width: 0;
    height: 0;
    position: absolute;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .element-info {
    // position: absolute;
    // bottom: 0;
    // left: auto;
    // right: auto;
    margin-bottom: 10px;
    color: #fff;
    border-radius: 2px;
    border: 1px solid @primary-color;
    background-color: fadeout(@primary-color, 40%);
    .element-info-item {
      display: flex;
      flex-wrap: nowrap;
      white-space: nowrap;
    }
  }
}
</style>
