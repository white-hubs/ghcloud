<template>
<div class="layout-container">
  <div class="layout-header">
    <div class="header-name">
      <g-vertical-line :title="title"></g-vertical-line>
    </div>
    <div class="header-btn">
      <slot name='header-btn'></slot>
    </div>
  </div>
  <div class="layout-content">
    <div class="content-left">
      <slot name='content-left'></slot>
    </div>
    <div class="content-right">
      <div class="content-data">
        <slot name='content-data'></slot>
      </div>
      <div class="content-search">
        <slot name='content-search'></slot>
      </div>
      <div class="statistic-data">
        <slot name='statistic-data'></slot>
      </div>
      <div class="content-table">
        <slot name='content-table'></slot>
      </div>
    </div>
  </div>
  <div class="layout-footer">
    <div class="footer-btn">
      <slot name='footer-btn'></slot>
    </div>
    <div class="footer-page">
      <slot name='footer-page'></slot>
    </div>
  </div>
  <slot/>
</div>
</template>

<script>
export default {
  name:'gLayout',
  props: {
    title: {
      type: String,
      default: "",
    },
  },
}
</script>

<style lang="less" scoped>
.layout-container {
  // width: 100%;
  // height: 100%;
  background: #ffffff;
  border-radius: 4px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  // flex-wrap: wrap;

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
}
</style>