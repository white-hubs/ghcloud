<template lang="pug">
  a-popconfirm( @confirm="confirmHandler" placement="topRight" :disabled="disabled")
    template( slot="title")
      div {{title}}
      div(v-if="description" style="color: #999; margin-left: -22px;") {{description}}
    a-icon.mr1(type="loading" v-if="loading")
    app-link-btn(v-bind="$attrs" v-on="$listeners" :disabled="parseDisabled")
      slot
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '是否确定？',
    },
    description: String,
    disabled: {
      type: Boolean,
    },
  },
  data() {
    return {
      loading: false,
    };
  },

  computed: {
    parseDisabled() {
      if (this.loading) {
        return true;
      }
      return this.disabled;
    },
  },
  created() {
  },
  methods: {
    async confirmHandler() {
      this.loading = true;
      try {
        await this.$listeners.confirm(() => {
          this.loading = false;
        });
      } catch {
        this.loading = false;
      }
    },
  },
};
</script>
