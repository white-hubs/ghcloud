<template>
  <div>
    <Modal
      centered
      v-model:visible="showModal"
      :wrap-class-name="license-check-component"
      title="授权到期提醒"
      ok-text="我已知晓"
      :closable="false"
      :cancel-button-props="{ style: { display: 'none' } }"
      @ok="handleClose"
      width="1100px"
    >
      <div style="text-align: center">
        <h1>系统授权剩余【<span style="color:red">{{ expiryDays }}</span>】天到期，请联系服务商处理！</h1>
        <!-- <h2>联系电话：400-105-5388</h2> -->
      </div>
    </Modal>

    <!-- 授权已到期全屏提示 -->
    <div v-if="expiryDays < 0" :class="license-check-fullscreen">
      <WarningOutlined style="color:red;font-size:10vw" />
      <h2>系统授权已到期，禁止登录。请联系服务商处理！</h2>
      <!-- <h2>联系电话：400-105-5388</h2> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Modal } from 'ant-design-vue';
import { WarningOutlined } from '@ant-design/icons-vue';
import { CubeOuaaService, type LicenseInfo } from '@ghcloud/cube-ouaa-service';
import { CubeTerminalEnum } from '@ghcloud/cube-protocol';

export default defineComponent({
  name: 'LicenseCheckComponent',
  components: {
    Modal,
    WarningOutlined,
  },
  emits: ['close'],
  setup(props, { emit }) {
    const licenseInfo = ref<LicenseInfo>();
    const expiryDays = ref(999);
    const showModal = ref(false);

    // 获取授权信息
    onMounted(async () => {
      licenseInfo.value = await new CubeOuaaService({
        token: '',
        tenant: '',
        terminal: CubeTerminalEnum.BUSINESS,
      }).getLicenseInfo();
      expiryDays.value = licenseInfo.value.expiryDays;

      if (expiryDays.value < 0) {
        return;
      }
      if (expiryDays.value <= 31) {
        showModal.value = true;
      }
    });

    // 处理模态框关闭事件
    const handleClose = () => {
      emit('close');
    };

    return {
      expiryDays,
      showModal,
      handleClose,
    };
  },
});
</script>

<style lang="less" module>
.license-check-component{
  text-align: center;
  :global{
    .ant-modal-header, .ant-modal-footer,.ant-modal-body{
      background-color: #fff !important;
      color: black !important;
      border-color: #f0f0f0;
    }
    .ant-modal-title{
      color: black !important;
    }
    .ant-modal-body{
      border: 0 !important;
    }
    .ant-modal-header,
    .ant-modal-footer{
      border: thin solid #f0f0f0;
    }
  }
}
.license-check-fullscreen{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
}
</style>
