<template lang="pug">
span.app-privacy-number
  span(v-if="hide") {{variationNumber}}
  span(v-else)  {{number}}
  a-icon.eye-icon.pointer.ml1(v-if="number" @click="hide=!hide" :type="hide?'eye':'eye-invisible'")
</template>
<script>
export default {
  props: {
    number: String,
    start: {
      type: Number,
      default: -1,
    },
    end: {
      type: Number,
      default: -1,
    },
    char: {
      type: String,
      default: '*',
    },
  },
  data() {
    return {
      hide: true,
    };
  },
  computed: {
    variationNumber() {
      if (this.number) {
        return this.variation(this.number, this.start, this.end);
      }
      return this.number;
    },
  },
  methods: {
    variation(str, start, end) {
      return str
        .split('')
        .map((w, i) => {
          if (i >= start && i <= end) {
            return this.char;
          }
          return w;
        })
        .join('');
    },
  },
};
</script>
<style lang="less" scoped>
.app-privacy-number {
  .eye-icon {
    display: none;
  }
  &:hover {
    .eye-icon {
      display: inline-block;
    }
  }
}
</style>
