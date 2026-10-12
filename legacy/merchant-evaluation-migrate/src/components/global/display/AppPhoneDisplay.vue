<template lang="pug">
  app-privacy-number(v-if="phone && phone.length===11" :number="phone" :start="3" :end="6")
  span(v-else) {{phone}}
</template>
<script>
export default {
  props: {
    phone: String,
  },
};
</script>
