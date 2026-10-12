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
    const levelMap = {
      '3': {
        label: 'Ⅲ级 （一般）',
        color: '#1890ff',
        number: 3,
        value: '3',
      },
      '2': {
        label: 'Ⅱ级 （较重）',
        color: '#faad14',
        number: 2,
        value: '2',
      },
      '1': {
        label: 'Ⅰ级 （严重）',
        color: '#f5222d',
        number: 1,
        value: '1',
      },
      '': {
        label: '--',
        color: '#666',
        number: null,
        value: '',
      },
    };
    return {
      levelMap,
      colspans: {
        sm: 12,
        // lg: 8,
      },
      fields: [
        { name: 'name', label: '报警名称' }, //colspans: { sm: 24 }
        {
          name: 'level',
          label: '报警等级',
          render(h, m, v) {
            return (
              <span style={{ color: levelMap[v || '1'].color }}>
                {levelMap[v || '1'].label}
              </span>
            );
          },
        },
        {
          name: 'type',
          label: '业务类型',
          render(h, m, v) {
            return <app-dict-display value={v} />;
          },
        },
        {
          name: 'subType',
          label: '报警类型',
          render(h, m, v) {
            return <app-dict-display value={v} />;
          },
        },
        {
          name: 'address',
          label: '地址',
          // colspans: { sm: 24 },
          render(h, m, v) {
            return v || '--';
          },
        },

        {
          name: 'beginTime',
          label: '第一次报警',
        },
        {
          name: 'endTime',
          label: '最后一次报警',
        },
        {
          name: 'triggerCount',
          label: '报警次数',
          render(h, m, v) {
            return v + '次';
          },
        },
        // {
        //   name: 'noticeLevel',
        //   label: '通知等级',
        // },
        {
          name: 'status',
          label: '状态',
          render(h, m, v) {
            return <app-dict-display value={v} />;
          },
        },
        {
          name: 'handleResult',
          label: '处理结果',
          render(h, m, v) {
            return <app-dict-display value={v} />;
          },
          isHide(m) {
            return !m.handleTime;
          },
        },
        {
          name: 'handleTime',
          label: '处理时间',
          isHide(m) {
            return !m.handleTime;
          },
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
