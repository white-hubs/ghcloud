<template>
  <a-modal v-model:visible="state.passwordVisible" title="警告信息" :keyboard="false" :maskClosable="false"
    :closable="false" centered>
    <template #footer>
      <a-button key="back" @click="handleCancel" type="danger" v-if="!password_forced">
        暂不修改
      </a-button>
      <a-button key="submit" type="primary" @click="handleEdit">
        去修改
      </a-button>
    </template>
    <a-alert message="密码过期,请及时修改！" type="warning" show-icon />
  </a-modal>
</template>
<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute } from "vue-router";
import { personManageMenus } from '../../routes/person-manage-menus'
 
const route = useRoute();
const state = reactive({
  passwordVisible: false,
  password_forced: false,
  menus: personManageMenus
});
//打开密码提示
const openPassword = () => {
  const token = JSON.parse(sessionStorage.getItem("GH-Token"));
  if (token && !location.pathname.includes("/modify-password") && route.path === '/index') {
    state.password_forced = token.password_forced;
    if (token.password_expired && token.password_forced) {
      state.passwordVisible = true;
    } else if (token.password_expired && !token.password_forced) {
      //密码过期且不强制修改
      if (
        sessionStorage.getItem("password_forced") &&
        sessionStorage.getItem("password_forced") === "not"
      ) {
        state.passwordVisible = false;
      } else {
        state.passwordVisible = true;
      }
    }
  } else {
    state.passwordVisible = false;
  }
};
//关闭密码提示
const handleCancel = () => {
  state.passwordVisible = false;
  sessionStorage.setItem("password_forced", "not");
};
//去修改密码
const handleEdit = () => {
  const childApplication = useChildApplication()
  state.passwordVisible = false;
  childApplication.currentApplication = state.menus;
  childApplication.currentMenus = state.menus.menu
  history.pushState({ current: location.pathname + location.search }, "", '/about')
  history.pushState({}, null, "/portal/legacy-personal/modify-password")
};

onMounted(() => {
  openPassword()
})
</script>
