<template lang="pug">
a-popover(placement="bottom" overlayClassName="navigation-user-popover")
  div.user-popover-name
    slot(:project="project")
      span(v-if="project.name") {{project.name}}
  div.user-popover-body(slot="content")
    div.user-popover-item(v-for="p in computedProjects" :key="p.id" @click="handleChangeProject(p)") {{ p.name }}
</template>
<script>
import { mapGetters } from 'vuex';
import {
  GETTER_PROJECT,
  GETTER_PROJECTS,
  GETTER_USER,
  LOAD_CURRENT_PROJECT,
} from '@store/account';
import { storeProjectCode, storeProject } from '@/services/AccountService';
export default {
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      projects: GETTER_PROJECTS,
      user: GETTER_USER,
    }),
    computedProjects() {
      // return this.projects.filter((item) => item.code !== 'hq');
      const projects = this.projects;
      return projects.sort((a, b) => {
        return b.code === 'hq' ? 0 : -1;
      });
    },
  },
  // mounted() {
  // },
  methods: {
    async handleChangeProject(project) {
      // 如果是总部, 跳转到总部
      if (project.code === 'hq') {
        window.location.href = project.url;
        return;
      }
      // 切换
      storeProjectCode(project.code);
      await storeProject(project);
      await this.$store.dispatch(LOAD_CURRENT_PROJECT);
      window.location.reload();
    },
  },
};
</script>
<style lang="less" scoped>
.user-popover {
  &-name {
    position: relative;
    padding-right: 1rem;
    &::after {
      content: '';
      position: absolute;
      border: 1rem solid transparent;
      border-right-color: currentColor;
      border-bottom: currentColor;
      bottom: 0;
      right: 0rem;
    }
  }
  &-body {
    margin: -16px;
    margin-top: -12px;
    background-color: #001529;
    color: rgba(255, 255, 255, 0.8);
    .user-popover-item {
      min-width: 12rem;
      padding: 1rem 2rem;
      cursor: pointer;
      &:hover {
        background-color: darken(#001529, 10%);
      }
    }
  }
}
</style>
<style lang="less">
.navigation-user-popover {
  .ant-popover-arrow {
    display: none;
  }
}
</style>
