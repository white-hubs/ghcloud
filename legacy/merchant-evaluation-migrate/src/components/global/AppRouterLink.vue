<template lang="pug">
  router-link(v-if='to' :to="to" v-bind="$attrs" v-on="$listeners")
    slot
  span(v-else v-bind="$attrs" v-on="$listeners")
    slot
</template>
<script>
export default {
  props: ['to'],
};
</script>
