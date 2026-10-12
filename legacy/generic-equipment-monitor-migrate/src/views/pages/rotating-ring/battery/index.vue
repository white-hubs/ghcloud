<template>
  <div style="overflow: auto;" class="baseHeight">
    <BaseInfo title="设备信息" :baseInfo="baseInfo" />
    <BatteryTabData title="电池数据" :propsCodeList="propsCodeList" :attributeValue="attributeValue" v-if="baseInfo&&baseInfo.baseArchivesInfo.status.onlineState"/>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,nextTick,
  onMounted, reactive, ref, toRefs, watch, onUnmounted
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import BaseInfo from "../common/base-info.vue";
import BatteryTabData from "./battery-tab-data.vue";

export default defineComponent({
  components: {
    BaseInfo,
    BatteryTabData,
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
    propsCodeList: {
      type: Object,
      default: []
    },
    attributeValue: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {
    /*获取table高度*/
    const getScrollHeight = async () => {
      // 等待下一个DOM更新周期
      await nextTick()
      const tableBody = document.getElementsByClassName("content-table")[0];
      const tabBar = document.getElementsByClassName("ant-tabs-bar")[1]
      const pageContent = document.getElementsByClassName('baseHeight')[0]
      pageContent.style.height = `${tableBody.clientHeight - (tabBar?.clientHeight??0)}px`
    };
   
    onMounted(async () => {
      await getScrollHeight();
    })

  },
});
</script>