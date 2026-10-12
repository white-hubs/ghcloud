<template>
  <div class="config">
    <div class="item-title">
      <a-space :size="24">
        <span>设备联动</span>
        <a-switch
          v-model:checked="deviceLinkageConfig.enabled"
          :disabled="type == 'detail' ? true : false"
          checked-children="开"
          un-checked-children="关"
        />
      </a-space>
    </div>
    <div class="row">
      <a-form-item label="联动设备">
        <a-button type="primary" @click="addLinkageDeviceConfig" v-if="type !== 'detail'">
          添加
          <PlusOutlined />
        </a-button>
      </a-form-item>
      <a-form-item
        v-for="(item, index) in deviceLinkageConfig.actionConfig"
        :key="item.uid"
      >
        <!-- <g-link-item
          v-model:value="deviceLinkageConfig.actionConfig"
          :config="item"
          :key="index"
        ></g-link-item> -->
        <linkage-item
          v-model:value="deviceLinkageConfig.actionConfig"
          :config="item"
          :key="index"
        ></linkage-item>
        <a-button v-if="type !== 'detail'" type="link" danger @click="remove(item)">
          删除
        </a-button>
      </a-form-item>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import linkageItem from "./linkageItem.vue";
import { useRoute } from "vue-router";
export default defineComponent({
  components: { PlusOutlined, linkageItem },
  props: ["actionConfig"],
  setup(props) {
    const route = useRoute();
    const { type } = route.query;
    const state = reactive({
      deviceLinkageConfig: {
        actionType: "IOT_DEVICE_ACTION",
        enabled: true,
        actionConfig: [],
      },
    });
    watch(
      () => props.actionConfig,
      (value) => {
        if (value) {
          let newData = JSON.parse(JSON.stringify(props.actionConfig));
          let newArr = newData.actionConfig.map((res) => {
            res.uid = guid();
            return res;
          });
          state.deviceLinkageConfig = newData;
        }
      }
    );
    const addLinkageDeviceConfig = () => {
      state.deviceLinkageConfig.actionConfig.push({
        uid: guid(),
        deviceProdCategoryCodeConcat: null,
        deviceProdId: null,
        id: null,
        code: null,
        name: null,
        propCode: null,
        propName: null,
        executeMode: "AUTOMATIC",
        propValue: null,
      });
    };
    const remove = (index) => {
      let inx = state.deviceLinkageConfig.actionConfig.findIndex((res) => {
        return index.uid == res.uid;
      });
      state.deviceLinkageConfig.actionConfig.splice(inx, 1);
    };
    const guid = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    return {
      ...toRefs(state),
      addLinkageDeviceConfig,
      remove,
      type,
    };
  },
});
</script>

<style lang="less" scoped>
.config {
  width: 100%;
}
.row {
  width: 100%;
  :deep(.ant-form-item) {
    width: 100% !important;
  }
  :deep(.ant-form-item-control-input) {
    width: 100%;
  }
}
:deep(.flex-start) {
  display: flex;
}
</style>
