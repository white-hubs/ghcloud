<template lang="pug">
a-popover(placement="bottomLeft" overlayClassName="navigation-user-popover" trigger="click")
  div.user-popover-name
    slot(:project="project")
      span.p1
        app-icon-display(:name="'caret-down'")
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
  // LOAD_CURRENT_PROJECT,
} from '@store/account';

import { GETTER_SYSTEM } from '@store/menu';
// import { storeProjectCode, storeProject } from '@/services/AccountService';
import { getToken } from '@/services/AccountService';
import qs from 'qs';
export default {
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      projects: GETTER_PROJECTS,
      user: GETTER_USER,
      system: GETTER_SYSTEM,
    }),
    computedProjects() {
      // return this.projects.filter((item) => item.code !== 'hq');
      const projects = this.projects;
      return (
        projects
          // .filter((p) => p.code !== this.project.code)
          .sort((a, b) => {
            return b.code === 'hq' ? 1 : -1;
          })
      );
    },
  },
  // mounted() {
  // },
  methods: {
    async handleChangeProject(project) {
      // 切换项目到底要不要跳转!!!!
      const token = await getToken();
      const params = qs.stringify({
        ...token,
        code: project.code,
      });
      const isSameSite = window.location.href.includes(project.url);
      if (this.system === 'JKPT') {
        if (project.code === 'hq') {
          window.location.href = `${project.url}#/home?${params}`;
        } else if (project.code === 'sncd') {
          // 成都农批 特殊处理!!
          window.name = qs.stringify({
            access_token: window.config.sncd_access_token,
          });
          window.location.href = `${project.url}#/dashboard`;
        } else {
          window.location.href = `${project.url}#/jkpt/home?${params}`;
        }
      } else if (this.system === 'Cockpit') {
        if (project.code === 'hq') {
          window.location.href = `${project.url}#/home?${params}`;
        } else if (project.code === 'sncd') {
          // 成都农批 特殊处理!!
          window.name = qs.stringify({
            access_token: window.config.sncd_access_token,
          });
          window.location.href = `${project.url}#/dashboard`;
        } else {
          window.location.href = `${project.url}#/Cockpit?${params}`;
        }
      } else {
        if (project.code === 'sncd') {
          // 成都农批 特殊处理!!
          window.name = qs.stringify({
            access_token: window.config.sncd_access_token,
          });
          window.location.href = `${project.url}#/dashboard`;
        } else {
          window.location.href = `${project.url}#/?${params}`;
        }
      }
      if (isSameSite) {
        window.location.reload();
      }
    },
  },
};
</script>
<style lang="less" scoped>
.user-popover {
  &-name {
    position: relative;
    padding-right: 1rem;
    // color: darken(#1890ff, 10%);
  }
  &-body {
    max-height: 411px;
    overflow: auto;
    margin: -16px;
    margin-top: -18px;
    background-color: #99d3fc;
    color: #222223;
    .user-popover-item {
      min-width: 12rem;
      padding: 1rem 2rem;
      cursor: pointer;
      &:hover {
        background-color: #8abee3;
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
