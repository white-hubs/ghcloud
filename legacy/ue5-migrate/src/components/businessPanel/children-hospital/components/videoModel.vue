<template>
  <Modal title="监控列表" :width="1040" v-model="props.showModal" @close="closeModal" wrapClassName="modal-table-device">
    <div class="group">
      <div class="camera" v-for="(item, index) in cameraList" :key="index" @click="clickCamera(item)">
        <H5Video :cameraItem="item" :idStr="item.token + index"></H5Video>
      </div>
    </div>
    <dev style="text-align: right;">
      <a-pagination v-model:current="num" @change="changePage" :total="cameraList.length-1"/>
    </dev>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import Modal from "@/components/modal-table/modal-layout.vue";
import bus from "@/utils/bus";
import { VideoType } from "@/api/models/vmonitor";
import H5Video from "@/components/businessPanel/public/H5Video.vue";
import usrCommon from "../../../hooks/useCommon";

const emit = defineEmits(["close"]);
const {
  videoList,
} = usrCommon();
let cameraList = ref<VideoType[]>([]);
const cameraListTotal = ref([]);
const num = ref(0);

interface Props {
  parameter?: any;
  title: string;
  showModal: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showModal: false,
  parameter: {},
});
const changePage = ()=>{
  cameraList.value = cameraListTotal.value[num.value];
}
// 获取视频列表
async function getVideo() {
  cameraListTotal.value = await videoList();
  if (cameraListTotal.value.length !== 0) {
    cameraList.value = cameraListTotal.value[num.value];
  }
}
onMounted(()=>{
  getVideo()
})
const closeModal = () => {
  emit("close");
};
const clickCamera = (item) => {
  bus.emit("switchCamera", item);
};
</script>
<style lang="less" scoped>
.group {
  height: 400px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .camera {
    width: 168px;
    height: 90px;
    margin-top: 10px;
  }
}
</style>