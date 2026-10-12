<template lang="pug">
a.app-link-btn(
  v-bind='$attrs',
  :disabled='disabled',
  v-on='listeners',
  @click='clickHandler'
)
  app-router-link.link(
    v-if='!openTab',
    :to='to',
    v-bind='$attrs',
    :disabled='disabled'
  )
    slot
  span.link(v-else, @click='openTabHandler', :disabled='disabled')
    slot
</template>
<script>
import _ from 'lodash';

export default {
  props: {
    to: [String, Object],
    disabled: Boolean,
    openTab: {
      type: Boolean,
      default: false,
    },
    title: String,
    tabKey: String,
    replaceTab: Boolean,
  },
  computed: {
    listeners() {
      return _.omit(this.$listeners, 'click');
    },
  },
  created() {
  },
  methods: {
    clickHandler(e) {
      if (!this.disabled) {
        this.$emit('click', e);
      }
    },
    openTabHandler() {
      this.$openTab({
        key: this.tabKey,
        name: this.title,
        url: this.to,
        replace: this.replaceTab,
      });
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';

a[type='danger'] {
  color: @error-color;
}

.app-link-btn {
  color: @primary-color;
  cursor: pointer;

  &[disabled] {
    color: rgba(0, 0, 0, 0.25);
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: unset;

    &>.link {
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}
</style>
