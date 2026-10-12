<template>
  <div class="pageCard">
    <div class="pageCard-box" v-for="(item, index) in cardData" :key="index">
      <div class="pageCard-box-top">
        <div class="pageCard-box-top-left">
          <div class="pageCard-box-top-left-title">
            <div class="device-name">
              {{ item.deviceName }}
            </div>
            <div style="margin-left: 6px">
              <div v-if="item.collection" @click="collectorDevice(item, index)">
                <a-image
                  :width="20"
                  :height="20"
                  :preview="false"
                  :src="img.sz1Png"
                ></a-image>
              </div>
              <div v-else @click="collectorDevice(item, index)">
                <a-image
                  :width="20"
                  :height="20"
                  :preview="false"
                  :src="img.sz2Png"
                ></a-image>
              </div>
            </div>
          </div>
          <div class="pageCard-box-top-left-item">
            {{ item.areaName }}
          </div>
        </div>
        <div class="pageCard-box-top-right" @click="handelDetail(item)">
          更多>
        </div>
      </div>
      <div class="pageCard-box-content">
        <div class="pageCard-box-content-left">
          <a-image
            v-if="item.picture&&item.picture.path"
            :width="80"
            :height="80"
            :src="item.picture.path"
          ></a-image>
          <a-image
            v-else
            :width="80"
            :height="80"
            :src="img.devicePng"
          ></a-image>
        </div>
        <div class="pageCard-box-content-right">
          <div>
            设备状态:
            <span v-if="item.deviceStatus" style="color: #5ccd4d">
              正常
            </span>
            <span v-else style="color: #fba33f">
              离线
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
computed,
defineComponent, getCurrentInstance, onBeforeMount,
onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const sz1Png = `${GEM}/sz1.png`
const sz2Png = `${GEM}/sz2.png`
const devicePng = `${GEM}/device.png`

export default defineComponent({
  name: "",
  components: {},
  props: {
    cardData: {
      type: Array,
      default: [
        {
          deviceName: "消防水泵",
          areaName: "南区综合大楼1号",
          status: "正常",
          collection: true,
          images: [],
        },
      ],
    },
    deilPath: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const state = reactive({});
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const applicationCode = ref(null);
    onMounted(() =>{
      const application = computed(() => {
          return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
    })
    // 收藏
    const collectorDevice = async (item, index) => {
      const data = await proxy.$api.addDeviceCollection({
        applicationCode: applicationCode.value,
        deviceId: item.deviceId,
      });
      if (data) {
        props.cardData[index].collection = !props.cardData[index].collection;
        proxy.$message.success("操作成功");
        emit("updata", true);
      }
    };
    const handelDetail = record => {
      history.pushState({},'',`/portal/genericEquipmentMonitor/equipmentMoitorDetail?type=detail&deviceId=${record.deviceId }`)
      // router.push({
      //   path: props.deilPath,
      //   query: { type: "detail", deviceId: record.deviceId },
      // });
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    watch(() => props.cardData, () => {
    })
    return {
      ...toRefs(state),
      collectorDevice,
      handelDetail,
      img: {
        sz1Png,
        sz2Png,
        devicePng,
      },
    };
  },
});
</script>
<style scoped lang="less">
::-webkit-scrollbar {
  width: 0 !important;
}
.pageCard {
  padding: 0px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  .pageCard-box {
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #e5e8ef;
    margin-left: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    .pageCard-box-content {
      padding: 10px 20px 20px 20px;
      height: 100px;
      overflow-y: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .pageCard-box-content-left {
        width: 82px;
        height: 82px;
        background: #f8f8f8;
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #f2f2f2;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .pageCard-box-content-right {
        width: 60%;
      }
    }

    .pageCard-box-top {
      background: #f5f7fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      .pageCard-box-top-left-title {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .device-name{
          width: auto;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .pageCard-box-top-left-item {
        font-size: 14px;
        font-weight: 400;
        color: #5a5b5b;
        width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pageCard-box-top-right {
        font-size: 14px;
        margin-left: 10px;
      }
    }
    .pageCard-box-top:hover {
      background: var(--cube-theme-var--primary-color);
      .pageCard-box-top-left-title {
        color: #fff;
      }
      .pageCard-box-top-left-item {
        color: #fff;
      }
      .pageCard-box-top-right {
        color: #fff;
      }
    }
  }
}
</style>
