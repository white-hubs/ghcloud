<template lang="pug">
  div.app-filter
    filter-group(:name="name" :data="data" professional)
</template>
<script>
import FilterGroup from './FilterGroup';

export default {
  components: { FilterGroup },
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: [],
    };
  },
};
</script>
