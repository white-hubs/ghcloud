<template lang="pug">
.list(v-if='appealInfo && appealInfo.length > 0')
  .list-item(v-for='(item, index) in appealInfo', :key='index') {{ index + 1 }}. {{ item.inspitemName }}
</template>
<script>
export default {
  props: {
    appealInfo: Array,
  },
};
</script>
