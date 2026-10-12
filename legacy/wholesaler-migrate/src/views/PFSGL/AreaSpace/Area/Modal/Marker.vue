<template>
  <div class="commonLabel_tag">
    <img :src="img" />
  </div>
</template>

<script>
// 复制 JKPT/labels/commonLabel
export default {
  props: {
    img: {
      type: String,
      default: () => {
        return require('./marker_common.png');
      },
    },
  },
};
</script>

<style lang="less" scoped>
.commonLabel_tag {
  text-align: center;
  position: relative;
  user-select: none;

  > img {
    width: 69px;
    height: 75px;
    cursor: pointer;

    &:hover {
    }
  }
}
</style>
