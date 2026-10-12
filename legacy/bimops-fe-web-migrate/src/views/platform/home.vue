<template>
  <div class="home">
    <NavTopLink v-show="!isPortalImmersive"/>
    <div class="content" :class="{'full-content': inDesktopClient || isPortalImmersive}">
      <router-view></router-view>
    </div>
  </div>
  <template v-if="!inIframe && !inDesktopClient">
    <CheckPasswordModal />
    <CubeMessageSocket />
  </template>
</template>
<script setup>
import NavTopLink from '../../components/NavTopLink/NavTopLink.vue';
import CheckPasswordModal from '../../components/check-password-modal/check-password-modal.vue';
import CubeMessageSocket from '../../components/cube-message-socket/cube-message-socket.vue';
import * as api from '@/api'
import { onBeforeUnmount, onMounted } from 'vue';
import { inDesktopClient,inIframe } from '@/hooks/use-environment'
import { storeToRefs } from 'pinia'
import { usePortalLayoutStore } from '@/hooks/use-portal-layout-store'

const { isPortalImmersive } = storeToRefs(usePortalLayoutStore())
// //是不是应用中心
// const isAppCenter = computed(() => {
//   return route.path.includes('app-center') || route.path.includes('app-details')
// })

// //是否显示NavTopLink
// const isShowNavTopLink = computed(() => {
//   return !(inIframe && isAppCenter.value)
// })

//获取流媒体地址
const getVideoUrl = () => {
  const serveIp = window.location.protocol;
  api.getStreamMediaConfig().then((res) => {
    // http地址  流媒体对应使用http地址   https地址流媒体对应使用https
    if (serveIp === "http") {
      window.videoUrl = res.intranetAddress
        ? res.intranetAddress.split("//")[1]
        : null;
      window.protocol = res.intranetAddress
        ? res.intranetAddress.split("//")[0]
        : "http:";
    } else {
      window.videoUrl = res.ipAddress ? res.ipAddress.split("//")[1] : null;
      window.protocol = res.ipAddress
        ? res.ipAddress.split("//")[0]
        : "https:";
    }
  });
};

let videoSessionTimer = null
//获取视频session
const getVideoPtzSession = () => {
  videoSessionTimer = null
  api.getVideoPtzSession()
    .then((res) => {
      if (res && res.session) {
        window.videoSession = res.session;
        sessionStorage.setItem("videoSession", res.session);
      }
    })
    .catch((error) => {
      videoSessionTimer = setTimeout(() => {
        getVideoPtzSession();
      }, 10 * 1000);
    });
};
const getUserPermissions = async () => {
  const userRoles = await api.getUserPermissionList()
  const roles = await api.getPermissionList()
  const functionRoles = userRoles.filter(item => item.type === 'FUNCATION')
  const dataRoles = roles.filter(item => item.type !== 'FUNCATION')
  sessionStorage.setItem('user-function-roles', JSON.stringify(functionRoles))
  sessionStorage.setItem('user-data-roles', JSON.stringify(dataRoles))
}

onMounted(() => {
  if (!inIframe) {
    getVideoUrl();
    getVideoPtzSession();
    getUserPermissions();
  }
})

onBeforeUnmount(() => {
  videoSessionTimer && window.clearTimeout(videoSessionTimer)
})
</script>

<style lang="less" scoped>
.home {
  width: inherit;
  height: 100%;
  overflow: hidden;

  .content {
    width: inherit;
    height: calc(100% - 50px);
    overflow: auto;
  }

  .full-content {
    height: 100%
  }
}
</style>
