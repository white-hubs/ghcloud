<script>
export default {
  props: {
    baseInfo: Object,
    fields: {
      default: () => [
        { name: 'id', label: 'ID' },
        { name: 'name', label: '名字' },
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
      type: [Number, String, Boolean],
    },
    lineHeight: {
      default: 40,
      type: Number,
    },
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {},
  render() {
    return (
      <div class="base-info-container">
        <a-row gutter={16}>
          {this.fields
            .filter((item) => {
              if (typeof item.isHide === 'function') {
                return !item.isHide(this.baseInfo);
              }
              return !item.isHide;
            })
            .map((item) => {
              return (
                <a-col
                  sm={item.colspans ? item.colspans.sm : this.colspans.sm}
                  md={item.colspans ? item.colspans.md : this.colspans.md}
                  lg={item.colspans ? item.colspans.lg : this.colspans.lg}
                >
                  <div
                    class="info-item"
                    style={{
                      'line-height':
                        (item.lineHeight ? item.lineHeight : this.lineHeight) +
                        'px',
                    }}
                  >
                    <div
                      class="info-field pr2"
                      style={{
                        width: item.labelWidth
                          ? item.labelWidth + 'px'
                          : this.labelWidth
                          ? this.labelWidth + 'px'
                          : 'auto',
                      }}
                    >
                      {item.label ? item.label + ': ' : item.label}
                    </div>
                    <div class="info-value">
                      {item.render
                        ? item.render(
                            this.$createElement,
                            this.baseInfo,
                            this.baseInfo[item.name],
                          )
                        : this.baseInfo[item.name]}
                    </div>
                  </div>
                </a-col>
              );
            })}
        </a-row>
      </div>
    );
  },
};
</script>
<style lang="less" scoped>
.base-info-container {
  height: 100%;
  padding: 1rem;
  .app-form-group-title {
    margin-top: 1rem;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    line-height: 40px;
    .info-field {
      width: 80px;
      text-align: right;
      // color: rgba(0, 0, 0, 0.7);
      color: #999;
    }
    .info-value {
      color: #333;
      flex: 1;
      // overflow: hidden;
      // white-space: nowrap;
      // text-overflow: ellipsis;
    }
  }
}
</style>
