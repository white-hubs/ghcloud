import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import bus from "@/infrastructure/utils/bus";
import H5Video from "@/shared-ui/panel/H5Video";
import usrCommon from "@/visualization-core/hooks/useCommon";

import styles from "./videoModel.module.less";

export const VideoModel = defineComponent({
  name: "VideoModel",
  props: {
    parameter: { type: null, required: false, default: {} },
    title: { type: String, required: true, default: "" },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { videoList } = usrCommon();
    let cameraList = ref<VideoType[]>([]);
    const cameraListTotal = ref([]);
    const num = ref(0);

    interface Props {
      parameter?: any;
      title: string;
      showModal: boolean;
    }
    const changePage = () => {
      cameraList.value = cameraListTotal.value[num.value];
    };
    // 获取视频列表
    async function getVideo() {
      cameraListTotal.value = await videoList();
      if (cameraListTotal.value.length !== 0) {
        cameraList.value = cameraListTotal.value[num.value];
      }
    }
    onMounted(() => {
      getVideo();
    });
    const closeModal = () => {
      emit("close");
    };
    const clickCamera = (item) => {
      bus.emit("switchCamera", item);
    };

    return (): JSX.Element => (
      <>
        <Modal
          title="监控列表"
          width={1040}
          modelValue={props.showModal}
          onUpdate:modelValue={(v) => {
            props.showModal = v;
          }}
          onClose={closeModal}
          wrapClassName="modal-table-device"
        >
          <div class="group">
            {cameraList.map((item, index) => (
              <div class="camera" key={index} onClick={clickCamera(item)}>
                {" "}
                <H5Video cameraItem={item} idStr={item.token + index}></H5Video>
              </div>
            ))}
          </div>
          <dev style="text-align: right;">
            {" "}
            <a-pagination
              current={num.value}
              onUpdate:current={(v) => {
                num.value = v;
              }}
              onChange={changePage}
              total={cameraList.length - 1}
            />
          </dev>
        </Modal>
      </>
    );
  },
});

export default VideoModel;
