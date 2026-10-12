<template lang="pug">
div.app-navigation
  div.app-navigation-main
    div.title.flex(style="cusor: pointer;")
      projects-popover
  div.app-navigation-tail
    //- div.navigation-item
    //-   SystemVersion
    //- div.navigation-divider
    div.navigation-item.navigation-button
      Skin
    div.navigation-divider
    div.navigation-item
      app-current-time
        //- span.ml1 改变主题
    //- div.navigation-divider
    //- div.navigation-item
    //-   app-weather
    //- div.navigation-divider
    //- div.navigation-item.navigation-button
    //-   projects-popover
    div.navigation-divider
    div.navigation-item.navigation-button
      user-popover
    //- div(style="position: fixed; right: -100px;z-index: 200;")  
    div.navigation-divider
    div.navigation-item.navigation-button
      alarm-popover
    div.navigation-divider
    div.navigation-item.navigation-button
      //- i.iconfont.icon-bell
      MessagePopover
    div.navigation-divider
    div.navigation-item.navigation-button
      sub-system-popover

</template>
<script>
import Skin from './Skin';
import AppWeather from './Weather';
import SystemVersion from './SystemVersion';
import UserPopover from './UserPopover';
import AlarmPopover from './AlarmPopover';

import MessagePopover from './MessagePopover';
import SubSystemPopover from './SubSystemPopover';
import ProjectsPopover from './ProjectsPopover';
import { GETTER_PROJECT } from '@store/account';
import { GETTER_MENUS, GETTER_SYSTEM } from '@store/menu';
import { mapGetters } from 'vuex';
export default {
  components: {
    Skin,
    AppWeather,
    SystemVersion,
    UserPopover,
    AlarmPopover,

    SubSystemPopover,
    MessagePopover,
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
  background-color: #99d3fc;
  box-shadow: 0 1px 4px 0 rgba(0, 21, 41, 0.12);
  padding: 0 2rem;
  display: flex;
  align-items: center;
  color: #222223;

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
