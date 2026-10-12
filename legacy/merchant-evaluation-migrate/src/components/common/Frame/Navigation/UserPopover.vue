<template lang="pug">
a-popover(placement="bottom" overlayClassName="navigation-user-popover")
  div.user-popover-name
    slot(:user="user")
      span.p1
        a-avatar(:src="$filehost + user.avatar" :size="20" )
      span(v-if="user.nickname") {{user.nickname}} ({{user.username}})
      span(v-else) {{user.username}}
      span.p1
        app-icon-display(:name="'caret-down'")
  div.user-popover-body(slot="content")
    div.user-popover-item(@click="toPersonal") 
      app-icon-display(:name="'user'")
      span.ml1 个人中心
    div.user-popover-item(@click="handleLogout") 
      app-icon-display(:name="'poweroff'")
      span.ml1 安全退出
</template>
<script>
import { mapGetters } from 'vuex';
import { GETTER_USER } from '@store/account';
import { logout } from '@/services/AccountService';

export default {
  data() {
    return {
      confirming: false,
    };
  },
  computed: {
    ...mapGetters({
      user: GETTER_USER,
    }),
  },
  methods: {
    toPersonal() {
      this.$router.push({ path: '/user-config/personal' });
    },
    handleLogout() {
      if (!this.confirming) {
        this.confirming = true;
        this.$confirm({
          title: '提示',
          content: '是否退出登录？',
          onOk: () => {
            logout();
            this.confirming = false;
          },
          onCancel: () => {
            this.confirming = false;
          },
        });
      }
    },
  },
};
</script>
<style lang="less" scoped>
.user-popover {
  &-name {
    display: flex;
    align-items: center;
    position: relative;
  }
  &-body {
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
