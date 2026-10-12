<template>
  <div style="overflow: auto; padding-bottom: 40px;" class="baseHeight">
    <BaseInfo title="基本信息" :baseInfo="baseInfo" />
    <template v-if="baseInfo&&baseInfo.baseArchivesInfo.status.onlineState">
      <div class="row">
        <div class="title">现场数据</div>
        <ChartData :attributeValue="attributeValue" :attrData="attrData" />
      </div>
      <div v-if="controlData.length" :style="show? 'width: 180%;transform: translateX(-200px)':''">
        <div class="item-title">设备控制</div>
        <div class="fireControlMsg-control">
          <a-row :gutter="[16, 16]" style="margin-left: 0; margin-right: 0">
            <a-col :span="8" v-for="item in controlData" :key="item.attributeCode">
              <div class="column">
                <switch-attribute v-if="item.dataType.toLowerCase() === 'boolean'" :attributeItem="item"
                  :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></switch-attribute>
                <enumerate-attribute v-else-if="item.dataType.toLowerCase() === 'enum'" :attributeItem="item"
                  :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></enumerate-attribute>
                <set-string-attribute v-else-if="item.dataType.toLowerCase() === 'string'" :attributeItem="item"
                  :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></set-string-attribute>
                <set-value-attribute v-else :attributeItem="item" :deviceId="deviceId"
                  :curValue="attributeValue[item.attributeCode]"></set-value-attribute>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </template>
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
import EnumerateAttribute from '@/views/pages/components/deviceAttribute/enumerateAttribute.vue'
import setValueAttribute from '@/views/pages/components/deviceAttribute/setValueAttribute.vue'
import setStringAttribute from '@/views/pages/components/deviceAttribute/setStringAttribute.vue'
import switchAttribute from '@/views/pages/components/deviceAttribute/switchAttribute.vue'

export default defineComponent({
  components: {
    EnumerateAttribute,
    setValueAttribute,
    setStringAttribute,
    switchAttribute,
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
    attrData: {
      type: Object,
      default: []
    },
    readAndWritData: {
      type: Array,
      default: []
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
      if (pageContent) {
        pageContent.style.height = `${tableBody.clientHeight - (tabBar?.clientHeight??0)}px`
      }
    };
    const controlData = ref([])
    onMounted(async () => {
      await getScrollHeight();
    })
    watch(() => props.readAndWritData, () => {
      controlData.value = props.readAndWritData
    }, { deep: true })
    return {
      controlData
    }
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