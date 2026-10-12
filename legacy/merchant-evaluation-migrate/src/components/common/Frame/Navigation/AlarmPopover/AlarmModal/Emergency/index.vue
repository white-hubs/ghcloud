<template lang="pug">
  div.electrical-alarm-cam
    //- app-modal(v-model="visible" :title="model.iotEventName" :width="1200" :confirm-loading="loading" :destroyOnClose="true")
    a-row(:gutter="16")
      a-col(:sm="12")
        ImgAndVideo(:eventData="eventData")
      a-col(:sm="12")
        EventDetail(:eventData="eventData")
    //- template(#footer)
      a-button(@click="hide") 关闭
    //- AlarmVoice()
</template>

<script>
import ImgAndVideo from './ImgAndVideo';
import EventDetail from './EventDetail';
export default {
  components: {
    ImgAndVideo,
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
  methods: {},
};
</script>

<style lang="less" scoped>
.electrical-alarm-cam {
}
</style>
