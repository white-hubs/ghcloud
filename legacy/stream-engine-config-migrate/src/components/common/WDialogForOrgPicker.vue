<template>
  <el-dialog custom-class="custom-dialog" class="border" :width="width" :title="title" append-to-body @close="_value = false; $emit('cancel')" :close-on-click-modal="clickClose" :destroy-on-close="closeFree" :visible.sync="_value">
    <slot></slot>
    <template slot='title'>
      <g-vertical-line :title="title"></g-vertical-line>
    </template>
    <div slot="footer" v-if="showFooter" class="">
      <el-button  @click="_value = false; $emit('cancel')">{{ cancelText }}</el-button>
      <el-button  type="primary" @click="$emit('ok')">{{ okText }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "WDialogForOrgPicker",
  install(Vue) {
    Vue.component('WDialogForOrgPicker', this)
  },
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '50%'
    },
    value: {
      type: Boolean,
      default: false
    },
    clickClose: {
      type: Boolean,
      default: false
    },
    closeFree: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取 消'
    },
    okText: {
      type: String,
      default: '确 定'
    },
    border: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    _value: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="less" scoped>
/deep/ .custom-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px !important;
  height: 685px !important;
  max-width: 100%;
  max-height: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  opacity: 1;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  .el-dialog__body{
    padding: 16px;
    height: calc(100% - 145px);
  }
  .el-dialog__header {
    box-sizing: border-box;
    height: 47px;
    padding: 13px 18px 13px 15px;
    .verticalLine {
      font-size: 16px;
      font-weight: normal;
      color: #333333;
    }
    .verticalLine::before {
      margin-top: 2px;
    }
    .el-dialog__headerbtn {
      top: 15px;
      .i {
        font-size: large;
      }
    }
  }

  .el-dialog__footer {
    height: 68px;
    width: 100%;
    bottom: 0;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.border {
  /deep/ .el-dialog__header {
    border-bottom: 1px solid #e8e8e8;
  }
  /deep/ .el-dialog__footer {
    border-top: 1px solid #e8e8e8;
  }
}
</style>
