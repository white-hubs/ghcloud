import styles from "./index.module.less";
import { MapModal } from "./map-modal";
import "@amap/amap-jsapi-types";
import { getAreaDevicePointList } from "@/api/device-center";
import { getCurrentApplication } from "@/utils/auth";
import { getLocalAssetsFile } from "@/utils/common";
import AMapLoader from "@amap/amap-jsapi-loader";
import { Spin } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref } from "vue";
interface PointsItems {
  lntAndLat: string;
  icon: number;
  devices: { deviceId: string; deviceName: string }[];
}
export const GisMap = defineComponent({
  setup: () => {
    let refMap: any = "";
    const map = ref<AMap.Map>();
    const loading = ref(false);
    const modalVisible = ref(false);
    const modalOptions = ref<{ deviceId: string; deviceName: string }[]>([]);
    /** 瓦片底图（MinIO） */
    const layerImage = "/resource/v1/cooling-water/wapian.jpg";
    const defaultImage = getLocalAssetsFile("mapicon.png");
    const alarmImage = getLocalAssetsFile("map-alarm-icon.gif");
    const getPoints = async (): Promise<void> => {
      const result = await getAreaDevicePointList(getCurrentApplication().code);
      const pointList = result.data as PointsItems[];
      pointList.forEach((item) => {
        addMarker(item);
      });
    };
    const loadMap = async (): Promise<void> => {
      try {
        const resMap = await AMapLoader.load({
          key: "11ce1f353a30f9fa2b125c842780a4cf",
          version: "2.0",
        });
        refMap = resMap;
        const imageLayer = new resMap.ImageLayer({
          url: layerImage,
          bounds: new resMap.Bounds([104.010476, 30.557396], [104.034262, 30.575086]),
          zooms: [17, 20],
        });
        map.value = new resMap.Map("map-container", {
          showLabel: false,
          resizeEnable: true, // 是否监控地图容器尺寸变化
          zoom: 17, // 缩放级别
          center: [104.020175, 30.564616], // 初始化地图中心点
          defaultCursor: "default", // 鼠标样式
          layers: [new resMap.TileLayer(), imageLayer],
        });
      } catch {}
    };
    const addMarker = (point: PointsItems): void => {
      const marker = new refMap.Marker({
        map: map.value,
        icon: point.icon ? defaultImage : alarmImage,
        position: point.lntAndLat.split(","),
        offset: new AMap.Pixel(-13, -30),
      });
      marker.on("click", () => {
        modalVisible.value = true;
        modalOptions.value = point.devices;
      });
    };
    onMounted(async () => {
      try {
        loading.value = true;
        await loadMap();
        await getPoints();
      } finally {
        loading.value = false;
      }
    });
    return (): JSX.Element => (
      <>
        <div style={{ width: "100%", height: "100%" }}>
          <Spin spinning={loading.value} wrapperClassName={styles["spin-container"]}>
            <div style={{ height: "100%" }} id="map-container" />
            <MapModal v-model:visible={modalVisible.value} deviceOptions={modalOptions.value} />
          </Spin>
        </div>
      </>
    );
  },
});
