<template lang="pug">
div.amap-wrapper
  el-amap#amap-box
</template>

<script>
import Vue from 'vue';
import AMap from 'AMap';
import { GETTER_USER, LOAD_CURRENT_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import { storeProject } from '@/services/AccountService';
export default {
  data() {
    return {
      map: null,
      icon: '/resource/v1/merchant-evaluation-migrate/assets/images/marker.png',
      msg: '',
      currentMarker: '',
    };
  },
  computed: {
    ...mapGetters({
      user: GETTER_USER,
    }),
  },
  mounted() {
    this.initMap();
    this.initialization();
  },
  methods: {
    async initialization() {
      let projects = await this.$restful(`/sys/context/projects`);
      if (projects && projects.length) {
        projects.forEach((item) => {
          this.addMarker(item);
        });
      }
    },
    initMap() {
      this.map = new AMap.Map('amap-box', {
        zoom: 8,
        center: [103.856698, 30.688444],
      });
    },
    addMarker(item) {
      let marker = new AMap.Marker({
        icon: this.icon,
        position: new AMap.LngLat(item.longitude, item.latitude),
        offset: new AMap.Pixel(-16, 0),
      });
      this.map.add(marker);
      marker.on('click', (e) => {
        this.openInfoWindow(item);
      });
    },
    openInfoWindow(item) {
      const self = this;
      self.currentMarker = item;
      let info = Vue.extend({
        methods: {
          clickInfoWindow() {
            self.toProject();
          },
        },
        template: `<div class='info-window'><h2>${item.name}</h2><button @click='clickInfoWindow()'>进入项目</button></div>`,
      });
      let component = new info().$mount();
      let InfoWindow = new AMap.InfoWindow({
        content: component.$el,
      });
      InfoWindow.open(this.map, [item.longitude, item.latitude]);
    },
    async toProject() {
      await storeProject(this.currentMarker);
      await this.$store.dispatch(LOAD_CURRENT_PROJECT);
      this.$router.replace({ path: '/jkpt/project' });
    },
  },
};
</script>

<style lang="less">
.amap-wrapper {
  width: 100%;
  height: 100%;
}
.info-window {
  min-width: 260px;
  padding: 1rem 4rem;
  border-radius: 0.5rem;
  text-align: center;
  h3 {
    padding-bottom: 1.6rem;
  }
  button {
    background: dodgerblue;
    padding: 0.6rem 1rem;
    border-radius: 0.4rem;
    border: none;
    color: #ffffff;
  }
}
</style>
