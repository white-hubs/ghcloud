<template>
  <a-layout-content class="view_content">
    <a-layout>
      <a-layout-content
        class="layout_container_content"
        :class="[
          cubeSiteSetting.layout.value === 'CLASSIC' ? 'layout-classic' : 'layout-mixin',
          { 'layout_container_content--portal-immersive': isPortalImmersive },
        ]"
        id="layout_container_content"
      >
        <router-view />
        <div id="appContainer"></div>
        <div id="appContainerLoading" v-show="childApplication.appLoadStatus === 'LOADING'">
          <a-spin></a-spin>
          <span>应用加载中...</span>
        </div>
        <div id="appContainerError" v-show="childApplication.appLoadStatus === 'ERROR'">
          <a-empty :image="onePng">
            <template #description>
              应用加载失败，请刷新重试或联系运维人员处理
            </template>
            <a-button type="primary" @click="reload">刷新</a-button>
          </a-empty>
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout-content>
</template>
<script setup>
import { useSiteSetting } from '@/hooks/use-site-setting';
const onePng = '/resource/v1/bimops-fe-web-migrate/images/1.png'
import { useChildApplication } from '../../hooks/use-child-application';
import { storeToRefs } from 'pinia'
import { usePortalLayoutStore } from '@/hooks/use-portal-layout-store'

const { cubeSiteSetting } = useSiteSetting()
const childApplication = useChildApplication()
const { isPortalImmersive } = storeToRefs(usePortalLayoutStore())
function reload(){
  window.location.reload()
}
</script>

<style lang="less" scoped>
.view_content {
  padding-top: 0;
  position: relative;
  overflow: hidden;

  >div {
    height: 100%;
  }
}

.layout_container_content {
  background-color: #fafafa;
  position: relative;
  box-sizing: border-box;

  &.layout-mixin{
    padding: 10px;
  }

  &.layout_container_content--portal-immersive.layout-mixin {
    padding: 0;
  }

  >div {
    height: 100%;
    background-color: #fff;
  }
}
</style>
<style lang="less">
#appContainer {
  height: 100%;
  width: 100%;

  >div {
    height: 100%;
    width: 100%;
  }
}
#appContainerLoading,
#appContainerError {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>