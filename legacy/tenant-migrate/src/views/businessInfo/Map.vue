<template>
  <div>
    <div>
      <div class="map-search">
        <div class="label">搜索地址</div>
        <a-input v-model:value="locationValue" placeholder="请输入地址" style="width: 300px;" />
        <a-button type="primary" @click.stop="handleSearch">定位</a-button>
      </div>
    </div>
    <div id="map"></div>
  </div>
</template>

<script lang="jsx">
import {
  ref,
  watch,
  toRefs,
  reactive,
  defineComponent,
  onBeforeMount,
  getCurrentInstance,
  onMounted,
  watchEffect,
  markRaw,
  computed,
  nextTick,
  shallowReactive,
  shallowRef,
} from "vue";
import { useStore, mapState } from "vuex";

export default defineComponent({
  name: "Map",
  props: {
    SZmarkerLableList: {
      type: Array,
      default: () => [],
    },
    latLng: {
      type: String,
      default: () => "",
    },
    searchValue: {
      type: String,
      default: () => "",
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const storeState = mapState([
      "BasicInfo",
      "PlanInfo",
      "FilterParams",
      "FramlandDetail",
      "GotoHome",
    ]);
    const storeStateValue = {};
    const locationValue = ref(props.searchValue)
    Object.keys(storeState).forEach((Key) => {
      const fn = storeState[Key].bind({ $store: store });
      storeStateValue[Key] = computed(fn);
    });
    watch(() => props.searchValue, () => {
      locationValue.value = props.searchValue
    })
    //上面代码是解构vuex里面的数据
    const { proxy } = getCurrentInstance();
    const state = shallowReactive({
      map: null, //初始化的map对象
      DistrictSearchResult: null, //深证边界map对象
      initXy: [], //初始粗略轮廓数据
      initXyDeil: [], //初始详细轮廓数据
      textMap: null, //文本对象，保存下来，清除用
      CircleMarkerMap: null, //深圳圆点标记对象
      markerLableList: [], //这个数据后端返回的-深圳
      frameLabelInfo: null,
      InfoWindowStatue: null, //点击事件是否展示信息框，当为null的并发生点击事件才展示，
      polygonObj: null,
      centerData: [],
    });

    const draggingObject = ref(null);

    const onDragStart = (e) => {
      draggingObject.value = e.target;
    };

    const onDragEnd = (e) => {
      draggingObject.value = null;
    };
    const onClick = (e) => {
      state.map.clearMap();
      var marker = new AMap.Marker({
        position: new AMap.LngLat(e.lnglat.lng, e.lnglat.lat),
        offset: new AMap.Pixel(-10, -10),
        icon: "//vdata.amap.com/icons/b18/1/2.png", // 添加 Icon 图标 URL
      });
      const geocoder = new AMap.Geocoder({
        city: '全国', // 城市设为北京，默认：“全国”
      })
      state.map.add(marker);
      geocoder.getAddress([e.lnglat.lng, e.lnglat.lat], function (status, result) {
        if (status === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress
          locationValue.value = address
          emit("click", e.lnglat, locationValue.value);
        } else {
        }
      })

    };

    //高德地图初始化
    const initOrResetMap = () => {
      let szCenter = [104.05713, 30.587918];
      let postLnglat = {
        lng: 104.06901,
        lat: 30.56975,
      };
      const szInitZoom = 15;
      if (!state.map) {
        state.map = new AMap.Map("map", {
          center: szCenter, //114.2, 22.6
          showLabel: true,
          viewMode: "3D",
          labelzIndex: 130,
          zoom: szInitZoom,
          cursor: "pointer",
          animateEnable: false,
        });
        if (props.latLng) {
          const lngLat = props.latLng.split(',')
          var marker = new AMap.Marker({
            position: new AMap.LngLat(lngLat[1], lngLat[0]),
            offset: new AMap.Pixel(-10, -10),
            icon: "//vdata.amap.com/icons/b18/1/2.png", // 添加 Icon 图标 URL
          });
          state.map.add(marker);
          state.map.setCenter(new AMap.LngLat(lngLat[1], lngLat[0]))
        }
        state.map.on("dragstart", onDragStart);
        state.map.on("dragend", onDragEnd);
        state.map.on("click", onClick);
      } else {
        state.map.clearMap();
        state.map.setZoomAndCenter(szInitZoom, szCenter, true);
      }
    };
    const init = () => {
      initOrResetMap();
    };
    const handleSearch = () => {
      const geocoder = new AMap.Geocoder({
        city: '全国', // 城市设为北京，默认：“全国”
      })
      if (!locationValue.value) return proxy.$message.error('请输入定位地址')
      geocoder.getLocation(locationValue.value, (status, result) => {
        if (status === 'complete') {
          const lngLat = {
            lng: result.geocodes[0].location.lng,
            lat: result.geocodes[0].location.lat
          }
          state.map.clearMap();
          var marker = new AMap.Marker({
            position: new AMap.LngLat(lngLat.lng, lngLat.lat),
            offset: new AMap.Pixel(-10, -10),
            icon: "//vdata.amap.com/icons/b18/1/2.png", // 添加 Icon 图标 URL
          });
          state.map.add(marker);
          state.map.setCenter(new AMap.LngLat(lngLat.lng, lngLat.lat))
          emit("click", lngLat, locationValue.value)
        }
      })
    }

    watchEffect(() => {
      state.markerLableList = props.SZmarkerLableList;
      // state.farmlandList=[]
    });

    onMounted(async () => {
      init();
    });
    return {
      init,
      handleSearch,
      locationValue
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.map-search {
  margin-bottom: 12px;

  .label {
    flex-shrink: 0;
  }

  display: flex;
  align-items: center;
  gap: 12px;
}

#map {
  width: 100%;
  height: 400px;
  // height: calc(100% - 60px);
}
</style>
