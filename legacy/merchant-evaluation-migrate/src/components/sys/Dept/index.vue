<template lang="pug">
app-page-layout.dept(fix-header)
  div.abs-fit.dept
    div.dept-sider
      dept-tree.abs-fit(v-model="dept" ref="tree")
    div.dept-main
      template(v-if="dept")
        div.dept-main-header
          div.title {{dept.name}}
        div.dept-main-body
          detail-or-edit(:dept="dept" @on-save="handleOnSave")
      a-empty.abs-center(v-else description="请选择左侧组织机构")
</template>
<script>
import DeptTree from './Tree';
import DetailOrEdit from './DetailOrEdit';
export default {
  components: { DeptTree, DetailOrEdit },
  data() {
    return {
      dept: null,
    };
  },
  methods: {
    handleOnSave() {
      this.$refs.tree.reload();
    },
  },
};
</script>
<style lang="less" scoped>
.dept {
  display: flex;
  overflow: hidden;
  &-sider {
    flex: none;
    width: 30rem;
    border-right: 1px solid #f0f0f0;
    position: relative;
  }
  &-main {
    flex: auto;
    position: relative;
    &-header {
      padding: 1rem;
      .title {
        font-size: 1.5em;
        margin-left: 2rem;
      }
    }
    &-body {
      margin-top: 2rem;
    }
  }
}
</style>
