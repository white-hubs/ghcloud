<template lang="pug">
app-link-btn-confirm(:title="title" :description="description" v-on="$listeners" v-bind="$attrs" type="danger" )
  slot
</template>
<script>
import AppLinkBtnConfirm from './AppLinkBtnConfirm';
export default {
  components: { AppLinkBtnConfirm },
  props: {
    title: {
      type: String,
      default: '是否删除？',
    },
    description: String,
  },
};
</script>
