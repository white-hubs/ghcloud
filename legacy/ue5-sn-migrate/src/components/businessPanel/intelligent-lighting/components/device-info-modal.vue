<template>
  <!-- 设备信息弹窗 -->
  <Modal title="设备名称" :width="540" v-model="props.showModal"  :submitLoading="isLoading"
    wrapClassName="device-info-modal">
    <template #modal-content>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="1" tab="基本信息">
          <div class="deviceInfo">
            <img class="deviceImg" :src="getAssetsImage('device-1.png')" alt="">
            <div class="right">
              <div class="detail">
                <div class="row">
                  <div class="item"><span class="t1">设备编号：</span><span class="s1">QDJ2334</span></div>
                  <div class="item"><span class="t1">设备类型：</span><span class="s1">摄像头</span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">设备品牌：</span><span class="s1">品牌名称</span></div>
                  <div class="item"><span class="t1">设备型号：</span><span class="s1">SXT-9987</span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">所属科室：</span><span class="s1">心血管内科</span></div>
                  <div class="item"><span class="t1">安装时间：</span><span class="s1">2022-10-21</span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">所属区域：</span><span class="s1">住院楼</span></div>
                  <div class="item"><span class="t1">安装位置：</span><span class="s1">海海一医院住院大楼1号楼203室</span></div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="实时数据" force-render>
          <div class="deviceInfo">
            <img class="deviceImg" :src="getAssetsImage('device-1.png')" alt="">
            <div class="right">
              <div class="detail">
                <div class="row">
                  <div class="item"><span class="t1">状态：</span><span class="s1">离线</span></div>
                  <div class="item"><span class="t1">故障：</span><span class="s1">--</span></div>
                  <div class="item"><span class="t1">告警：</span><span class="s1">离线告警</span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">开关：</span><span class="s1"></span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">光照度：</span><span class="s1"></span></div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="异常记录">
          <div class="deviceInfo">
            <img class="deviceImg" :src="getAssetsImage('device-1.png')" alt="">
            <div class="right">
              <div class="detail">
                <div class="row">
                  <div class="item"><span class="t1">告警总次数：</span><span class="s1">334</span></div>
                  <div class="item"><span class="t1">故障总次数：</span><span class="s1">22</span></div>
                </div>
                <div class="row">
                  <div class="item"><span class="t1">故障总次数：</span></div>
                </div>
                
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
  </Modal>
</template>
<script setup lang="ts">
import Modal from "@/components/modal-table/modal-layout.vue";
import { getAssetsImage } from '@/utils/getImage';
import { reactive, ref, shallowRef, watch } from "vue";
import {UeClient} from "@ghcloud/cube-visual-sdk";
import type { FormInstance } from 'ant-design-vue/es'

const emit = defineEmits(['update:modelValue', 'ok'])
const modalFormRef = shallowRef<FormInstance>()

const props = withDefaults(defineProps<{
  parameter?: any;
  showModal: boolean;
}>(), {
  showModal: true,
  parameter: {},
});
watch(() => props.showModal, () => {
})

const isLoading = ref(false)
const switchButton = ref(false)
const activeTab = ref('1')

</script>
<style lang="less" scoped>
:deep(.ant-tabs-tab-btn){
  color:#fff;
  line-height: 20px;
  font-size: 14px;
  min-width: 70px;
  text-align: center;
}
:deep(.ant-tabs-tab-active){
  background: linear-gradient(180deg, rgba(41,137,255,0) 0%, rgba(41,137,255,0.5) 100%);
  font-size: 14px;
  color: #fff;
  line-height: 14px;
}
:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn ){
    color: #fff;
    text-shadow: none;
    // padding: 0 10px;
}
:deep(.ant-tabs-nav::before){
  border-color: rgba(255,255,255,0.1);
}
:deep(.ant-modal-footer){
  display: none !important;
}
.device-info-modal {
  .deviceInfo {
    display: flex;
    // align-items: center;

    .deviceImg {
      width: 150px;
      height: 150px;
    }

    .right {
      margin-left: 10px;
      flex: 1;

      .detail {
        .row {
          display: flex;
          margin-bottom: 5px;
          font-size: 12px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #ABB8CB;
          line-height: 22px;

          .item {
            display: flex;
            flex: 1;
          }

          .t1 {
            color: #ABB8CB;
            white-space: nowrap;
          }

          .s1 {
            color: #fff;
            line-height: 24px;
          }
        }
      }

    }
  }
}</style>
