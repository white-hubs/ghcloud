<template>
  <div style="overflow: auto; padding-bottom: 40px;" class="baseHeight">
    <BaseInfo title="基本信息" :baseInfo="baseInfo" />
    <div v-if="baseInfo&&baseInfo.baseArchivesInfo.status.onlineState">
      <a-row :gutter="16">
        <a-col :span="12">
          <ListData title="现场数据" :baseInfo="baseInfo" :propsCodeList="propsCodeList" :attributeValue="attributeValue" />
        </a-col>
        <a-col :span="12">
          <InputTabData title="输入数据" :propsCodeList="propsCodeList" :attributeValue="attributeValue" />
        </a-col>
      </a-row>
    </div>
    <div>
      <a-row :gutter="16">
        <a-col :span="12">
          <BatteryTabData title="电池数据" :propsCodeList="propsCodeList" :attributeValue="attributeValue" />
        </a-col>
        <a-col :span="12">
          <OutData title="输出数据" :propsCodeList="propsCodeList" :attributeValue="attributeValue" />
        </a-col>
      </a-row>
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
import ListData from "./components/list-data.vue";
import BatteryTabData from "./components/battery-tab-data.vue";
import OutData from "./components/out-data.vue";
import InputTabData from "./components/input-tab-data.vue";

export default defineComponent({
  components: {
    BaseInfo,
    ListData,
    BatteryTabData,
    OutData,
    InputTabData,
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
  setup(props) {
    /*获取table高度*/
    const getScrollHeight = async () => {
      // 等待下一个DOM更新周期
      await nextTick()
      const tableBody = document.getElementsByClassName("content-table")[0];
      const tabBar = document.getElementsByClassName("ant-tabs-bar")[1]
      const pageContent = document.getElementsByClassName('baseHeight')[0]
      pageContent.style.height = `${tableBody.clientHeight - (tabBar?.clientHeight??0) + 20}px`
    };
    onMounted(async () => {
      await getScrollHeight();
    })
  }
});
</script>