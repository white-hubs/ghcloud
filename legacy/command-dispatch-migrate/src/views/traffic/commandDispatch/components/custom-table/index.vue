<template>
  <div class="custom-table">
    <div class="table-header">
      <div v-for="item in columns" :key="item.dataIndex">{{ item.title }}</div>
    </div>
    <a-spin :spinning="loading">
      <div class="table-body">
        <div v-if="dataSource.length">
          <div class="table-row-item" v-for="(rowItem,index) in dataSource" :key="index">
            <div v-for="columnItem in columns" :key="rowItem[columnItem.key]" :class="{ellipsis:columnItem.ellipsis}">
              <template v-if="Object.keys(slots).includes(columnItem.dataIndex)">
                <slot :name="columnItem.dataIndex" :row="rowItem" :column="columnItem"></slot>
              </template>
              <template v-else>
                <a-tooltip placement="topLeft" :title="rowItem[columnItem.key]" arrow-point-at-center>
                  {{rowItem[columnItem.key]}}
                </a-tooltip>
              </template>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <a-empty></a-empty>
        </div>
      </div>
    </a-spin>

  </div>
</template>

<script>
import { defineComponent, useSlots } from "vue";
export default defineComponent({
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  name: 'customTable',
  setup(props, { emit }) {
    const slots = useSlots()
    return {
      slots
    }
  }
})
</script>
<style scoped lang="less">
.custom-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .table-header {
    height: 42px;
    flex-shrink: 0;
    background: #285487;
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    padding-left: 20px;
    color: white;
    display: flex;



    >div {
      flex: 1;
      height: 100%;
      line-height: 42px;
      text-align: left;
    }
  }

  .table-body {
    position: relative;
    flex: 1;
    overflow: auto;

    .table-row-item {
      min-height: 42px;
      font-size: 14px;
      font-family: PingFang SC-Regular;
      font-weight: 400;
      color: #e4e4e4;
      padding-left: 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      .ellipsis {
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
      }

      >div {
        flex: 1;
        height: 100%;
        text-align: left;

        >span {
          color: rgba(41, 137, 255, 1);
          cursor: pointer;
        }
      }
    }
  }

  .pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }


}
</style>
<style lang="less">
.custom-table {}
</style>