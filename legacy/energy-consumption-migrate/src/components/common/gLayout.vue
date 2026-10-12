<template>
  <div class="layout-container">
    <div class="layout-header" v-if="props.title">
      <div class="header-name">
        <g-vertical-line :title="props.title" />
      </div>
      <div class="header-btn">
        <slot name="header-btn" />
      </div>
    </div>
    <div class="layout-content">
      <div class="content-left">
        <slot name="content-left" />
      </div>
      <div class="content-right">
        <div class="content-data">
          <slot name="content-data" />
        </div>
        <div v-if="showSearch" class="content-search">
          <slot name="content-search" />
        </div>
        <div class="statistic-data">
          <slot name="statistic-data" />
        </div>
        <div class="content-table" :class="{ 'content-table--scrollable': props.contentTableScrollable }">
          <slot name="content-table" />
        </div>
      </div>
    </div>
    <div v-if="showFooter" class="layout-footer">
      <div class="footer-btn">
        <slot name="footer-btn" />
      </div>
      <div class="footer-page">
        <slot name="footer-page" />
      </div>
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
import GVerticalLine from "./gVerticalLine.vue";
interface Props {
  /** 标题 */
  title?: string;
  showFooter?: boolean;
  showSearch?: boolean;
  /** 供总览类长页面使用的内容区纵向滚动 */
  contentTableScrollable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  title: "",
  showFooter: false,
  showSearch: false,
  contentTableScrollable: false,
});
const height = props.showFooter ? "calc( 100% - 240px )" : "calc( 100% - 140px )";
</script>
<style lang="less" scoped>
:deep(.energy-tabs) {
  height: 100%;
  min-height: 0;
}
:deep(.energy-tabs-content-holder) {
  min-height: 0;
}
:deep(.energy-tabs-content) {
  height: 100%;
  min-height: 0;
}
:deep(.energy-table-body) {
  max-height: calc(100vh - 350px) !important;
  overflow-y: auto !important;
}
:deep(.energy-table-placeholder) {
  border-bottom: none;
}
:deep(.energy-table-content) {
  border-bottom: none !important;
}
:deep(.energy-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
:deep(.energy-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}
:deep(.energy-table colgroup > col.energy-table-selection-col) {
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
  flex-wrap: nowrap;

  > div {
    width: 100%;

    &.layout-header {
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      font-family: "SourceHanSansCN-Medium-2";
      .energy-btn {
        margin-left: 14px;
      }
    }

    &.layout-content {
      display: flex;
      height: v-bind(height);
      .content-left {
        height: 100%;
        padding-top: 16px;
      }
      .content-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        overflow: hidden;
        height: 100%;
        min-height: 0;
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

            .energy-form-item {
              margin-bottom: 16px;
            }
          }

          &.content-table {
            flex: 1;
            min-height: 0;
            overflow: hidden;

            &.content-table--scrollable {
              overflow-y: auto;
              overflow-x: hidden;
            }
            .energy-layout-content {
              border-bottom: none !important;
            }
            .energy-table-fixed-header .energy-table-scroll .energy-table-header {
              overflow: overlay !important;
            }
            .energy-table-fixed-header > .energy-table-content > .energy-table-scroll > .energy-table-body {
              overflow: overlay !important;
            }
          }
        }
      }
    }

    &.layout-footer {
      height: 65px;
      border-top: 1px solid #f3f3f3;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .footer-btn {
        .energy-btn {
          margin-left: 14px;
        }
      }
      .footer-page {
        .energy-btn {
          margin-left: 10px;
        }
      }
    }
  }
  .energy-select {
    text-align: left;
  }
  .action-btn {
    .energy-btn {
      &.energy-btn-link {
        padding-left: 0;
      }
    }
  }
  .energy-table-tbody {
    .energy-btn {
      height: auto !important;
      padding: 0 15px !important;
      padding-left: 0px !important;
    }
  }
}

::-webkit-scrollbar {
  width: 0.16rem;
  // width: 0;
  background: rgba(117, 180, 253, 0.2);
  box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
  border-radius: 0.08rem;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
}

/*滚动条的上下两端的按钮*/
::-webkit-scrollbar-button {
  height: 0px;
}
</style>
