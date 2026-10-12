<template lang="pug">
a-popover(placement='bottom', overlayClassName='navigation-subsystem-popover')
  .subsystem-popover-name
    app-icon-display(:name='"setting"')
  .subsystem-popover-body(slot='content')
    .subsystem-popover-item(
      v-for='item in parseSystems',
      @click='handleSwitchSystem(item.code)'
    )
      app-icon-display(:name='item.icon')
      span.ml1 {{ item.name }}
    div.subsystem-popover-item(@click="handleXMSZ" v-if="project.code==='snsh'")
      app-icon-display(:name="'setting'")
      span.ml1 二期先行版
</template>
<script>
import {
  LODA_RESOURCES,
  GETTER_MENUS,
  SET_STATE,
  GETTER_SYSTEM,
} from '@store/menu';
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';
// import _ from 'lodash';

import { getToken } from '@/services/AccountService';
import qs from 'qs';
export default {
  data() {
    return {
      parseSystems: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
      system: GETTER_SYSTEM,
      menus: GETTER_MENUS,
    }),
  },
  watch: {
    menus: 'switchDefaultSystem',
  },
  created() {
    this.$store.dispatch(LODA_RESOURCES);
    this.switchDefaultSystem();
  },
  methods: {
    async handleSwitchSystem(code) {
      const system = this.menus.find((item) => item.code === code);
      if (['XTPT', 'GRSZ'].includes(code)) {
        const token = await getToken();
        const params = qs.stringify({
          ...token,
        });
        window.location.href =
          this.project.url + '#' + system.children[0].url + '?' + params;
      } else if (['IOT-SITE'].includes(code)) {
        const token = await getToken();
        const params = qs.stringify({
          ...token,
        });
        const { platformSiteWeb } = await this.$restful(
          `GET:/project-merchant/iotconfig?projectId=${this.project.id}`,
        );
        if (platformSiteWeb) {
          window.open(platformSiteWeb + '?' + params);
        } else {
          this.$message.error('请先在 配置中心>服务器配置 中配置物联网地址');
        }
        // window.location.href = system.url + '?' + params;
      } else {
        localStorage.setItem('system', code);
        this.$store.commit(SET_STATE, ['system', code]);
        this.$router.push({
          path:
            system.url ||
            system.children[0].url ||
            system.children[0].children[0].url ||
            system.children[0].children[0].children[0].url,
        });
      }
    },
    switchDefaultSystem() {
      // const projectCode = this.pro
      // this.parseSystems = this.menus?.filter(
      //   (item) => !item.pid && item.code !== this.system,
      // );
      this.parseSystems = this.menus?.filter(
        (item) =>
          !item.pid && item.code !== 'GRSZ-SITE' && item.code !== this.system,
      );
      // const menus = this.menus;
      // if (menus.length) {
      //   const systemCode = localStorage.getItem('system') || menus[0].code;
      //   this.$store.commit(SET_STATE, ['system', systemCode]);
      // }
    },
    async handleXMSZ() {
      // const params = qs.stringify({
      //   projectCode: this.project.code,
      //   code: 'hq',
      // });
      // window.open(`${window.config.centerHost}#/xmsz/?${params}`);
      window.open('https://iops-demo-site1.guhecloud.com:18081/');
    },
  },
};
</script>
<style lang="less">
.subsystem-popover {
  &-body {
    margin: -16px;
    margin-top: -12px;
    background-color: #99d3fc;
    color: #222223;
    .subsystem-popover-item {
      min-width: 12rem;
      padding: 1rem 2rem;
      cursor: pointer;
      .iconfont {
        display: inline-block;
        width: 1.5em;
      }
      &:hover {
        background-color: #8abee3;
      }
    }
  }
}
</style>
<style lang="less">
.navigation-subsystem-popover {
  .ant-popover-arrow {
    display: none;
  }
}
</style>
