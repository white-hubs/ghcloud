<template lang="pug">
  div.electrical_alarm
    EventDetail(:eventData="eventData")
</template>

<script>
import EventDetail from './EventDetail';

export default {
  components: {
    EventDetail,
  },
  props: {
    eventData: Object,
  },
  data() {
    return {
      visible: true,
      loading: false,
      title: 'XXX报警',
    };
  },
  methods: {
    handleDetail() {
      this.$router.push({
        path: '/alarm-record-detail/' + this.eventData.id,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.electrical_alarm {
}
</style>
