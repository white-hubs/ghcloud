<template lang="pug">
.app-menu-item
  .content(
    :class='{ active: isActive(menuItem), leaf: !hasChildren }',
    @click='handleClick'
  )
    .icon(v-if='menuItem.icon')
      app-icon-display(:name='menuItem.icon')
    .name {{ menuItem.name }}
    .expand-icon(v-if='hasChildren')
      a-icon(:type='__expanded ? "caret-up" : "caret-down"')
  transition(
    @before-enter='beforeEnter',
    @enter='enter',
    @leave='leave',
    :css='false'
  )
    .children-container(v-if='hasChildren', v-show='__expanded')
      app-menu-item(
        v-for='item in menuItem.children',
        :menuItem='item',
        :key='item.id'
      )
</template>
<script>
import TWEEN from 'tween.js';
export default {
  name: 'AppMenuItem',
  inject: ['isActive', 'active'],
  props: {
    menuItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      expanded: null,
    };
  },
  computed: {
    hasChildren() {
      return !!this.menuItem?.children?.length;
    },
    __expanded: {
      get() {
        if (this.expanded === null) {
          const isActive = this.isActive(this.menuItem);
          return isActive;
        } else {
          return this.expanded;
        }
      },
      set(v) {
        this.expanded = v;
      },
    },
  },
  methods: {
    handleClick() {
      if (this.hasChildren) {
        this.__expanded = !this.__expanded;
      } else {
        this.active(this.menuItem.code);
        // this.$router.push({ path: this.menuItem.path });
      }
    },
    beforeEnter(el) {
      el.style.setProperty('height', '0px');
    },
    enter(el, done) {
      animateHeight(el, 0, getElHeight(el), done);
    },
    leave(el, done) {
      animateHeight(el, getElHeight(el), 0, done);
    },
  },
};

function animateHeight(el, startHeight, endHeight, done) {
  let size = { height: startHeight };
  new TWEEN.Tween(size)
    .to({ height: endHeight }, 300)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      el.style.setProperty('height', size.height + 'px');
    })
    .onComplete(() => {
      el.style.removeProperty('height');
      done();
    })
    .start();
}
function getElHeight(el) {
  const cloneEL = el.cloneNode(true);
  cloneEL.style.setProperty('position', 'absolute');
  cloneEL.style.setProperty('display', 'block');
  cloneEL.style.setProperty('left', '-99999px');
  cloneEL.style.removeProperty('height');
  el.parentNode.append(cloneEL);
  const height = cloneEL.clientHeight;
  cloneEL.remove();
  return height;
}
</script>
<style lang="less" scoped>
@import '~@/styles/variables';
.app-menu-item {
  .content {
    padding: 1rem 2rem;
    color: #222223;
    transition: all 0.3s;
    display: flex;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    .icon {
      width: 2rem;
      height: 2rem;
      font-size: 1em;
      flex: none;
    }
    .name {
      padding-left: 0.5rem;
      flex: auto;
    }
    .expand-icon {
      flex: none;
      width: 2rem;
    }

    &.leaf {
      &.active {
        color: @primary-color;
        background-color: fadeout(@primary-color, 80%);
        font-weight: bold;
      }
    }
    &:not(.leaf) {
      &.active {
        font-weight: bold;
        color: @primary-color;
      }
    }
  }
  .children-container {
    padding-left: 2rem;
    overflow: hidden;
  }
}
</style>
