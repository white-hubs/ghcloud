
import { defineComponent, onMounted, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import bus from "@/utils/bus";
import { VideoType } from "@/api/models/vmonitor";
import { getDataDictionaryByItem } from "@/api/dictionary";
import { splitArray } from '@/utils/common'
import styles from "./parking-car-monitor.module.less";
import { parkingStore } from '@/components/businessPanel/parking-car/store/parking'
import { cubeParkingLotService } from '@/api/service'

export const ParkingCarMonitor = defineComponent({
  props: {
    title: {
      type: String,
      default: '车场监控',
    },
  },
  setup(props) {
    const store = parkingStore()
    const num = ref(0);
    const cameraList = ref<VideoType[]>([]);
    const videoList = ref<VideoType[]>([]);
    const monitor_layout = ref('2X2');
    const cameraListTotal = ref<VideoType[][]>([]);
    const videoNum = ref(4);

    const moveMatchedToEnd = (arr: VideoType[], id: any) => {
      const matched = arr.filter(item => item.id === id);
      const notMatched = arr.filter(item => item.id !== id);
      return notMatched.concat(matched);
    };

    const getVideo = async () => {
      await getDictionary();
      if (monitor_layout.value === '2X2') {
        videoNum.value = 4;
      } else if (monitor_layout.value === '1X1') {
        videoNum.value = 1;
      }
      if (store.currentParking) {
        const params = {
          pageNumber: 1,
          pageSize: 999,
          deviceState: true,
        };
        const res = await cubeParkingLotService.getParkingDevicesById(store.currentParking?.id, params);
        videoList.value = (res.records)?.filter(e => e.status?.onlineState) as unknown as VideoType[];
      } else {
        const res = await cubeParkingLotService.getParkingMonitorDevices()
        videoList.value = []
        res?.forEach((item) => { 
          item.devices?.map(e => {
            if (e.status?.onlineState) {
              videoList.value.push(e as unknown as VideoType)
            }
          })
        });
      }
      cameraListTotal.value = splitArray(videoList.value, videoNum.value);
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = JSON.parse(JSON.stringify(cameraListTotal.value[num.value]));
      }
    };

    const onError = (id: any) => {
      cameraList.value.length = 0;
      videoList.value = moveMatchedToEnd(JSON.parse(JSON.stringify(videoList.value)), id);
      cameraListTotal.value = splitArray(videoList.value, videoNum.value);
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = JSON.parse(JSON.stringify(cameraListTotal.value[num.value]));
      }
    };

    const clickCamera = (item: VideoType) => {
      bus.emit("switchCamera", item);
    };

    const getDictionary = async () => {
      const res = await getDataDictionaryByItem('SERVICE_CONFIGURATION');
      if (res.length && res[0].variable && JSON.parse(res[0].variable).monitor_layout) {
        monitor_layout.value = JSON.parse(res[0].variable).monitor_layout;
      }
    };

    onMounted(() => {
      getVideo();
    });

    return () => (
      <div>
        <SubPanelTemplate title={props.title} class={styles.monitor}>
          <div class={styles.videoBody}>
            {cameraList.value.length === 1 ? (
              <div class={styles.cameraItem}>
                <div class={styles.camera} onClick={() => clickCamera(cameraList.value[0])}>
                  <H5Video on-error={onError} cameraItem={cameraList.value[0]} idStr={cameraList.value[0].token} key={cameraList.value[0].thirdPartyId}></H5Video>
                </div>
              </div>
            ) : cameraList.value.length > 0 ? (
              <div class={styles.group}>
                {cameraList.value.map((item, index) => (
                  <div class={styles.camera} key={item.thirdPartyId + index} onClick={() => clickCamera(item)}>
                    <H5Video on-error={onError} cameraItem={item} idStr={item.token + index}></H5Video>
                  </div>
                ))}
              </div>
            ) : (
              <div class={styles.group}>
                <NoData />
              </div>
            )}
          </div>
        </SubPanelTemplate>
      </div>
    );
  },
});
