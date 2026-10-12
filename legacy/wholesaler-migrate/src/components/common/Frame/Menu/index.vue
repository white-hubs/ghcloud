<template lang="pug">
  div.app-menu
    template(v-if="mini")
      menu-item-mini(v-for="item in treeData" :menu-item="item" :key="item.code" :root-id="rootId")
    template(v-else)
      menu-item(v-for="item in treeData" :menu-item="item" :key="item.code")
</template>
<script>
import { treezen } from '@/utils/common';
import MenuItem from './MenuItem';
import MenuItemMini from './MenuItemMini';
export default {
  components: { MenuItem, MenuItemMini },
  model: {
    prop: 'active',
    event: 'change',
  },
  props: {
    mini: Boolean,
    active: String,
    rootId: {
      type: String,
      default: null,
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  provide() {
    return {
      isActive: (item) => {
        return this.menuPath.some((a) => a.code === item.code);
      },
      active: (code) => {
        this.activeMenu(code);
      },
    };
  },
  computed: {
    treeData() {
      return treezen(this.data, 'pid', 'id', this.rootId);
    },
    menuPath() {
      return this.findMenuPath(this.active);
    },
  },
  methods: {
    activeMenu(code) {
      this.$emit('change', code);
    },
    findMenuPath(code) {
      const path = [];
      let menuItem = this.data.find((a) => a.code === code);
      while (menuItem) {
        path.unshift(menuItem);
        menuItem = this.data.find((a) => a.id === menuItem.pid);
      }
      return path;
    },
  },
};
</script>
