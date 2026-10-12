<template lang="pug">
  div.base-info-container
    a-row(:gutter="16")
      a-col(v-for="f in fields" :key="f.name" v-bind="colspans")
        div.info-item
          div.info-field(:style="{width: labelWidth+'px'}") {{ f.label }}
          div.info-value(:title="baseInfo[f.name]") {{ f.render ? f.render(baseInfo) : baseInfo[f.name] }}
</template>
<script>
export default {
  props: {
    baseInfo: Object,
    fields: {
      default: () => [
        { name: 'code', label: '诉求编号' },
        { name: 'startUserId', label: '发起对象' },
        { name: 'contactPhone', label: '联系方式' },
        { name: 'type', label: '诉求类型' },
        { name: 'status', label: '当前状态' },
        { name: 'source', label: '诉求来源' },
        { name: 'description', label: '诉求描述' },
        { name: 'photos', label: '诉求图片' },
      ],
      type: Array,
    },
    colspans: {
      default: () => {
        return { sm: 24 };
      },
      type: Object,
    },
    labelWidth: {
      default: 80,
      type: Number,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {},
  // render() {
  //   return (
  //     <div className="base-info-container">
  //       <a-row>
  //         <a-col>
  //           <div className="info-item">
  //             <div className="info-field">{this.baseInfo}</div>
  //             <div className="info-value"></div>
  //           </div>
  //         </a-col>
  //       </a-row>
  //     </div>
  //   );
  // },
};
</script>
<style lang="less" scoped>
.base-info-container {
  // width: 100%;
  height: 100%;
  padding: 1rem;
  .app-form-group-title {
    margin-top: 1rem;
  }
  .info-item {
    display: flex;
    align-items: center;
    line-height: 40px;
    .info-field {
      width: 80px;
      text-align: right;
      &::after {
        display: inline;
        content: ': ';
        padding-right: 1rem;
      }
    }
    .info-value {
      color: #333;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
