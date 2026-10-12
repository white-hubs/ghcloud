<template>
  <div class="panel-config-container">
    <div class="config-title">
      <div class="title">面板配置</div>
      <div class="tip-close">
        <span>最多选4个</span>
        <CloseCircleOutlined style="font-size: 16px;color: #000;" @click="handleClose" />
      </div>
    </div>
    <div class="line"></div>
    <div class="config-content">
      <div class="product-type-list">
        <div :class="[activeModelTypeId===item.deviceProdId&&'active','list-item']" v-for="item in modelTypeList"
          :key="item.deviceProdId" @click="()=>handleClickModelType(item)">
          {{ item.deviceProdName }}
        </div>
      </div>
      <div class="attr-config">
        <a-checkbox-group v-model:value="checkedAttr" @change="handleCheckBoxChange">
          <div class="checkbox-item" v-for="item in productAttrs" :key="item.propCode">
            <a-checkbox :value="item.propCode" :disabled="item.disabled">{{ item.propName }}</a-checkbox>
          </div>
        </a-checkbox-group>
      </div>
    </div>
  </div>
</template>


<script lang="jsx">
import { defineComponent, reactive, getCurrentInstance, toRefs, watch, computed } from "vue";
import { CloseCircleOutlined } from '@ant-design/icons-vue'
import { usePanelConfigAttr } from "@/hooks/device-panel";
import { useStore } from "vuex";
import { cubeDeviceCenterService } from "@/api/service";

export default defineComponent({
  name: 'Preview',
  props: {
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  components: { CloseCircleOutlined },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const { setSelectedDeviceModelAttr, activeModelTypeId, setActiveModelTypeId } = usePanelConfigAttr()
    const store = useStore()
    const state = reactive({
      modelTypeList: [],
      productAttrs: [],
      checkedAttr: []
    })
    const application = computed(() => {
      return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
    });
    const handleClose = () => {
      emit('update:visible', false)
    }
    // 处理选中类型
    const handleClickModelType = (item) => {
      activeModelTypeId.value = item.deviceProdId
      getProductModelsAttr()
      getModelPanelConfig()
    }
    // 获取类型对应的属性
    const getProductModelsAttr = async () => {
      const result = await cubeDeviceCenterService.getProdListDetail({ prodIds: activeModelTypeId.value })
      if (result && result.length) {
        state.productAttrs = result[0].productPropVoList
        handleProductAttr()
      }
    }
    // 处理点击复选框
    const handleCheckBoxChange = (checkedValue) => {
      const selectedDeviceModelAttr = state.productAttrs.filter(item => checkedValue.includes(item.propCode))
      setSelectedDeviceModelAttr(selectedDeviceModelAttr)
      handleProductAttr()
    }
    // 处理属性
    const handleProductAttr = () => {
      // 判断选中的与当前code是否有交集
      const productAttrCodes = state.productAttrs.map(item => item.propCode)
      const checkedAttrSet = new Set(state.checkedAttr)
      const intersect = productAttrCodes.filter(item => checkedAttrSet.has(item)) // 交集
      if (intersect.length) {
        state.checkedAttr = intersect
      } else {
        state.checkedAttr = []
      }

      if (state.checkedAttr.length >= 4) {
        state.productAttrs = state.productAttrs.map(item => {
          return {
            ...item,
            disabled: !state.checkedAttr.includes(item.propCode)
          }
        })
      } else {
        state.productAttrs = state.productAttrs.map(item => {
          return {
            ...item,
            disabled: false
          }
        })
      }
    }
    // 获取产品型号数据
    const getProductModels = async () => {
      const result = await proxy.$api.getApplicationProductModels({ applicationCode: application.value.code })
      state.modelTypeList = result
      if (result && result.length) {
        handleClickModelType(result[0])
      }
    }
    // 获取当前型号的面板配置
    const getModelPanelConfig = async () => {
      const params = {
        businessKey: activeModelTypeId.value,
        sceneType: 'LIST_PANEL',
        applicationCode: application.value.code
      }
      const result = await proxy.$api.getDevicePanelConfig(params)
      if (result) {
        const selectedDeviceModelAttr = JSON.parse(result.panelConfig)
        state.checkedAttr = selectedDeviceModelAttr.map(item => item.propCode)
        handleProductAttr()
        setSelectedDeviceModelAttr(selectedDeviceModelAttr)
      } else {
        state.checkedAttr = []
        setSelectedDeviceModelAttr([])
        handleProductAttr()
      }

    }
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          getProductModels()
        }
      },
      { immediate: true }
    )
    return {
      ...toRefs(state),
      handleClose,
      activeModelTypeId,
      handleClickModelType,
      handleCheckBoxChange,
    };
  },
});
</script>
<style scoped lang='less'>
.panel-config-container {
  height: 100%;
  padding: 14px;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.04);

  .config-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 16px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #1D2129;
    }

    .tip-close {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 400;
      color: #999999;
      cursor: pointer;
    }
  }

  .line {
    height: 1px;
    margin-top: 10px;
    background: #E4E7ED;
  }

  .config-content {
    flex: 1;
    margin-top: 4px;
    display: flex;


    .product-type-list {
      height: 100%;
      padding: 12px 0;
      min-width: 150px;
      flex-shrink: 0;


      background: #F9FAFC;

      .list-item {
        font-size: 14px;
        font-family: Source Han Sans, Source Han Sans;
        font-weight: 400;
        color: #1D2129;
        padding: 9px 0 9px 20px;
        cursor: pointer;
      }

      .active {
        background: #E6F7FF;
        font-weight: 500;
        color: #1890FF;
        border-radius: 0px 0px 0px 0px;
      }
    }

    .attr-config {
      height: 100%;
      flex: 1;

      :deep(.ant-checkbox-group) {
        width: 100%;
      }

      .checkbox-item {
        padding: 13px 0 11px 20px;

        &:hover {
          background: #F9FAFC;
        }
      }
    }

  }

  // height: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;
}
</style>