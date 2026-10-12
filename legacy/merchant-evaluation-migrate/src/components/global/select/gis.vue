<template lang="pug">
div.gis_select_container(title="地址搜索")
  div.amap-select-container(:id="id" title="" :style='{height:height}')
  div.search_tools(v-if="!hideSearchTools")
    a-input-search(v-model="searchText" placeholder="请输入地址搜索" 
      @focus="showResult = true" 
      @search="handleSearch"
      allowClear
    )
    div.result_list(v-show="showResult")
      div.result_item(v-for="res in resultList" :key="res.id" @click="handleClickResult(res)")
        span.p1.px2 {{ res.name }}
      a-empty.p3.m0(v-if="!resultList.length" :image="simpleImage")
</template>
<script>
import { Empty } from 'ant-design-vue';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [Array, String],
    gisLongitude: String,
    gisLatitude: String,
    zoom: {
      type: Number,
      default: 10,
    },
    height: {
      type: String,
      default: () => '200px',
    },
    viewMode: String,
    hideSearchTools: Boolean,
  },
  data() {
    return {
      map: null,
      loading: false,
      id: btoa(Math.random() * 1000).substr(8),
      //
      searchText: null,
      showResult: false,
      resultList: [],
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
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  created() {
    this.loading = true;
  },
  // updated() {
  //   if (this.map) {
  //     this.map.destroy();
  //     this.map = null;
  //   } else {
  //     this.loadMap();
  //   }
  // },
  mounted() {
    this.loadMap();
  },
  beforeDestroy() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
  },
  methods: {
    // 事件处理
    handleSearch(val) {
      if (val?.trim()) {
        this.aMapSearch.search(val, (res, result) => {
          this.resultList = result?.poiList?.pois || [];
        }); //关键字查询
      } else {
        this.resultList = [];
      }
      this.showResult = true;
    },
    // 点击搜索结果
    handleClickResult(res) {
      if (res.location) {
        this.map.setCenter([res?.location?.lng, res?.location?.lat]);
        this.map.setZoom(17.5);
        this.showResult = false;
      }
    },
    //
    loadMap() {
      // var indoorMap = new AMap.IndoorMap({ alwaysShow: true });
      this.map = new AMap.Map(this.id, {
        center: this.center, //中心点坐标
        rotation: 45,
        pitch: 40,
        zoom: this.zoom, //设置地图的缩放级别
        viewMode: this.viewMode, //使用3D视图
      });
      this.map.on('click', this.handleClick);
      this.map.on('complete', () => {
        // this.loading = true;
        this.addMarker(this.center);
      });
      AMap.plugin('AMap.PlaceSearch', () => {
        //
        const PlaceSearchOptions = {
          //设置PlaceSearch属性
          country: '中国', //城市
          city: '', //城市
          type: '', //数据类别
          pageSize: 10, //每页结果数,默认10
          pageIndex: 1, //请求页码，默认1
          extensions: 'base', //返回信息详略，默认为base（基本信息）
        };
        this.aMapSearch = new AMap.PlaceSearch(PlaceSearchOptions); //构造PlaceSearch类

        // MSearch.search('天府新谷', (res, result) => {
        // }); //关键字查询
      });
      AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //是否使用高精度定位，默认:true
          timeout: 10000, //超过10秒后停止定位，默认：5s
          position: 'RB', //定位按钮的停靠位置
          buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
          showMarker: false,
        });
        this.map.addControl(geolocation);
      });
    },
    handleClick(e) {
      this.showResult = false;
      const { lat, lng } = e.lnglat;
      this.addMarker([lng, lat]);
      this.$emit('change', [lng, lat].join(','));
      this.$emit('update:gisLongitude', lng);
      this.$emit('update:gisLatitude', lat);
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
.gis_select_container {
  width: 100%;
  height: 100%;
  position: relative;
  .search_tools {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 200px;
    .result_list {
      margin: 1px;
      background-color: #fff;
      max-height: 125px;
      overflow: auto;
      .result_item {
        display: flex;
        // height: 40px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
        &:hover {
          background-color: #1890ff10;
        }
      }
    }
  }
}
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
