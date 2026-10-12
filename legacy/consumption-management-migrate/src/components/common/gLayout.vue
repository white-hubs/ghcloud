<template>
  <div class="layout-container">
    <div class="layout-header">
      <div class="header-name">
        <g-vertical-line :title="props.title"></g-vertical-line>
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
        <div class="content-search" v-if="showSearch">
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
    <div class="layout-footer" v-if="showfooter">
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
<script setup lang="ts">
import { defineComponent } from "vue";
import GVerticalLine from "./gVerticalLine.vue";
interface Props {
  /** 标题 */
  title?: string;
  showfooter?: boolean;
  showSearch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  showfooter: false,
  showSearch: true,
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
  width: 20px;
}
</style>
<style lang="less">
.layout-container {
  position: relative;
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
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      font-family: "SourceHanSansCN-Medium-2";
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
        overflow: hidden;
        height: 100%;
        > div {
          width: 100%;

          &.content-search {
            padding: 16px 0;
            position: relative;

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
            overflow: hidden;
            .ant-layout-content {
              border-bottom: none !important;
            }
            .ant-table-fixed-header .ant-table-scroll .ant-table-header {
              overflow: overlay !important;
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
