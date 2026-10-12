<template lang="pug">
a-config-provider(:locale="locale")
  HeaderContent
    div.entry
      router-view
      //- Loading
</template>
<script lang='jsx'>
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { defineComponent, ref } from "vue";
// import AppFrame from '@/components/common/Frame';
// import Loading from '@/components/common/Loading';

// import {
//   GETTER_USER,
//   LOAD_CURRENT_USER,
//   LOAD_CURRENT_STATION,
//   LOAD_STATIONS,
// } from '@store/account';
// import { LOAD_PROJ_CONFIG } from '@store/Projconfig';
// import { LOAD_DICT } from '@store/dict';
// import { getStationId } from '@/services/AccountService';
// import store from './store';
// import { mapGetters } from 'vuex';
export default defineComponent({
  components: {
    // AppFrame,
    // Loading
  },
  setup() {
    const locale = ref(zhCN);
    return {
      locale,
    };
  },
  // data() {
  //   return {
  //     zh_CN,
  //     inited: false,
  //   };
  // },
  // 加载前获取当前信息
  // async beforeRouteEnter(to, from, next) {
  //   // const stationId = await getStationId();
  //   // await store.dispatch(LOAD_STATIONS);
  //   // if (stationId) {
  //   //   await store.dispatch(LOAD_CURRENT_STATION);
  //   // }
  //   // await store.dispatch(LOAD_CURRENT_USER);
  //   // await store.dispatch(LOAD_PROJ_CONFIG);

  //   // await store.dispatch(LOAD_DICT);
  //   // next();
  // },
});
</script>
<style lang="less" scoped>
.entry {
  // position: absolute;
  // bottom: 0;
  // left: 0;
  // right: 0;
  // top: 0;
  width: 100%;
  height: calc(100% - 50px);
  overflow: hidden;
}
</style>
