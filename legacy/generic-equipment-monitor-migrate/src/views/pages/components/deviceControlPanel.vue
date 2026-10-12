<template>
  <div class="device">
    <!-- 设备开关 -->
    <div class="device-startOrStop-main" v-if="BOOLEANData.length > 0">
      <div
        class="device-startOrStop"
        v-for="(item, index) in BOOLEANData"
        :key="index"
      >
        <span>{{ item.attributeName }}:&nbsp;</span>
        <a-radio-group
          button-style="solid"
          v-model:value="item.value"
          @change="changeType"
        >
          <a-radio-button
            v-for="(child, childIndex) in item.attributeKeyValueVos"
            :key="childIndex"
            :value="child.value"
          >
            {{ child.keyName == 1 ? "开" : "关" }}
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 枚举形式 -->
    <div class="device-enum-main" v-if="ENUMData.length > 0">
      <div class="device-enum" v-for="(item, index) in ENUMData" :key="index">
        <span>{{ item.attributeName }}:&nbsp;</span>
        <a-radio-group
          button-style="solid"
          v-model:value="item.value"
          @change="changeType"
        >
          <a-radio-button
            v-for="(child, childIndex) in item.attributeKeyValueVos"
            :key="childIndex"
            :value="child.value"
          >
            <span>{{ child.keyName }}</span>
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 设备控制 -->
    <div class="device-enum-main" v-if="FLOATData.length > 0">
      <div class="device-enum" v-for="(item, index) in FLOATData" :key="index">
        <span>{{ item.attributeName }}: &nbsp;</span>
        <div class="device-enum-control">
          <div class="device-enum-control">
            <div style="padding-top: 8px">
              <span>{{ Number(item.valueMin) }}&nbsp;</span>
            </div>
            <div style="width: 200px">
              <a-slider
                v-model:value="item.value"
                :min="Number(item.valueMin)"
                :max="Number(item.valueMax)"
                @onChange="onChange"
              />
            </div>
            <div style="padding-top: 8px">
              <span>&nbsp;{{ Number(item.valueMax) }}</span>
            </div>
          </div>
          <div>
            <a-input-number
              v-model:value="item.value"
              :min="Number(item.valueMin)"
              :max="Number(item.valueMax)"
              style="margin-left: 16px; width: 80px"
            />
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
export default defineComponent({
  name: "",
  components: {},
  props: {
    BOOLEANData: {
      type: Array,
      defalut: [],
    },
    ENUMData: {
      type: Array,
      defalut: [],
    },

    FLOATData: {
      type: Array,
      defalut: [],
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      timer: null,
    });
    const { proxy } = getCurrentInstance();
    const data = ref();
    const changeType = value => {
      emit("value", value);
    };
    const onChange = value => {
      if (state.timer !== null) {
        clearTimeout(state.timer);
        state.timer = setTimeout(() => {
          emit("value", value);
        }, 2000);
      }
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
    });
    return {
      ...toRefs(state),
      onChange,
      changeType,
    };
  },
});
</script>
<style scoped lang="less">
.device {
  display: flex;
  justify-content: flex-start;
  .device-startOrStop-main {
    display: flex;
    flex-direction: column;
    .device-startOrStop {
      margin-top: 10px;
      width: 100%;
      height: 60px;
      background: #fafafa;
      padding: 10px 20px;
      display: flex;
      align-items: center;
    }
  }
  .device-enum-main {
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    .device-enum {
      margin-top: 10px;
      width: 100%;
      height: 60px;
      background: #fafafa;
      padding: 10px 20px;
      display: flex;
      align-items: center;
    }
  }

  .device-enum-control {
    display: flex;
    justify-content: flex-start;
  }
}
:deep(.ant-radio-button-wrapper) {
  margin-left: 10px;
}
</style>
