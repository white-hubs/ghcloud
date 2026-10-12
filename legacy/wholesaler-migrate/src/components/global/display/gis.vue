<template lang="pug">
  div.amap-select-container(:id="id")
</template>
<script>
export default {
  props: {
    value: [Array, String],
  },
  data() {
    return {
      map: null,
      loading: false,
      // center: this.value || [103.856453, 30.688865], //中心点坐标
      id: btoa(Math.random() * 1000).substr(8),
    };
  },
  computed: {
    center() {
      let center = [116.799475, 23.839421];
      if (typeof this.value === 'string') {
        center = this.value?.split(',') || center;
      } else {
        center = this.value || center;
      }
      return center;
    },
  },
  watch: {
    center() {
      this.map.setCenter(this.center);
      this.marker.setPosition(this.center);
    },
  },
  created() {
    this.loading = true;
  },
  mounted() {
    this.loadMap();
  },
  beforeDestroy() {
    this.map && this.map.destroy();
  },
  methods: {
    loadMap() {
      // var indoorMap = new AMap.IndoorMap({ alwaysShow: true });
      this.map = new AMap.Map(this.id, {
        center: this.center, //中心点坐标
        rotation: 45,
        pitch: 40,
        zoom: 17.2, //设置地图的缩放级别
        // viewMode: '3D', //使用3D视图
      });

      this.map.on('complete', () => {
        // this.loading = true;
        this.addMarker(this.center);
      });
    },
    addMarker(position) {
      if (this.marker) {
        this.marker.setPosition(position);
      } else {
        this.marker = new AMap.Marker({
          position: new AMap.LngLat(...position),
          icon:
            '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          // '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
          anchor: 'bottom-center',
        });
        this.marker.on('click', (e) => {
          // this.handleClickCam(cam, e);
        });
        this.map.add(this.marker);
      }
    },
  },
};
</script>
<style lang="less" scoped>
.amap-select-container {
  width: 100%;
  min-height: 200px;
}
</style>
<style>
.amap-select-container .amap-icon img,
.amap-select-container .amap-marker-content img {
  width: 25px;
  height: 34px;
}
</style>
