<template lang="pug">
  div#amap.amap-container
    a-spin.abs-center(size="large" :spinning="loading")
    div.debug-tools
      a-button(@click="addImage" :loading="loadingMap.addImage" :disabled="!!imageLayer" type="primary") 添加图片图层
      a-button(@click="changeImage" :loading="loadingMap.changeImage" :disabled="!imageLayer" type="primary") 切换图层图片
      a-button(@click="addLine" type="primary") 添加线条
      a-button(@click="addMarker" type="primary") 添加标记
    div.marker-list
      a-avatar(v-for="cam in monitorList" :key="cam.id" :id="cam.id" shape="square" :src="cam.icon")
    div.monitor-dialog(v-for="monitor in openMonitorList" :key="monitor.id")
      a-card-meta(:title="monitor.name")
        template(slot="description")
          H5sVideo(:monitor="monitor")
</template>
<script>
import H5sVideo from '@/components/Monitor/H5sVideo';
export default {
  components: {
    H5sVideo,
  },
  data() {
    return {
      map: null,
      loading: false,
      center: [103.856453, 30.688865], //中心点坐标
      loadingMap: {
        addImage: false,
        changeImage: false,
      },
      imageLayer: null,
      imageList: [
        '/assets/GIS/F0.png',
        '/assets/GIS/F1.png',
        '/assets/GIS/F2.png',
        '/assets/GIS/F3.png',
        '/assets/GIS/F4.png',
      ],
      imageIndex: 1,
      monitorList: [
        {
          id: 'cam_1',
          name: '摄像头一',
          icon: '/assets/GIS/icon/cam1_1.svg',
          position: [103.854587, 30.688137],
        },
        {
          id: 'cam_2',
          name: '摄像头二',
          icon: '/assets/GIS/icon/cam1_3.svg',
          position: [103.857684, 30.686485],
        },
        {
          id: 'cam_3',
          name: '摄像头三',
          icon: '/assets/GIS/icon/cam1_1.svg',
          position: [103.859215, 30.689088],
        },
        {
          id: 'cam_4',
          name: '摄像头四',
          icon: '/assets/GIS/icon/cam5_1.svg',
          position: [103.856367, 30.690442],
        },
      ],
      openMonitorList: [],
    };
  },
  created() {
    this.loading = true;
  },
  mounted() {
    // this.loadMap();
  },
  beforeDestroy() {
    this.map && this.map.destroy();
  },
  methods: {
    loadMap() {
      // var indoorMap = new AMap.IndoorMap({ alwaysShow: true });
      this.map = new AMap.Map('amap', {
        // mapStyle: 'amap://styles/darkblue', //设置地图的显示样式
        center: [103.859953, 30.689965], //中心点坐标
        rotation: 45,
        pitch: 40,
        zoom: 17.2, //设置地图的缩放级别
        viewMode: '3D', //使用3D视图
        // showIndoorMap: false, //隐藏地图自带的室内地图图层
        // layers: [indoorMap, new AMap.TileLayer()],
      });
      // indoorMap.showIndoorMap('B000A856LJ');
      this.map.on('click', this.handleClick);
      this.map.on('complete', () => {
        this.loading = true;
      });
    },
    handleClick(e) {
    },
    handleClickCam(cam, e) {
      this.$message.info('Marker clicked: ' + cam.name);
      this.openMonitorList.push(cam);
    },
    addImage() {
      this.imageLayer = new AMap.ImageLayer({
        url: this.imageList[this.imageIndex],
        bounds: new AMap.Bounds(
          [103.856511, 30.690247],
          [103.857855, 30.687505],
        ),
        zooms: [15, 20],
      });
      this.loadingMap.addImage = true;
      this.imageLayer.on('complete', () => {
        this.loadingMap.addImage = false;
      });
      this.map.addLayer(this.imageLayer);
    },
    changeImage() {
      // this.loadingMap.changeImage = true;
      // this.imageLayer.on('complete', () => {
      //   this.loadingMap.changeImage = false;
      // });
      this.imageIndex++;
      this.imageLayer.setImageUrl(
        this.imageList[this.imageIndex % this.imageList.length],
      );
    },
    addLine() {
      this.line = new AMap.Polyline({
        path: [
          [103.854587, 30.688137],
          [103.857684, 30.686485],
          [103.859215, 30.689088],
          [103.856367, 30.690442],
          [103.854587, 30.688137],
        ],
        strokeWeight: 10,
        strokeColor: '#0693F1',
      });
      const [x, y, x1, y1] = [
        103.856367,
        30.690442,
        103.856367 + 0.002,
        30.690442 - 0.0005,
      ];
      this.imageLine = new AMap.Polyline({
        path: [
          [x, y],
          [x1, y],
          [x1, y1],
          [x, y1],
          [x, y],
        ],
        strokeWeight: 10,
        strokeColor: '#0693F1',
      });
      this.map.add([this.line, this.imageLine]);
    },
    addMarker() {
      this.monitorList.forEach((cam) => {
        const marker = new AMap.Marker({
          position: new AMap.LngLat(...cam.position),
          // icon: cam.icon,
          content: document.querySelector('#' + cam.id),
          anchor: 'bottom-center',
        });
        marker.on('click', (e) => {
          this.handleClickCam(cam, e);
        });
        this.map.add(marker);
      });
    },
  },
};
</script>
<style lang="less" scoped>
.amap-container {
  width: 100%;
  height: 100%;
  .debug-tools {
    position: absolute;
    // top: 0;
    bottom: 294px;
    left: 240px;
    z-index: 100;
    button {
      margin: 5px;
    }
  }
  .marker-list {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .monitor-dialog {
    position: absolute;
    top: 24px;
    right: 24px;
    border: 1px solid #0693f1;
  }
}
</style>
