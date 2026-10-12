<template>
  <div class="g-layout-container">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="pageTitle"></g-vertical-line>
      </div>
      <div class="header-btn">
        <slot name="header-btn"></slot>
      </div>
    </div>
    <div class="layout-content">
      <div class="content-left">
        <slot name="content-left"></slot>
      </div>
      <div class="content-right">
        <div class="content-data">
          <slot name="content-data"></slot>
        </div>
        <div class="content-search">
          <slot name="content-search"></slot>
        </div>
        <div class="statistic-data">
          <slot name="statistic-data"></slot>
        </div>
        <div class="content-table">
          <slot name="content-table"></slot>
        </div>
      </div>
    </div>
    <div class="layout-footer">
      <div class="footer-btn">
        <slot name="footer-btn"></slot>
      </div>
      <div class="footer-page">
        <slot name="footer-page"></slot>
      </div>
    </div>
    <slot />
  </div>
</template>
<script>
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import gVerticalLine from "./gVerticalLine.vue"

export default defineComponent({
  components:{
    gVerticalLine,
  },
  name: "gLayout",
  props: {
    title: {
      type: String,
      default: "",
    },
  },
   setup(props) {
    const route = useRoute();
    const pageTitle = computed(() => {
      const type = route?.query?.type
      if (
        props.title.indexOf("新增") === -1 &&
        props.title.indexOf("详情") === -1 &&
        props.title.indexOf("编辑") === -1
      ) {
        if (type === "detail") {
          return props.title + "详情";
        } else if (type === "add") {
          return props.title + "新增";
        } else if (type === "edit") {
          return props.title + "编辑";
        } else {
          return props.title;
        }
      } else {
        return props.title;
      }
    });
    return {
      pageTitle
    }
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-tabs) {
  height: 100%;
}
:deep(.ant-tabs-content) {
  height: calc(100% - 45px);
}
:deep(.ant-table-body) {
  overflow: overlay;
}
:deep(.ant-table-placeholder) {
  border-bottom: none;
}
:deep(.ant-table-content) {
  border-bottom: none !important;
}
:deep(.ant-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
:deep(.ant-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}
:deep(.ant-table colgroup > col.ant-table-selection-col) {
  width: 60px;
}
</style>
<style lang="less">
.g-layout-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  > div {
    width: 100%;

    &.layout-header {
      height: 53px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      .ant-btn {
        margin-left: 14px;
      }
    }

    &.layout-content {
      display: flex;
      height: calc(100% - 125px);
      .content-left {
        height: 100%;
        padding-top: 16px;
      }
      .content-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        /* flex 子项默认 min-width:auto，宽表格会撑破横向布局；必须可收缩 */
        min-width: 0;
        min-height: 0;
        /* 横向裁切在右侧栏，避免整页被 table 的 scroll.x 撑到无限宽；纵向仍允许子级（如日期面板）绘制 */
        overflow-x: hidden;
        overflow-y: visible;
        height: 100%;
        > div {
          width: 100%;
          min-width: 0;

          &.content-search {
            padding-top: 16px;
            position: relative;
            overflow: visible;

            .more-search {
              position: absolute;
              right: 0;
              bottom: 0;
              transform: translate(0, -50%);
            }

            .ant-form-item {
              margin-bottom: 16px;
            }
          }

          &.content-table {
            flex: 1;
            min-height: 0;
            min-width: 0;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            .ant-layout-content {
              border-bottom: none !important;
            }
            .ant-table-fixed-header
              > .ant-table-content
              > .ant-table-scroll
              > .ant-table-body {
              overflow: overlay !important;
            }
          }
        }
      }
    }

    &.layout-footer {
      height: 72px;
      border-top: 1px solid #f3f3f3;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .footer-btn {
        .ant-btn {
          margin-left: 14px;
        }
      }
      .footer-page {
        .ant-btn {
          margin-left: 10px;
        }
      }
    }
  }
  .ant-select {
    text-align: left;
  }
  .action-btn {
    .ant-btn {
      &.ant-btn-link {
        padding-left: 0;
      }
    }
  }
  .ant-table-tbody {
    .ant-btn {
      height: auto !important;
      padding: 0 15px !important;
      padding-left: 0px !important;
    }
  }
}
</style>
