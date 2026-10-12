<template lang="pug">
  div.event-detail
    div
      h4.bold 基本信息
      app-card-base-info(:baseInfo="eventData" :fields="fields" :labelWidth="false" :colspans="colspans" :lineHeight="24")
</template>

<script>
export default {
  props: {
    eventData: Object,
  },
  data() {
    return {
      colspans: {
        sm: 12,
        // lg: 8,
      },
      fields: [
        { name: 'name', label: '名称' }, //colspans: { sm: 24 }
        {
          name: 'startTime',
          label: '创建时间',
          render(h, v, r) {
            return r || '--';
          },
        },
        {
          name: 'timeOut',
          label: '超时时长',
          render(h, v, r) {
            return r + ' 分钟';
          },
          isHide(m) {
            return m.timeOut <= 0;
          },
        },
        {
          name: 'areaNames',
          label: '所属区域',
          render(h, model, v) {
            return v?.length ? v.join('/') : '--';
          },
        },
        {
          name: 'companyName',
          label: '所在档位',
          render(h, m, v) {
            return v;
          },
          isHide(m) {
            return !m.companyName;
          },
        },
        {
          name: 'startUserDept',
          label: '责任部门',
          render(h, m, v) {
            return v || '--';
          },
          isHide(m) {
            return !m.startUserDept;
          },
        },
        {
          name: 'description',
          label: '诉求描述',
        },
      ],
      model: {},
      loading: false,
    };
  },
  created() {
    this.model = this.eventData;
    const photos = [];
    const videos = [];
    this.model.fileDTOS?.forEach((file) => {
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
  // height: 600px;
  height: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
