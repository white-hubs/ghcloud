<template>
  <a-config-provider :locale="locale">
      <div id="BusinessApp">
        <router-view/>
      </div>
  </a-config-provider>
  
  </template>
  <script>
  import zh_CN from "ant-design-vue/es/locale/zh_CN";
  import {
    defineComponent,
    ref,
  } from "vue";
  
  export default defineComponent({
    setup(){
      const locale = ref(zh_CN);
      return{
        locale
      }
    }
  })
  </script>
  <style lang="less" scoped>
  #BusinessApp {
    width: 100%;
    height: 100%;
  >div {
    height: 100%;
  }
  }
  </style>