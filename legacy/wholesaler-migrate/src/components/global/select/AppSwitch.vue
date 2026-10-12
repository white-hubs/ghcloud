<template lang="pug">
div.app-switch.input.ant-input-affix-wrapper
  span.p1(v-if="label") {{ label }}
  a-switch(:checked="value" v-bind="$attrs" v-on="$listeners")
    <a-icon slot="checkedChildren" type="check" />
    <a-icon slot="unCheckedChildren" type="close" />
</template>

<script>
export default {
  name: 'AppSwitch',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Boolean,
    label: String,
  },
};
</script>
<style lang="less" scoped>
.app-switch {
  //
  // display: inline-block;
  display: inline-flex;
  height: 100%;
  align-items: center;
}
</style>
