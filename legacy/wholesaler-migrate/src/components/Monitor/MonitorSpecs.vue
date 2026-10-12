<template>
  <div ref="monitor_specs" class="monitor_specs" :style="styleObj">
    <div
      v-for="i in selectSpecs ? selectSpecs.value : 0"
      :key="i"
      :ref="'monitor_ui_' + i"
      class="monitor_item"
      :class="{ active: i === activeMonitorIndex }"
      :style="{ 'grid-area': `area${i}` }"
      @click="setSelectMonitorUI(i)"
    >
      <!-- <div v-if="!monitorUIIndexDeviceMap[i]" class="monitor_placeholder">
        <span>请添加视频{{ i }}</span>
      </div>
      <div v-if="!!monitorUIIndexDeviceMap[i]" class="monitor_video">
        <H5sVideo :monitor="monitorUIIndexDeviceMap[i]" :order="i">
          {{ monitorUIIndexDeviceMap[i].CameraStrName }} 连接中...
        </H5sVideo>
      </div> -->
      <!-- 写死的例子, 正式用, 放开上面 -->
      <div class="monitor_video">
        <H5sVideo :monitor="{ strToken: '1004' }">
          {{ 'xxxxx' }} 连接中...
        </H5sVideo>
      </div>
    </div>
  </div>
</template>

<script>
import H5sVideo from './H5sVideo';
export default {
  name: 'MonitorSpecs',
  components: {
    H5sVideo,
  },
  props: {
    selectSpecs: {
      type: Object,
      default: () => {
        return null;
      },
    },
    monitorUIIndexDeviceMap: {
      type: Object,
      default: () => {
        return {};
      },
    },
    activeMonitorIndex: null,
  },
  data() {
    return {
      // activeMonitorIndex: null
    };
  },
  computed: {
    styleObj() {
      if (!this.selectSpecs || !this.$refs.monitor_specs) {
        return {};
      }
      const [colNum, rowNum] = this.selectSpecs.label.split('X');
      // const colWidth = Math.floor(100/colNum) + '%';
      // const rowWidth = Math.floor(100/rowNum) + '%';
      const containerWidth = this.$refs.monitor_specs.clientWidth - 12;
      const containerHeght = this.$refs.monitor_specs.clientHeight - 25;
      // TODO: 用固定值 需要在window.resize的时候重新计算, 百分比就不需要重新计算 , 但是百分比有可能出滚动条
      const colWidth = Math.floor((containerWidth - 6 * (colNum - 1)) / colNum);
      const rowWidth = Math.floor((containerHeght - 6 * (rowNum - 1)) / rowNum);
      let areas = 'area1';
      switch (this.selectSpecs.value) {
        case 1:
          areas = `'area1'`;
          break;
        case 4:
          areas = `
          'area1 area2'
          'area3 area4'
          `;
          break;
        case 6:
          areas = `
          'area1 area1 area2'
          'area1 area1 area3'
          'area4 area5 area6'
          `;
          break;
        case 8:
          areas = `
          'area1 area1 area1 area2'
          'area1 area1 area1 area3'
          'area1 area1 area1 area4'
          'area5 area6 area7 area8'
          `;
          break;
        case 9:
          areas = `
          'area1 area2 area3'
          'area4 area5 area6'
          'area7 area8 area9'
          `;
          break;
      }
      return {
        display: 'grid',
        'grid-template-columns': `repeat(${colNum}, 1fr)`,
        'grid-template-rows': `repeat(${rowNum}, 1fr)`,
        'grid-row-gap': '6px',
        'grid-column-gap': '6px',
        'grid-template-areas': areas,
      };
    },
  },
  mounted() {
  },
  updated() {
    // this.activeMonitorIndex = null
    // this.$emit('monitorui-select', {
    //   selectMonitorUIIndex: 0,
    //   hasActiveMonitor: false
    // })
  },
  methods: {
    setSelectMonitorUI(index) {
      if (this.activeMonitorIndex !== index) {
        // this.activeMonitorIndex = index
        this.$emit('monitorui-select', {
          selectMonitorUIIndex: index,
          hasActiveMonitor: true,
        });
      } else {
        // this.activeMonitorIndex = null
        this.$emit('monitorui-select', {
          selectMonitorUIIndex: 0,
          hasActiveMonitor: false,
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.monitor_specs {
  height: 100%;
  width: calc(100% - 310px);
  padding: 10px 12px 15px 0;
  position: absolute;
  left: 310px;
  top: 0;
  display: flex;
  user-select: none;
  .monitor_item {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    &:hover {
      border-color: #2989ff;
    }
    &.active {
      border-color: #2989ff;
    }
    .monitor_placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(43, 61, 83, 0.3);
      span {
        font-size: 18px;
        color: #abb9cb;
      }
    }
    .monitor_video {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(43, 61, 83, 0.3);
      span {
        font-size: 18px;
        color: #abb9cb;
      }
    }
  }
}
</style>
