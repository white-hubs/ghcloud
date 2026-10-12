import { defineComponent, onMounted, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import bus from "@/utils/bus";
import { VideoType } from "@/api/models/vmonitor";
import { getDataDictionaryByItem } from "@/api/dictionary";
import { videoListDevices } from '@/api/vmonitor'
import { splitArray } from '@/utils/common'
import { useStateStore } from "@/pages/state/use-state-store";
import styles from "./people-flow-monitor.module.less";
import { trafficStore } from '../../store/traffic'
import { cubeTrafficStatisticsService } from '@/api/service'

// 人流监控
export const PeopleFlowMonitor = defineComponent({
  name: 'PeopleFlowMonitor',
  props: {
    title: {
      type: String,
      default: '人流监控',
    },
  },
  setup(props) {
    const store = trafficStore()
    const num = ref(0);
    const cameraList = ref<VideoType[]>([]);
    const videoList = ref<VideoType[]>([]);
    const { globalState } = useStateStore();
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
      if (store.currentTraffic) {
        const params = {
          pageNumber: 1,
          pageSize: 999,
          deviceState: true,
        };
        const res = await cubeTrafficStatisticsService.getTrafficDevicesById(store.currentTraffic?.id, params);
        videoList.value = (res.records)?.filter(e => e.status?.onlineState) as unknown as VideoType[];
      } else {
        const res = await cubeTrafficStatisticsService.getTrafficMonitorDevices()
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