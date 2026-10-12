<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    :title="deviceItem?.name || '--'"
    @cancel="close"
    @ok="close('ok')"
    :confirmLoading="panelLoading"
  >
  <div class="panelRefBox">
    <div class="panelRefBox-left">
        <transition name="h1">
          <img src="/resource/v1/accesscontrol-migrate/btn2.png" alt="" v-if="isOpen" />
        </transition>
        <transition name="h1">
          <img src="/resource/v1/accesscontrol-migrate/btn1.png" alt="" v-if="!isOpen" />
        </transition>
    </div>
    <div class="panelRefBox-right">
      <a-form ref="panelRef">
        <a-form-item label="启停控制" name="name">
          <a-radio-group button-style="solid" v-model:value="controlOption" @change="changeType">
            <a-radio-button value="1">开启</a-radio-button>
            <a-radio-button value="2">关闭</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="远程控制" name="name">
          <a-radio-group  button-style="solid" v-model:value="controlOption" @change="changeType">
            <a-radio-button value="0">常开</a-radio-button>
            <a-radio-button value="3">常关</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
  </div>
  <div class="panelRefBox-bottom">
    <div class="panelRefBox-left-item" style="margin-right: 20px; margin-top: 8px;line-height: 1;" >
      当前状态:
      <span style="color: greenyellow" v-if="deviceStatus == 0">
        初始状态
      </span>
      <span v-if="deviceStatus == 1">开门状态</span>
      <span v-if="deviceStatus == 2">关门状态</span>
      <span v-if="deviceStatus == 3">离线状态</span>
      <span v-if="deviceStatus == 4">--</span>
    </div>
  </div>
  </a-modal>
</template>

<script>
import {
  ref,
  toRefs,
  unref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useStore } from "vuex";
const btn1Png = '/resource/v1/accesscontrol-migrate/btn1.png'
const btn2Png = '/resource/v1/accesscontrol-migrate/btn2.png'

export default defineComponent({
  setup(props, { emit, expose }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const spinning = ref(false);
    const state = reactive({
      deviceStatus: 4, // 0 初始状态，1 开门状态， 2 关门状态，3 离线状态， 
      controlOption: '',
      isOpen: false,
      img: {
        btn1Png,
        btn2Png,
      },
      modalVisible: false,
      deviceItem: null,
      panelLoading: false,
    });
    const application = computed(() => {
      const isString = typeof store.getters.currentApplication == "string";
      return isString
        ? JSON.parse(store.getters.currentApplication)
        : store.getters.currentApplication;
    });
    const close = async (data) => {
      if (data === "ok") {
        proxy.$api.controlDoor({
          doorIndexCodes: state.deviceItem.outBusinessId || state.deviceItem.businessId,
          controlType: state.controlOption,
        })
        .then(() => {
          proxy.$message.success("操作成功");
          state.modalVisible = false;
          emit("close");
        }).catch(() => {

        });
      } else {
        state.modalVisible = false;
        emit("close");
      }
    };
    const getAssetsImge = (url) => {
      return new URL(`../../../assets/images/${url}`, import.meta.url).href
    }
    const openModal = (data) => {
      state.modalVisible = true;
      state.deviceItem = data
      state.deviceStatus = 4
      state.controlOption = ''
      state.isOpen = false
      getDeviceStatus()
    };
    const getDeviceStatus = async (id) => {
      try {
        proxy.$api.inspectgetStatus({
          id: state.deviceItem.id,
        }).then(res => {
          state.deviceStatus = res ? res : 4;
          state.controlOption = state.deviceStatus.toString()
          changeType()
        }).catch(() => {
          state.deviceStatus = 4;
          state.controlOption = state.deviceStatus.toString()
          changeType()
        });
      } catch (error) {
        state.deviceStatus = 4;
        state.controlOption = state.deviceStatus.toString()
        changeType()
      }
    };
    const changeType = () => {
      if(state.controlOption == '0' || state.controlOption == '1'){
        state.isOpen = true
      }
      if(state.controlOption == '2' || state.controlOption == '3'){
        state.isOpen = false
      }
    };
    expose({
      openModal
    })
    return {
      close,
      openModal,
      spinning,
      getDeviceStatus,
      ...toRefs(state),
      changeType,
      getAssetsImge
    };
  },
});
</script>
<style lang="less" scoped>
.ant-table-body{

  &::-webkit-scrollbar {
    width: 10px !important; 
    height: 10px !important;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px !important;
    box-shadow: inset 0 0 5px rgba(97, 184, 179, 0.1) !important;
    background: #b2b2b2 !important;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(87, 175, 187, 0.1) !important;
    border-radius: 10px !important;
    background: #eaeaea !important;
  }


}

.panelRefBox {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  .panelRefBox-left {
    width: 240px;
    height: 200px;
    border: 1px solid #ebebeb;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    img{
      width: 170px;
      position:absolute;
      top:50%;
      left: 50%;
      transform: translate(-50%,-50%);
      cursor: pointer;
    }
  }
  .panelRefBox-right {
    width: 50%;
  }
}
.panelRefBox-bottom {
  display: flex;
  justify-content: flex-start;
}
</style>
