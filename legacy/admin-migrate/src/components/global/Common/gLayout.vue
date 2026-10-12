<template lang="pug">
.layout-container
    .layout-header
        .header-name
            span.verticalLine {{title}}
        .header-btn
            slot(name='header-btn')
    .layout-content
        .content-left
            slot(name='content-left')
        .content-right
            .content-data
                slot(name='content-data')
            .content-search
                slot(name='content-search')
            .content-table
                slot(name='content-table')
    .layout-footer
        .footer-btn
            slot(name='footer-btn')
        .footer-page
            slot(name='footer-page')
    slot
    
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  setup() {},
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
</style>
<style lang="less">
@import url("@/styles/searchTable/index.less");
.layout-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 8px;
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
        overflow: hidden;
        height: 100%;
        > div {
          width: 100%;

          &.content-search {
            padding-top: 16px;
            position: relative;

            .more-search {
              position: absolute;
              right: 0;
              top: 50%;
              transform: translate(0, -50%);
            }

            .ant-form-item {
              margin-bottom: 16px;
            }
          }

          &.content-table {
            flex: 1;
            overflow:overlay;
            .ant-layout-content {
              border-bottom: none !important;
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
}
</style>
