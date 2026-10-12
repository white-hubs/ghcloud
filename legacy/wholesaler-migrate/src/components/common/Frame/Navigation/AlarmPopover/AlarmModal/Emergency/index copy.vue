<template lang="pug">
  div
    app-card(title='基本信息')
      app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90")
</template>
<script>
export default {
  props: {
    eventData: Object,
  },
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
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
        {
          name: 'description',
          label: '描述',
          render(h, r, v) {
            return (
              <div class="pt2" style="white-space: normal;line-height: normal;">
                {v}
              </div>
            );
          },
        },
        { name: 'mobile', label: '联系电话' },
        { name: 'reportTime', label: '上报时间' },
        // {
        //   name: 'fileDTOS',
        //   label: '附件',
        //   render(h, r, v) {
        //     return v?.length ? <app-files-display files={v} /> : '无';
        //   },
        // },
        // {
        //   name: 'photos',
        //   label: '照片',
        //   render(h, r, v) {
        //     return v?.length ? <app-imgs-display files={v} /> : '无';
        //   },
        // },
        // {
        //   name: 'videos',
        //   label: '视频',
        //   render(h, r, v) {
        //     return v?.length ? (
        //       <app-videos-display
        //         class="pt1"
        //         style={{ display: 'inline-block' }}
        //         files={v}
        //       />
        //     ) : (
        //       '无'
        //     );
        //   },
        // },
      ],
      loading: false,
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
  methods: {},
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 400px;
}
.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}
.mt16 {
  margin-top: 16px;
}
.footer-btns {
  margin: 16px 0;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
