<template lang="pug">
  div
    
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    // api: String,
    // params: Object,
    // options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
  },
  data() {
    return {
      location: [],
    };
  },
};
</script>
