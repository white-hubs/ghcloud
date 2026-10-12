import dragula from 'dragula';
import _ from 'lodash';
export default () => {
  return {
    props: {
      sortable: Boolean, // 拖动排序支持
      handlerClass: {
        type: String,
        default: 'drag-handler'
      },
      parentKey: {
        type: String,
        default: 'parentId'
      }
    },
    mounted() {
      if (this.sortable) {
        this.initializeDragula();
      }
    },
    beforeDestory() {
      this.drake && this.drake.destory();
    },
    methods: {
      normalizeId(id) {
        if (id) {
          return id.replace(/:/gi, '_');
        }
        return id;
      },
      flatData() {
        function flat(data) {
          let flatData = [];
          data.forEach(item => {
            flatData.push(item);
            if (!_.isEmpty(item.children)) {
              flatData.push(...flat(item.children));
            }
          });
          return flatData;
        }
        return flat(this.data);
      },
      initializeDragula() {
        const warpper = this.$el.querySelector('tbody.ant-table-tbody');
        const me = this;
        const drake = (this.drake = dragula([warpper], {
          mirrorContainer: warpper,
          accepts: (el, target, source, sibling) => {
            const elcls = _.find(el.classList, item =>
              item.startsWith('parent_')
            );
            const subcls = _.find(sibling.classList, item =>
              item.startsWith('parent_')
            );
            if (elcls !== subcls && !this.notifying) {
              this.notifying = true;
              this.$message
                .info('只允许拖动改变顺序，不允许改变父子级。')
                .then(() => {
                  this.notifying = false;
                });
            }
            return elcls === subcls;
          },
          moves: function(el, container, handle) {
            while (!handle.classList.contains(me.handlerClass)) {
              handle = handle.parentNode;
              if (handle === this.mirrorContainer) {
                handle = null;
                break;
              }
            }
            return !!handle;
          }
        }));
        drake.on('drag', el => {
          const id = el.dataset.rowKey;
          if (!_.isEmpty(this.expandedRowKeys)) {
            this.$emit(
              'expandedRowsChange',
              this.expandedRowKeys.filter(a => a !== id)
            );
          }
        });
        drake.on('dragend', async el => {
          const id = el.dataset.rowKey;
          const item = this.flatData(this.data).find(item => item.id === id);
          const nodes = warpper.querySelectorAll(
            `.parent_` + this.normalizeId(_.get(item, this.parentKey))
          );
          const ids = _.map(nodes, item => item.dataset.rowKey);
          this.$emit('on-sort', ids);
        });
      }
    }
  };
};
