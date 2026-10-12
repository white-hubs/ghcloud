<template lang="pug">
.app-menu-item-mini(
  :class='{ rootMenu: menuItem.pid === rootId, leaf: !hasChildren }'
)
  a-popover(
    placement='rightTop',
    arrow-point-at-center,
    v-if='hasChildren',
    overlayClassName='app-menu-mini-item-popover'
  )
    .content(:class='{ active: isActive(menuItem) }', @click='handleClick')
      .icon(v-if='menuItem.icon')
        app-icon-display(:name='menuItem.icon')
      .name {{ menuItem.name }}
    template(slot='content')
      .children-container(v-if='hasChildren')
        app-menu-mini-item(
          v-for='item in menuItem.children',
          :key='item.id',
          :menuItem='item'
        )
  .content(
    v-else,
    :class='{ active: isActive(menuItem) }',
    @click='handleClick'
  )
    .icon(v-if="menuItem.icon")
      app-icon-display(:name='`${menuItem.icon || "windows"}`')
    .name {{ menuItem.name }}
</template>
<script>
import MenuItem from './MenuItem';
export default {
  name: 'AppMenuMiniItem',
  extends: MenuItem,
  props: {
    rootId: String,
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';
.app-menu-item-mini {
  .content {
    color: #222223;
    transition: all 0.3s;
    display: flex;
    text-align: center;
    cursor: pointer;
    align-items: center;
    .icon {
      width: 2rem;
      font-size: 1.2em;
      margin-right: 0.2em;
    }
    .name {
      height: 1.5em;
      line-height: 1.5em;
    }
  }
  &.rootMenu {
    .content {
      padding: 1rem 2rem;
      .name {
        display: none;
      }
      .icon {
        width: 2rem;
        height: 1.5em;
        font-size: 1.2em;
      }
      &.active {
        color: @primary-color;
        font-weight: bold;
      }
    }
  }
  &:not(.rootMenu) {
    .content {
      padding: 0.4rem 1rem;
      min-width: 14rem;
      .name {
        display: block;
      }
      &.active {
        color: @primary-color;
        // background-color: fadeout(@primary-color, 80%);
        font-weight: bold;
      }
    }
  }
}
</style>
<style lang="less">
.app-menu-mini-item-popover > .ant-popover-content {
  & > .ant-popover-arrow {
    // border-bottom-color: #02212e !important;
    // border-left-color: #02212e !important;
  }
  & > .ant-popover-inner {
    // background-color: #02212e;
    .ant-popover-inner-content {
      padding: 0.2rem 0;
    }
  }
}
</style>
