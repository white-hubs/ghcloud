<template>
  <div class="control">
    <template v-if="readData.length > 0">
      <div class="state">
        <div class="fireControlMsg">
          <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
            <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
            <div class="fireControlMsg-item-right">
              <template v-if="item.attributeKeyValueVos.length && item.attributeKeyValueVos[0].value !== undefined">
                {{ 
                  item.attributeKeyValueVos.find(e=>e.value==attributeValueRead[item.attributeCode])?.keyName ||
                  item.attributeKeyValueVos.find(e=>e.value==attributeValueRead[item.attributeCode])?.label ||
                   '--' }}
              </template>
              <template v-else>
                {{ attributeValueRead[item.attributeCode] || '--'}}{{ attributeValueRead[item.attributeCode]?item.unitName:'' }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="fireControlMsg-control">
      <div class="column" v-for="item in readAndWritData" :key="item.attributeCode">
        <switch-attribute  :code="props.code" class="attribute" v-if="item.dataType === 'boolean'" :attributeItem="item" :deviceId="id"
          :curValue="attributeValue[item.attributeCode]"></switch-attribute>
        <enumerAteattribute class="attribute" v-else-if="item.dataType === 'enum'" :attributeItem="item" :deviceId="id"
          :curValue="attributeValue[item.attributeCode]" :code="props.code"></enumerAteattribute>
        <set-value-attribute class="attribute" v-else :attributeItem="item" :deviceId="id"
          :curValue="attributeValue[item.attributeCode]"></set-value-attribute>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import enumerAteattribute from "./deviceAttribute/enumerateAttribute.vue";
import setValueAttribute from "./deviceAttribute/setValueAttribute.vue";
import switchAttribute from "./deviceAttribute/switchAttribute.vue";

import { iotSocketStore } from "@/piniaStore/iotSocketStore";
import { useSubscribeStore } from "@/piniaStore/socketSubscribe";
const piniaIot = iotSocketStore()
const piniaUseSubscribeStore = useSubscribeStore();
const props = defineProps({
  id: {
    type: [String],
    default: "",
  },
  readAndWritData: {
    type: [Array],
    default: [],
  },
  readData: {
    type: [Array],
    default: [],
  },
  code: {
    type: [String],
    default: "",
  },
  deviceAttributes: {
    type: [Array],
    default: [],
  }
});

const readAndWritData = ref<any>(props.readAndWritData);
const attributeValue = ref();

attributeValue.value = Object.fromEntries(
  props.readAndWritData.map((item: any) => [item.attributeCode, "--"])
);

const readData = ref<any>(props.readData);
const attributeValueRead = ref();
attributeValueRead.value = Object.fromEntries(
  props.readData.map((item: any) => [item.attributeCode, "--"])
);

watch(() => piniaUseSubscribeStore.subscribeData, (val: any) => {
  if (val.deviceId === props.id) {
    val.updates.forEach(item=>{
      if (attributeValueRead.value.hasOwnProperty(item.key)) {
        attributeValueRead.value[item.key] = item.value;
      }
      if (attributeValue.value.hasOwnProperty(item.key)) {
        attributeValue.value[item.key] = item.value;
      }
    })
  }
})

onMounted(async () => {
  const {dataArr} = await piniaIot.iotSocket.deviceDetail({
    deviceId: props.id,
    withSnapShot:true,
    withPropertySpec:true
  })
  readData.value = dataArr.filter((item) => item.permission === "READ");
  readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
  attributeValueRead.value = Object.fromEntries(
  readData.value.map((item: any) => [item.attributeCode, item.value])
  );
  attributeValue.value = Object.fromEntries(
    readAndWritData.value.map((item: any) => [item.attributeCode, item.value])
  );
})

onUnmounted(()=>{
  piniaIot.iotSocket.unsubscribe()
})
</script>

<style lang="less" scoped>
.attribute {
  margin-top: 10px;
}

.control {
  font-size: 14px;
  height: 340px;
  overflow-y: scroll;
  padding-bottom: 10px;
}


.title {
  font-weight: 500;
  color: #FFFFFF;
  font-size: 20px;
  margin-top: 10px;
}

.state {
  min-height: 150px;
}

.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;

  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;

    .fireControlMsg-item-left {
      font-weight: 400;
      color: #B7C5D3;
    }

    .fireControlMsg-item-right {
      margin-left: 10px;
      color: #fff
    }
  }

  .bg {
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
}
</style>
