<template lang="pug">
div.app-nultiple-select.container.ant-select-selection.ant-select-selection--multiple(ref="container" style="width: 250px;" @click="handleClick")
  div.ant-select-selection__rendered
    ul(style="margin: 0; padding: 0;list-style: none;")
      li.ant-select-search.ant-select-search--inline
        div.ant-select-search__field__wrap
          input.ant-select-search__field(autocomplete="off" value="")
          span.ant-select-search__field__mirror &nbsp;
  a-time-picker(
  v-model="time" 
  :default-open-value="moment('00:00:00', 'HH:mm:ss')" 
  :valueFormat="'HH:mm:ss'" 
  :getPopupContainer="getPopupContainer"
  :open="open"
  )
    div(slot="addon" slot-scope="panel")
      a-button(type="primary" block @click="handOk") 确定
</template>

<script>
import moment from 'moment';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
  },
  data() {
    return {
      open: false,
      time: moment('00:00:00', 'HH:mm:ss').format('HH:mm:ss'),
    };
  },
  computed: {},
  watch: {},
  created() {},
  methods: {
    moment,
    handleDropdownVisibleChange(open) {
      if (open) {
        // this.open = open;
      }
    },
    getPopupContainer(trigger) {
      return this.$refs.container;
    },
    handOk() {
    },
    handleClick() {
      this.open = true;
    },
  },
};
</script>
<style lang="less" scoped>
.container {
  position: relative;
  display: inline-block;
}
</style>
<style lang="less">
.app-nultiple-select {
  .ant-time-picker-panel-input-wrap {
    display: none;
  }
  .ant-time-picker {
    display: none !important;
  }
}
</style>
