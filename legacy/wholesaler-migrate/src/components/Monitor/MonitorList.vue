<template>
  <div class="device_container dark">
    <div class="container_header">
      <a-input
        v-model="keyWord"
        placeholder="请输入"
        allow-clear
        class="header_search header_search_mutilple_montor"
      >
        <a-icon slot="suffix" type="search" />
      </a-input>
    </div>
    <div class="device_list">
      <div v-for="(floor, index) in deviceListFilterd" :key="floor.key" class="device_floor">
        <div class="floor_header" @click="toggleActive(floor)">
          <div class="floor_index">{{ index + 1 }}</div>
          <div class="floor_name">{{ floor.name }}</div>
          <div class="floor_open" :class="{open: keyWord || activeFloor === floor}">
            <i class="el-icon-caret-top" />
          </div>
        </div>
        <div
          class="floor_device_list"
          :style="{height: keyWord || activeFloor === floor ? 40 * floor.list.length + 'px' : '0px'}"
        >
          <div
            v-for="(device, i) in floor.list"
            :key="device.h5Token + i"
            class="floor_device_item"
            @click="$emit('device-click', device)"
          >
            <div class="device_index">{{ i + 1 }}</div>
            <div class="device_name">{{ device.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="container_footer">
      <div
        v-for="s in monitorSpecs"
        :key="s.value"
        class="monitor_specs"
        :class="{active: selectSpecs === s}"
        @click="setSelectSpecs(s)"
      >
        <div class="grid-bg" :style="getStyleObj(s)">
          <div
            v-for="i in s.value"
            :key="`grid-bg-item-${i}`"
            class="grid-bg-item"
            :style="{'grid-area': `area${i}`}"
          />
        </div>
        <div class="specs-value">{{ s.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonitorList',
  props: {
    deviceList: {
      type: Array,
      default: () => {
        return []
      }
    },
    monitorSpecs: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      keyWord: '',
      activeFloor: null,
      selectSpecs: null
    }
  },
  computed: {
    deviceListFilterd() {
      let list = []
      const testReg = this.keyWord ? new RegExp(this.keyWord, 'ig') : /./ig
      this.deviceList.forEach((floor, index) => {
        list[index] = {
          ...floor,
          list: []
        }
        if (floor.list && floor.list.length) {
          list[index].list = floor.list.filter((device) => {
            // keyword 模糊匹配
            return testReg.test(device.name) || testReg.test(device.name)
          })
        }
      })
      list = list.filter((floor) => {
        // 没有摄像头的楼层 隐藏
        return floor.list && floor.list.length
        // return true;
      })
      return list
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // 这里可以配置 selectSpecs 或者考虑直接从prop上拿??
      this.selectSpecs = this.monitorSpecs[0]
      this.$emit('specs-click', this.selectSpecs)
    },
    toggleActive(val) {
      if (this.activeFloor === val) {
        this.activeFloor = null
      } else {
        this.activeFloor = val
      }
    },
    setSelectSpecs(s) {
      if (s === this.selectSpecs) {
        // 重复点击无效
        return
      }
      this.selectSpecs = s
      this.$emit('specs-click', s)
    },
    getStyleObj(selectSpecs) {
      const [colNum, rowNum] = selectSpecs.label.split('X')
      const colWidth = Math.floor(100 / colNum) + '%'
      const rowWidth = Math.floor(100 / rowNum) + '%'
      let areas = 'area1'
      switch (selectSpecs.value) {
        case 1:
          areas = `'area1'`
          break
        case 4:
          areas = `
          'area1 area2'
          'area3 area4'
          `
          break
        case 6:
          areas = `
          'area1 area1 area2'
          'area1 area1 area3'
          'area4 area5 area6'
          `
          break
        case 8:
          areas = `
          'area1 area1 area1 area2'
          'area1 area1 area1 area3'
          'area1 area1 area1 area4'
          'area5 area6 area7 area8'
          `
          break
        case 9:
          areas = `
          'area1 area2 area3'
          'area4 area5 area6'
          'area7 area8 area9'
          `
          break
      }
      return {
        display: 'grid',
        'grid-template-columns': `repeat(${colNum}, ${colWidth})`,
        'grid-template-rows': `repeat(${rowNum}, ${rowWidth})`,
        'grid-template-areas': areas
      }
    }
  }
}
</script>
<style>
.header_search_mutilple_montor > .el-input__inner {
  background-color: rgba(43, 61, 83, 0.3) !important;
  color: rgba(255, 255, 255, 0.6);
  border: none;
}
</style>
<style lang="less" scoped>
.device_container {
  height: 100%;
  width: 310px;
  padding: 0 15px;
  position: absolute;
  left: 0;
  top: 0;
  .container_header {
    width: 100%;
    height: 60px;
    line-height: 60px;
    .header_search {
      width: 100%;
      .el-input__inner {
        background-color: rgba(43, 61, 83, 0.3) !important;
        color: rgba(255, 255, 255, 0.6);
        border: none;
      }
    }
  }
  .device_list {
    height: calc(100% - 140px);
    overflow-y: auto;
    overflow-x: hidden;
    .device_floor {
      margin-bottom: 2px;
      .floor_header {
        height: 48px;
        display: flex;
        align-items: center;
        background-color: rgba(43, 61, 83, 0.3);
        font-size: 14px;
        cursor: pointer;
        .floor_index {
          padding: 15px;
          color: #abb9cb;
        }
        .floor_name {
          color: #abb9cb;
          flex: 1;
        }
        .floor_open {
          color: #abb9cb;
          padding: 15px;
          transition: all 0.2s linear;
          &.open {
            transform: rotateZ(180deg);
          }
        }
      }
      .floor_device_list {
        height: 0;
        transition: all 0.2s linear;
        overflow: hidden;
        // &.active {
        //   height: auto;
        // }
        .floor_device_item {
          height: 40px;
          display: flex;
          align-items: center;
          background-color: transparent;
          font-size: 14px;
          cursor: pointer;
          &:hover {
            background-image: linear-gradient(
              180deg,
              rgba(41, 137, 255, 0.5) 0%,
              rgba(41, 137, 255, 0.1) 15%,
              rgba(41, 137, 255, 0.1) 85%,
              rgba(41, 137, 255, 0.5)
            );
          }
          & + .floor_device_item {
            border-top: 1px solid rgba(163, 150, 150, 0.2);
          }
          .device_index {
            padding: 15px;
            color: #abb9cb;
          }
          .device_name {
            color: #abb9cb;
            flex: 1;
          }
        }
      }
    }
  }
  .container_footer {
    width: 100%;
    height: 75px;
    padding: 18px 0 0 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    .monitor_specs {
      position: relative;
      width: 58px;
      height: 38px;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      color: #69737f;
      border-radius: 3px;
      background-color: rgba(43, 61, 83, 0.3);
      cursor: pointer;
      &.active {
        color: #ffffff;
        background-color: #2989ff;
      }
      .grid-bg {
        display: grid;
        width: 100%;
        height: 100%;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-top: none;
        border-left: none;
        .grid-bg-item{
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-right: none;
          border-bottom: none;
        }
      }
      .specs-value{
        position: absolute;
        top: 0;
        left: 0;
        padding: 0 5px;
      }
    }
  }
}
</style>
