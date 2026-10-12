<template lang="pug">
  div.event-detail
    app-card(title='基本信息')
      app-card-base-info(:baseInfo="eventData" :fields="fields" :labelWidth="false" :lineHeight="24")
</template>

<script>
export default {
  props: {
    eventData: Object,
  },
  data() {
    return {
      loading: false,
      model: {},
      fields: [
        {
          name: 'type',
          label: '上报类型',
          render(h, r, v) {
            return <app-dict-display value={v} />;
          },
        },
        {
          name: 'level',
          label: '上报等级',
          render(h, r, v) {
            return <app-dict-display value={v} />;
          },
        },
        { name: 'reportUserName', label: '上报人' },
        { name: 'mobile', label: '联系电话' },
        { name: 'reportTime', label: '上报时间' },
        {
          name: 'description',
          label: '事件描述',
          render(h, r, v) {
            return (
              <div class="pt2" style="white-space: normal;line-height: normal;">
                {v}
              </div>
            );
          },
        },
      ],
    };
  },
  created() {
    this.model = this.eventData;
    const photos = [];
    const videos = [];
    this.model.fileDTOS.forEach((file) => {
      if (/^(png|jpg|gif)$/i.test(file.type)) {
        photos.push(file);
      } else {
        videos.push(file);
      }
    });
    this.model.photos = photos;
    this.model.videos = videos;
  },
};
</script>

<style lang="less" scoped>
.event-detail {
  height: 400px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
