<template>
  <div style="overflow: auto; padding-bottom: 40px;" class="baseHeight">
    <BaseInfo title="基本信息" :baseInfo="baseInfo" />
    <div class="row" v-if="baseInfo&&baseInfo.baseArchivesInfo.status.onlineState">
      <ChartData :propsCodeList="propsCodeList" :dataArr="dataArr" :attributeValue="attributeValue" :subscribeRealTimeData="subscribeRealTimeData" />
    </div>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount, nextTick,
  onMounted, reactive, ref, toRefs, watch, onUnmounted
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BaseInfo from "../common/base-info.vue";
import ChartData from "./chart-data.vue";

export default defineComponent({
  components: {
    BaseInfo,
    ChartData,
  },
  props: {
    baseInfo: {
      type: Object,
      default: {
        fileVO: {
          path: ""
        }
      }
    },
    attributeValue: {
      type: Object,
      default: {}
    },
    propsCodeList: {
      type: Array,
      default: []
    },    
    dataArr: {
      type: Array,
      default: []
    },
    subscribeRealTimeData: {
      type: Array,
    }
  },
  setup(props) {
    /*获取table高度*/
    const getScrollHeight = async () => {
      // 等待下一个DOM更新周期
      await nextTick()
      const tableBody = document.getElementsByClassName("content-table")[0];
      const tabBar = document.getElementsByClassName("ant-tabs-bar")[0]
      const pageContent = document.getElementsByClassName('baseHeight')[0]
      if (pageContent) {
        pageContent.style.height = `${tableBody.clientHeight - tabBar?.clientHeight}px`
      }
    };
    onMounted(async () => {
      await getScrollHeight();
    })
  }
});
</script>
<style lang="less" scoped>
.title {
  margin-top: 12px;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 700;
  font-size: 16px;
  color: #1D2129;
  line-height: 24px;
  padding-bottom: 5px;
  border-bottom: 1px solid #E4E7EDFF;
}
</style>