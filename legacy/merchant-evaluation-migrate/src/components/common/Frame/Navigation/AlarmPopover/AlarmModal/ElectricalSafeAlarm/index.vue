<template lang="pug">
  div.electrical_alarm
    EventDetail(:eventData="eventData")
    DeviceLocation.mt2(:eventData="eventData")
    //- a-row(:gutter="16")
      a-col(:sm="12")
        EventDetail(:eventData="eventData")
      a-col(:sm="12")
        DeviceLocation(:eventData="eventData")
</template>

<script>
import EventDetail from './EventDetail';
import DeviceLocation from './DeviceLocation';
export default {
  components: {
    EventDetail,
    DeviceLocation,
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
        path: '/ywpt/alarm-record-detail/' + this.eventData.id,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.electrical_alarm {
}
</style>
