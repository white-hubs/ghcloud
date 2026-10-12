<template lang="pug">  
a-popover(placement="bottomLeft" overlayClassName="navigation-user-popover")
  div.user-popover-name
    div
      span 
        a-icon( type="skin" )
        span.p1 切换主题
  div.user-popover-body(slot="content")
    div.user-popover-item(v-for="theme in themeList" :key="theme.code"
      :class="{active : theme.code === savedTheme}"
      @click="changeTheme(theme)") 
      span.ml1 {{ theme.name }}
</template>

<script>
import { initTheme, changeTheme } from '@/skins/index';
import { GETTER_PROJECT } from '@store/account';
import { GETTER_SAVED_THEME } from '@store/theme';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      themeList: [
        { name: '办公白', code: 'default' },
        { name: '天空蓝', code: 'sky-blue' },
        { name: '清新绿', code: 'sky-green' },
        // dark-red dark-blue
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      savedTheme: GETTER_SAVED_THEME,
    }),
  },
  created() {
    initTheme();
  },
  methods: {
    changeTheme(theme) {
      changeTheme(theme.code);
      this.$restful(`PUT:/sys/users-theme?theme=${this.savedTheme}`).then(
        () => {
          this.$message.success('切换皮肤成功!');
        },
      );
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
    // margin-top: -18px;
    background-color: #99d3fc;
    color: #222223;
    .user-popover-item {
      min-width: 12rem;
      padding: 1rem 2rem;
      cursor: pointer;
      &.active {
        background-color: #8abee3;
      }
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
