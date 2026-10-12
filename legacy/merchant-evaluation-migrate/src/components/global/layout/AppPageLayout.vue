<template lang="pug">
.app-page-layout.abs-fit(:class='{ "fix-header": fixHeader }')
  .header.bg-white.px3.pb2(v-if='showHeader')
    .main.flex
      .header-left.flex-auto
        .title(v-if='title') {{ title }}
        template(v-else)
          slot(name='header-left')
      .header-right.flex-none
        slot(name='header-right')
    .extra
      slot(name='extra')
  .body
    slot
  //-  Vue子组件插槽引入与插入方法与获取方法$slots，是组件所有默认插槽、具名插槽（有name属性）的集合，可以用来获取当前组件的插槽集 
  //- 写入插槽的元素的slot属性值和插槽的name属性对应
  .footer(v-if='$slots.footer')
    slot(name='footer')

  a-spin.abs-fit.flex.justify-center(
    style='align-items: center',
    :spinning='loading',
    v-show='loading'
  )
</template>
<script>
export default {
  props: {
    title: String,
    fixHeader: Boolean,
    showHeader: Boolean,
    loading: Boolean,
  },
};
</script>

<style lang="less" scoped>
.app-page-layout {
  overflow: auto;
  width: 100%;
  height: 100%;

  .title {
    font-size: 1.7em;
    color: #333;
  }

  .body {
    background-color: #fff;
  }

  &.fix-header {
    display: flex;
    flex-direction: column;

    .header {
      flex: none;
    }

    .body {
      flex: auto;
      // overflow: hidden;
      position: relative;
    }

    .footer {
      flex: none;
      overflow: hidden;
    }
  }

  &.no-bg {
    .body {
      background: none;
    }
  }
}</style>
