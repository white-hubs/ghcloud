<template>
  <div class="pageCard">
    <div class="pageCard-box" v-for="(item, index) in cardData" :key="index">
      <div class="pageCard-box-top">
        <div class="pageCard-box-top-left">
          <div class="pageCard-box-top-left-title">
            <div style="padding-top: 2px">
              {{ item.deviceName }}
            </div>
            <div style="margin-left: 6px">
              <div v-if="item.collection" @click="collectorDevice(item, index)">
                <a-image
                  :width="20"
                  :height="20"
                  :preview="false"
                  :src="sz1Url"
                ></a-image>
              </div>
              <div v-else @click="collectorDevice(item, index)">
                <a-image
                  :width="20"
                  :height="20"
                  :preview="false"
                  :src="sz2Url"
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
            v-if="item.images.length > 0"
            :width="80"
            :height="80"
            :src="item.images[0].path"
          ></a-image>
          <a-image
            v-else
            :width="80"
            :height="80"
            :src="xfUrl"
          ></a-image>
        </div>
        <div class="pageCard-box-content-right">
          <div>
            设备状态:
            <span v-if="item.deviceStatus == 'NORMAL'" style="color: #5ccd4d">
              正常
            </span>
            <span v-if="item.deviceStatus == 'OFFLINE'" style="color: #fba33f">
              离线
            </span>
            <span v-if="item.deviceStatus == 'ALARM'" style="color: #ff4070">
              报警
            </span>
            <span v-if="item.deviceStatus == 'TROUBLE'" style="color: #fba33f">
              故障
            </span>
            <span
              v-if="item.deviceStatus == '' || item.deviceStatus == null"
              style="color: #fba33f"
            >
              暂无状态
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import { useRouter } from "vue-router";

const PM = '/resource/v1/powermonitor-migrate'
const sz1Url = `${PM}/sz1.png`
const sz2Url = `${PM}/sz2.png`
const xfUrl = `${PM}/xf.png`

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
    const { proxy } = getCurrentInstance();
    const data = ref();
    // 收藏
    const collectorDevice = async (item, index) => {
      const data = await proxy.$api.addDeviceCollection({
        applicationCode: "ELECTRICAL",
        deviceId: item.deviceId,
      });
      if (data) {
        props.cardData[index].collection = !props.cardData[index].collection;
        proxy.$message.success("操作成功");
        emit("updata", true);
      }
    };
    const handelDetail = record => {
      router.push({
        path: props.deilPath,
        query: { type: "detail", deviceId: record.deviceId },
      });
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    return {
      ...toRefs(state),
      collectorDevice,
      handelDetail,
      sz1Url,
      sz2Url,
      xfUrl,
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
    width: 23%;
    height: 176px;

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
      height: 70px;
      background: #f5f7fa;
      display: flex;
      justify-content: space-between;
      padding: 10px 20px 20px 20px;
      .pageCard-box-top-left-title {
        font-size: 16px;
        font-weight: bold;
      }
      .pageCard-box-top-left-item {
        font-size: 14px;
        font-weight: 400;
        color: #5a5b5b;
      }
      .pageCard-box-top-right {
        font-size: 14px;
        padding-top: 10px;
      }
    }
    .pageCard-box-top-left-title {
      display: flex;
      justify-content: flex-start;
    }
    .pageCard-box-top:hover {
      height: 70px;
      background: #397df1;
      display: flex;
      justify-content: space-between;
      padding: 10px 20px 20px 20px;
      .pageCard-box-top-left-title {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
      }
      .pageCard-box-top-left-item {
        font-size: 14px;
        font-weight: 400;
        color: #fff;
      }
      .pageCard-box-top-right {
        font-size: 14px;
        padding-top: 10px;
        color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>
