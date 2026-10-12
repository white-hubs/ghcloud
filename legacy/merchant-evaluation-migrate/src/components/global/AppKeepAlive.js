import { GETTER_TABS, GETTER_TAB } from '@store/menu';

function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory;
}

function isDef(v) {
  return v !== undefined && v !== null;
}

function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
}
export default {
  render() {
    const tabs = this.$store.getters[GETTER_TABS];
    const activeKey = this.$store.getters[GETTER_TAB];
    const tab = tabs.find((a) => a.key === activeKey);
    let vnode = tab?._vnode;
    if (!vnode) {
      vnode =
        getFirstComponentChild(this.$children) ||
        (this.$slots.default && this.$slots.default[0]);
      if (vnode) {
        vnode.data.keepAlive = true;
        vnode.key = Math.random();
        if (tab) {
          tab._vnode = vnode;
        }
      }
    }
    return vnode;
  },
};
