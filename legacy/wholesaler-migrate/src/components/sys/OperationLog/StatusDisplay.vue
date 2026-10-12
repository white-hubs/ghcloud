<template lang="pug">
  a-tag(:color="colors[satus]") {{title[satus]}}
</template>
<script>
export default {
  props: {
    satus: Number,
  },
  data() {
    return {
      title: {
        0: '异常',
        1: '正常',
      },
      colors: {
        0: '#F50',
        1: '#87d068',
      },
    };
  },
};
</script>
