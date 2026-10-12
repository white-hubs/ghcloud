<template lang="pug">
a-radio-group(:value='value', v-bind='$attrs', v-on='$listeners')
  a-radio(v-for='item in items', :value='item.code', :key='item.code') {{ item.name }}
</template>
<script>
import Select from './Select';
export default {
  extends: Select,
};
</script>
