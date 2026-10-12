<template lang="pug">
.app-breadcrumb(v-show='activeTab')
  .flex-none.back-btn(
    :class='{ disabled: !(activeTab && activeTab.last) }',
    @click='backHandler'
  )
    a-icon(type='arrow-left', style='font-size: 1.2rem')
    span(style='margin-left: 0.7rem') 返回
  .divider
  a-breadcrumb.flex-auto
    a-breadcrumb-item(v-if='systemName') {{ systemName }}
    a-breadcrumb-item(v-for='(item, index) in breadcrumbPaths', :key='item.id')
      span.item(
        @click='breadcrumbClickHandler(index)',
        :class='{ last: index === breadcrumbPaths.length - 1, link: item.url }'
      ) {{ item.title }}
</template>
<script>
import {
  GETTER_RESOURCES,
  GETTER_TAB,
  GETTER_TABS,
  GETTER_SYSTEM,
  findMenuPath,
} from '@store/menu';
import { mapGetters } from 'vuex';
import uuid from 'uuid/v4';
export default {
  computed: {
    ...mapGetters({
      tabs: GETTER_TABS,
      resources: GETTER_RESOURCES,
      activeKey: GETTER_TAB,
      system: GETTER_SYSTEM,
    }),
    activeTab() {
      return this.tabs.find((a) => a.key === this.activeKey);
    },
    systemName() {
      return this.resources.find((a) => a.code === this.system)?.name;
    },
    breadcrumbPaths() {
      let currentTab = this.activeTab;
      const paths = [];
      while (currentTab) {
        paths.unshift({
          key: currentTab.key,
          url: currentTab.url,
          id: uuid(),
          title: currentTab.breadcrumbTitle || currentTab.title,
        });
        currentTab = currentTab.last;
      }

      if (paths.length) {
        const menu = this.resources.find((a) => a.id === paths[0].key);
        if (menu) {
          const menuPaths = findMenuPath(this.resources, menu);
          menuPaths.pop();
          paths.unshift(...menuPaths);
        }
      }

      let uniqPaths = [];
      paths.forEach((item) => {
        const index = uniqPaths.findIndex((a) => a.url === item.url);
        if (index === -1) {
          uniqPaths.push(item);
        } else {
          uniqPaths = uniqPaths.slice(0, index);
          uniqPaths.push(item);
        }
      });
      return uniqPaths;
    },
  },
  mounted() {
    // 处理5键鼠标回退按钮
    window.addEventListener('mouseup', (e) => {
      if (e.which === 4) {
        this.backHandler();
      }
    });
  },
  methods: {
    backHandler() {
      this.$back();
    },
    breadcrumbClickHandler(index) {
      const totalLength = this.breadcrumbPaths.length;
      if (index < totalLength - 1) {
        this.$back(totalLength - index - 1);
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';

.app-breadcrumb {
  padding: 1rem 2rem;
  background-color: #edf9ff;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: 0 0px 4px 0px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
  .back-btn {
    color: #222223;
    cursor: pointer;
    &.disabled {
      color: #646465;
      cursor: not-allowed;
    }
  }
  .divider {
    display: inline-block;
    width: 1px;
    height: 1em;
    background-color: #919191;
    margin: 0 1.2rem;
  }

  .item.link {
    cursor: pointer;
    color: #383839;
    &:not(.last) {
      &:hover {
        color: @primary-color;
        text-decoration: underline;
      }
    }
    &.last {
      color: #222223;
      cursor: default;
    }
  }
}
</style>
