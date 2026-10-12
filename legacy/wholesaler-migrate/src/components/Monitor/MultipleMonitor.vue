<template>
  <div class="container">
    <MonitorList
      :device-list="deviceList"
      :monitor-specs="monitorSpecs"
      @device-click="handleDeviceClick"
      @specs-click="handleSpecsClick"
    />
    <MonitorSpecs
      :monitor-u-i-index-device-map="monitorUIIndexDeviceMap"
      :select-specs="selectSpecs"
      :active-monitor-index="selectMonitorUIIndex"
      @monitorui-select="handleMonitorUISelect"
    />
  </div>
</template>

<script>
import MonitorList from './MonitorList';
import MonitorSpecs from './MonitorSpecs';
// import { getMonitorTree } from "@/api/jkpt/multipleMonitor";

export default {
  name: 'MultipleMonitor',
  components: {
    MonitorList,
    MonitorSpecs,
  },
  data() {
    return {
      deviceList: [],
      monitorSpecs: [
        {
          value: 1,
          label: '1X1',
        },
        {
          value: 4,
          label: '2X2',
        },
        {
          value: 6,
          label: '3X3',
        },
        {
          value: 8,
          label: '4X4',
        },
        // {
        //   value: 9,
        //   label: '3X3'
        // }
      ],
      selectDevice: null,
      selectSpecs: null,
      selectMonitorUIIndex: 0,
      hasActiveMonitor: false,
      monitorUIIndexDeviceMap: {},
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // this.selectSpecs = this.monitorSpecs[0]; // 通过localStoreage做持久化?
      // this.dealMonitorTree()
      this.getMonitorTree();
    },
    dealMonitorTree(data) {
      const floors = [];
      const floorMap = {};
      data.forEach((item) => {
        if (!floorMap[item.areaId]) {
          floorMap[item.areaId] = {
            id: item.areaId,
            key: item.areaId,
            name: item.areaName,
            list: [],
          };
          floors.push(floorMap[item.areaId]);
        }
        floorMap[item.areaId].list.push(item);
      });
      this.deviceList = floors;
    },
    // http://171.221.238.16:9011/video/GetCameraAreaTree // 摄像机列表树 暂时用的五医院的
    async getMonitorTree() {
      const params = {
        getonline: true,
        session: null,
        token: null,
      };
      await this.$axios
        .get('/iot/cameras/all')
        .then((res) => {
          this.dealMonitorTree(res);
        })
        .catch((e) => {
          // this.dealMonitorTree(e.data[0])
        });
    },
    handleDeviceClick(device) {
      this.selectDevice = device;
      // 添加视频到右侧的视频框
      this.addDeviceToMonitorUI(device);
    },
    handleSpecsClick(specs) {
      // 重复点击无效
      this.selectSpecs = specs; // 要不要清空以前保存的 monitorUIIndexDeviceMap
      const keys = Object.keys(this.monitorUIIndexDeviceMap).sort();
      keys.forEach((k) => {
        if (k > specs.value) {
          delete this.monitorUIIndexDeviceMap[k];
        }
      });
      // 当之前选择的monitor框的序号比现在的规格最大值还大, 直接清空选中, 还是改为当前规格的最大序号?
      if (this.selectMonitorUIIndex > specs.value) {
        this.selectMonitorUIIndex = 0;
        this.hasActiveMonitor = false;
      }
    },
    handleMonitorUISelect(data) {
      this.selectMonitorUIIndex = data.selectMonitorUIIndex;
      this.hasActiveMonitor = data.hasActiveMonitor;
    },
    addDeviceToMonitorUI(device) {
      // 实现一个方法 绑定 selectDevice 和 selectMonitorUIIndex 并记录
      if (this.hasActiveMonitor && this.selectMonitorUIIndex) {
        this.$set(
          this.monitorUIIndexDeviceMap,
          this.selectMonitorUIIndex,
          device,
        );
        return;
      }
      // 循环编辑
      // this.selectMonitorUIIndex %= this.selectSpecs
      //   ? this.selectSpecs.value
      //   : 1;
      const maxIndex = this.selectSpecs ? this.selectSpecs.value : 1;
      this.selectMonitorUIIndex += 1;
      if (this.selectMonitorUIIndex > this.selectSpecs.value) {
        this.selectMonitorUIIndex = this.selectSpecs.value;
      }
      if (this.monitorUIIndexDeviceMap[this.selectMonitorUIIndex]) {
        // 如果这个已经绑定了Device 跳到下一个没有绑定的 或者到最后一个都是绑定了的, 那么编辑最后一个
        for (let i = this.selectMonitorUIIndex + 1; i <= maxIndex; i++) {
          this.selectMonitorUIIndex = i;
          if (!this.monitorUIIndexDeviceMap[i]) {
            break;
          }
        }
        // this.addDeviceToMonitorUI(device);
        // return;
      }
      this.$set(
        this.monitorUIIndexDeviceMap,
        this.selectMonitorUIIndex,
        device,
      );

    },
  },
};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  background-color: #000;
  background-image: url('/resource/v1/wholesaler-migrate/images/background.jpg');
}
</style>
