<template lang="pug">
.app-navigation
  .app-navigation-main
    .title.flex(style='cusor: pointer')
      projects-popover
  .app-navigation-tail
    .navigation-item
      app-current-time
    //- div.navigation-divider
    //- div.navigation-item
    //-   app-weather
    .navigation-divider
    .navigation-item.navigation-button
      user-popover
    div(style='position: fixed; right: -100px; z-index: 200') 
      .navigation-divider
      .navigation-item.navigation-button
        alarm-popover
    .navigation-divider
    .navigation-item.navigation-button
      //- i.iconfont.icon-bell
      MessagePopover
    .navigation-divider
    .navigation-item.navigation-button
      sub-system-popover
</template>
<script>
import AppWeather from './Weather';
import UserPopover from './UserPopover';
import MessagePopover from './MessagePopover';
import AlarmPopover from './AlarmPopover';

import SubSystemPopover from './SubSystemPopover';
import ProjectsPopover from './ProjectsPopover';
import { GETTER_PROJECT } from '@store/account';
import { GETTER_MENUS, GETTER_SYSTEM } from '@store/menu';
import { mapGetters } from 'vuex';
export default {
  components: {
    AppWeather,
    UserPopover,
    SubSystemPopover,
    MessagePopover,
    AlarmPopover,

    ProjectsPopover,
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      menus: GETTER_MENUS,
      system: GETTER_SYSTEM,
    }),
    stystemName() {
      const system = this.menus.find((item) => item.code === this.system);
      return system?.name;
    },
  },
  methods: {
    handleProject() {
      this.$router.replace({ path: '/project' });
    },
  },
};
</script>
<style lang="less" scoped>
.app-navigation {
  height: 4.8rem;
  background-color: #001529;
  box-shadow: 0 1px 4px 0 rgba(0, 21, 41, 0.12);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  color: #ffffff;

  &-main {
    flex: auto;
    .title {
      font-size: 1.8rem;
    }
  }
  &-tail {
    flex: none;
    display: flex;
    align-items: center;
    .navigation-item {
      margin: 0 2rem;
      line-height: 1;
      span {
        cursor: pointer;
      }
      &:last-child {
        margin-right: 0;
      }
      &.navigation-button {
        cursor: pointer;
      }
    }
    .navigation-divider {
      width: 1px;
      height: 0.8em;
      line-height: 1;
      background-color: currentColor;
    }
  }
}
</style>
