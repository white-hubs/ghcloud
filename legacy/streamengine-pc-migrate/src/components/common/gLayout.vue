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
<script setup lang="ts">
import gVerticalLine from './gVerticalLine.vue';
interface Props {
  /** 标题 */
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
});
</script>
<style lang="less" scoped>
:deep(.template-tabs) {
  height: 100%;
}

:deep(.template-tabs-content) {
  height: 100%;
}

:deep(.template-table-body) {
  overflow: overlay;
}

:deep(.template-table-placeholder) {
  border-bottom: none;
}

:deep(.template-table-content) {
  border-bottom: none !important;
}

:deep(.template-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.template-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}

:deep(.template-table colgroup > col.template-table-selection-col) {
  width: 20px;
}
</style>
<style lang="less">
.layout-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  >div {
    width: 100%;

    &.layout-header {
      height: 53px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f3f3f3;
      font-family: "SourceHanSansCN-Medium-2";

      .template-btn {
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

        >div {
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

            .template-form-item {
              margin-bottom: 16px;
            }
          }

          &.content-table {
            flex: 1;
            overflow: hidden;

            .template-layout-content {
              border-bottom: none !important;
            }

            .template-table-fixed-header .template-table-scroll .template-table-header {
              overflow: overlay !important;
            }

            .template-table-fixed-header>.template-table-content>.template-table-scroll>.template-table-body {
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
        .template-btn {
          margin-left: 14px;
        }
      }

      .footer-page {
        .template-btn {
          margin-left: 10px;
        }
      }
    }
  }

  .template-select {
    text-align: left;
  }

  .action-btn {
    .template-btn {
      &.template-btn-link {
        padding-left: 0;
      }
    }
  }

  .template-table-tbody {
    .template-btn {
      height: auto !important;
      padding: 0 15px !important;
      padding-left: 0px !important;
    }
  }
}</style>
