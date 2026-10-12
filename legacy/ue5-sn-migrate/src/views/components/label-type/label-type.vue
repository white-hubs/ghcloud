<template>
  <div class="model-time-option">
    <a-dropdown :getPopupContainer="(triggerNode) => triggerNode.parentNode">
      <template #overlay>
        <div class="list">
          <div class="list-item flex-center" v-for="(item, index) in dataTypeList" :key="index"
            @click="handelLabelClick(item)">
            <span>{{ item.name }}</span>
          </div>
        </div>
      </template>
      <div class="btn flex-center">
        <span>{{ selectedLabel }}</span>
      </div>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { storeMarket } from "@/piniaStore/other";
import { batchAddDeviceIcon, dataTypeList } from '@/views'

const piniaStoreMarket = storeMarket();
const selectedLabel = ref(dataTypeList[0].name)

const handelLabelClick = (item)=>{
  selectedLabel.value = item.name
  piniaStoreMarket.currentDataType = item.key
  batchAddDeviceIcon()
}
</script>
<style lang="less" scoped>
    .btn {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      width: 58px;
      border-radius: 6px 6px 6px 6px;
      cursor: pointer;
      color: #fff;

      img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }

      &.camera-view {
        margin-left: 20px;
      }
    }

    .list {
      background: rgba(0, 0, 0, 0.3);

      &-item {
        color: #ffffff;
        height: 36px;
        min-width: 68px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        img {
          width: 24px;
          height: 24px;
          margin-right: 6px;
        }
      }
    }
</style>