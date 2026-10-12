<template>
  <el-container style="height: calc(100vh - 160px)">
    <el-aside>
      <div class="components-nav">
        <span @click="libSelect = 0">组件库</span>
      </div>
      <div>
        <el-collapse v-model="activeNames">
          <el-collapse-item :title="group.name" :name="group.name" class="components" v-for="(group, i) in baseComponents" :key="i">
            <ul>
              <draggable
                class="drag"
                :list="group.components"
                :options="{ sort: false }"
                :group="{ name: 'form', pull: 'clone', put: false }"
                @start="isStart = true"
                @end="isStart = false"
                :clone="clone"
              >
                <li v-for="(cp, id) in group.components" :key="id" :data-id="cp.name" :style="{ width: cp.labelWidth ?? '124px' }">
                  <i :class="cp.icon"></i>
                  <span style="white-space: nowrap">{{ cp.title }}</span>
                </li>
              </draggable>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-aside>

    <el-main class="layout-main">
      <div class="tool-nav">
        <div></div>
        <div>
          <el-tooltip class="item" effect="dark" content="预览表单" placement="bottom-start">
            <i class="el-icon-view" @click="viewForms"></i>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="移动端" placement="bottom-start">
            <i :class="{ 'el-icon-mobile': true, select: showMobile }" @click="showMobile = true"></i>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="PC端" placement="bottom-start">
            <i :class="{ 'el-icon-monitor': true, select: !showMobile }" @click="showMobile = false"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="work-form">
        <div :class="{ mobile: showMobile, pc: !showMobile }">
          <div :class="{ bd: showMobile }">
            <div :class="{ 'form-content': showMobile }">
              <div class="form">
                <div class="tip" v-show="forms.length === 0 && !isStart">👈 请在左侧选择控件并拖至此处</div>
                <draggable
                  class="drag-from"
                  :list="forms"
                  group="form"
                  :options="{ animation: 300, chosenClass: 'choose', sort: true }"
                  @start="
                    drag = true;
                    selectFormItem = null;
                  "
                  @end="drag = false"
                  @add="addItem"
                >
                  <div v-for="(cp, id) in forms" :key="id" class="form-item" @click="selectItem(cp)" :style="getSelectedClass(cp)">
                    <div class="form-header">
                      <p style="min-height: 17px"><span v-if="cp.props.required">*</span>{{ cp.title }}</p>
                      <div class="option">
                        <!--<i class="el-icon-copy-document" @click="copy"></i>-->
                        <i class="el-icon-close" @click="del(id)"></i>
                      </div>
                      <form-design-render :config="cp" />
                    </div>
                  </div>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-main>

    <el-aside class="layout-param">
      <div class="tool-nav-r" v-if="selectFormItem">
        <i :class="selectFormItem.icon" style="margin-right: 5px; font-size: medium"></i>
        <span>{{ selectFormItem.title }}</span>
      </div>
      <div v-if="!selectFormItem || forms.length === 0" class="tip">😀 选中控件后在这里进行编辑</div>
      <div style="text-align: left; padding: 10px" v-else>
        <form-component-config />
      </div>
    </el-aside>
    <w-dialog
      clickClose
      closeFree
      width="800px"
      :showFooter="true"
      @ok="handleOk"
      :border="false"
      title="表单预览"
      v-model="viewFormVisible"
    >
      <form-render ref="form" :forms="forms" v-model="formData" v-if="viewFormVisible" />
    </w-dialog>
  </el-container>
</template>

<script>
import draggable from "vuedraggable";

import FormDesignRender from "@/views/admin/layout/form/FormDesignRender";
import { baseComponents } from "@/views/common/form/ComponentsConfigExport";
import FormComponentConfig from "@/views/common/form/FormComponentConfig";
import FormRender from "@/views/common/form/FormRender";

export default {
  name: "FormDesign",
  components: { draggable, FormComponentConfig, FormDesignRender, FormRender },
  props: {
    allowedGroupIds: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      formData: { sponsorId: "2" },
      libSelect: 0,
      viewFormVisible: false,
      isStart: false,
      showMobile: false, //默认为PC端
      select: null,
      drag: false,
      activeNames: baseComponents.map((e) => e.name),
    };
  },
  computed: {
    forms() {
      return this.$store.state.design.formItems;
    },
    selectFormItem: {
      get() {
        return this.$store.state.selectFormItem;
      },
      set(val) {
        this.$store.state.selectFormItem = val;
      },
    },
    nodeMap() {
      return this.$store.state.nodeMap;
    },
    baseComponents() {
      let allowedIds = this.allowedGroupIds;
      if (this.allowedGroupIds.length === 0) {
        allowedIds = ["base", this.$store.state.design.groupId];
      }
      return baseComponents.filter((e) => allowedIds.includes(e.groupId));
    },
  },
  methods: {
    copy(node, index) {
      this.form.splice(index + 1, 0, Object.assign({}, node));
    },
    getId() {
      return "field" + (Math.floor(Math.random() * (99999 - 10000)) + 10000).toString() + new Date().getTime().toString().substring(5);
    },
    del(index) {
      this.$confirm("删除组件将会连带删除包含该组件的条件以及相关设置，是否继续?", "提示", {
        confirmButtonText: "确 定",
        cancelButtonText: "取 消",
        type: "warning",
      }).then(() => {
        if (this.forms[index].name === "GroupList") {
          //删除的是分栏则遍历删除分栏内所有子组件
          this.forms[index].props.items.forEach((item) => {
            this.removeFormItemAbout(item);
          });
          this.forms[index].props.items.length = 0;
        } else {
          this.removeFormItemAbout(this.forms[index]);
        }
        this.forms.splice(index, 1);
      });
    },
    async removeFormItemAbout(item) {
      this.nodeMap.forEach((node) => {
        //搜寻条件，进行移除
        if (node.type === "CONDITION") {
          node.props.groups.forEach((group) => {
            let i = group.cids.remove(item.id);
            if (i > -1) {
              //从子条件移除
              group.conditions.splice(i, 1);
            }
          });
        }
        //搜寻权限，进行移除
        if (node.type === "ROOT" || node.type === "APPROVAL" || node.type === "CC") {
          node.props.formPerms.removeByKey("id", item.id);
          node.props.outerFormPerms.removeByKey("id", item.id);
          if (node.props.formUser === item.id) {
            node.props.formUser = "";
          }
        }
      });
    },
    clone(obj) {
      obj.id = this.getId();
      return JSON.parse(JSON.stringify(obj));
    },
    // 添加事件
    addItem(obj) {
      const index = obj.newIndex;
      //默认权限添加
      this.nodeMap.forEach((node) => {
        if (node.type === "ROOT" || node.type === "APPROVAL" || node.type === "CC") {
          node.props.formPerms.splice(index, 0, {
            id: this.forms[index].id,
            perm: node.type === "ROOT" ? "E" : "R",
            required: this.forms[index].props.required,
            title: this.forms[index].title,
          });
          node.props.outerFormPerms.splice(index, 0, {
            id: this.forms[index].id,
            perm: node.type === "ROOT" ? "E" : "R",
            required: this.forms[index].props.required,
            title: this.forms[index].title,
          });
        }
      });
    },
    viewForms() {
      this.viewFormVisible = true;
    },
    selectItem(cp) {
      this.selectFormItem = cp;
    },
    getSelectedClass(cp) {
      let style = "";
      if (this.selectFormItem && this.selectFormItem.id === cp.id) {
        style += "border-left: 4px solid #409eff;";
      }
      if (!this.showMobile) {
        style += `width:${cp.width || cp.width === 0 ? cp.width : 100}%`;
      }
      return style;
    },
    flattenFormItems(items) {
      const result = [];
      items.forEach((item) => {
        result.push(item);
        if (item.name === "GroupList" && item.props && Array.isArray(item.props.items)) {
          result.push(...this.flattenFormItems(item.props.items));
        }
      });
      return result;
    },
    validateItem(err, titleSet, item) {
      if (titleSet.has(item.title) && item.name !== "GroupList") {
        err.push(`表单 ${item.title} 名称重复`);
      }
      titleSet.add(item.title);
      if (item.name === "SelectInput" || item.name === "MultipleSelect") {
        if (item.props.options.length === 0) {
          err.push(`${item.title} 未设置选项`);
        }
        if (item.props.options.includes("")) {
          err.push(`${item.title} 含有空选项`);
        }
      } else if (item.name === "TableList") {
        if (item.props.columns.length === 0) {
          err.push(`明细表 ${item.title} 内未添加组件`);
        }
      } else if (item.name === "GroupList") {
        if (item.props.items.length === 0) {
          err.push("组合容器未添加组件");
        } else {
          item.props.items.forEach((sub) => this.validateItem(err, titleSet, sub));
        }
      }
    },
    validateAlarmRecords(err) {
      const formItems = this.flattenFormItems(this.forms);
      const relatedDeviceItems = formItems.filter((item) => item.name === "RelatedDeviceSelect");
      const relatedDeviceIds = relatedDeviceItems.map((item) => item.id);
      const timeRangeItems = formItems.filter((item) => ["DateTimeRange", "TimePickerRange"].includes(item.name));
      const timeRangeIds = timeRangeItems.map((item) => item.id);
      formItems
        .filter((item) => item.name === "AlarmRecords")
        .forEach((item) => {
          if (relatedDeviceItems.length === 0) {
            err.push(`${item.title} 必须和关联设备组件同时存在`);
            return;
          }
          if (!item.props.params) {
            err.push(`${item.title} 未设置关联设备`);
            return;
          }
          if (!relatedDeviceIds.includes(item.props.params)) {
            err.push(`${item.title} 只能关联关联设备组件`);
          }
          if (item.props.params2 && !timeRangeIds.includes(item.props.params2)) {
            err.push(`${item.title} 只能关联日期时间区间或时间选择区间组件`);
          }
        });
    },
    validate() {
      let err = [];
      if (this.forms.length > 0) {
        let titleSet = new Set();
        this.forms.forEach((item) => {
          //主要校验表格及分栏/选择器/表单名称/是否设置
          this.validateItem(err, titleSet, item);
        });
        this.validateAlarmRecords(err);
      } else {
        err.push("表单为空，请添加组件");
      }
      return err;
    },
    handleOk() {
      this.viewFormVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.choose {
  border: 1px dashed @primary-color !important;
}

.process-form {
  /deep/ .el-form-item__label {
    padding: 0 0;
  }
}

.components-nav {
  box-sizing: content-box;
  display: flex;
  align-items: center;
  margin: 12px 12px 0;
  height: 28px;
  box-shadow: 0 2px 4px 0 rgba(17, 31, 44, 0.04);
  border: 1px solid #ecedef;
  border-radius: 16px;
  background-color: #fff;

  .selected {
    color: @primary-color;
  }

  .border {
    border-left: 1px solid #f5f6f6;
    border-right: 1px solid #f5f6f6;
  }

  span {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    color: rgba(17, 31, 44, 0.72);
    cursor: pointer;

    &:hover {
      color: @primary-color;
    }
  }
}

.components {
  overflow-x: hidden;
  overflow-y: auto;
  font-size: 12px;
  width: 100%;
  color: rgba(17, 31, 44, 0.85);

  & > p {
    padding: 0 20px;
  }

  .drag {
    margin-left: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    li {
      text-align: center;
      display: flex;
      align-items: center;
      width: 124px;
      height: 38px;
      margin-bottom: 12px;
      border: 1px solid #ededed;
      border-radius: 8px;
      cursor: grab;
      background-color: #fff;

      &:hover {
        border: 1px solid @primary-color;
        color: @primary-color;
      }

      i {
        margin: 0 12px;
      }
    }

    li:nth-child(odd) {
      margin-right: 8px;
    }
  }

  /deep/ .el-collapse-item__header {
    background: #fff;
    width: 85%;
    margin: 0 auto;
    border-bottom: 0;
  }

  /deep/ .el-collapse-item__content {
    background: #fff;
  }

  /deep/ .el-collapse-item__wrap {
    border: 0;
  }
}

/deep/ .el-main {
  padding: 0;
}

.layout-main {
  background-color: #feffff;

  .tool-nav {
    font-size: medium;
    padding: 8px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;
    display: none;
    div:first-child {
      display: inline-block;
      text-align: left;

      i {
        margin-right: 10px;
      }
    }

    div:last-child {
      float: right;

      i {
        margin-left: 10px;
      }
    }

    i {
      color: #7a7a7a;
      cursor: pointer;

      &:hover {
        color: #4b4b4b;
      }
    }
  }

  .work-form {
    margin: 0 auto;
    height: calc(100% - 0px);
    overflow-y: auto;
    background: rgb(245, 246, 246);
    border-left: 1px solid rgb(235, 236, 238);
    border-right: 1px solid rgb(235, 236, 238);

    .pc {
      .drag-from {
        height: calc(100vh - 190px);
        background-color: rgb(245, 246, 246);

        .form-item {
          box-sizing: border-box;
          display: inline-block;
        }

        .form-item,
        li {
          cursor: grab;
          background: #ffffff;
          padding: 10px;
          margin: 5px 0;
          box-sizing: border-box;
        }
      }
    }

    .mobile {
      margin-left: auto;
      margin-right: auto;
      width: 360px;
      max-height: 640px;
      margin-top: 4%;
      border-radius: 24px;
      box-shadow: 0 8px 40px 0 rgba(17, 31, 44, 0.12);

      .bd {
        border: 1px solid rgba(17, 31, 44, 0.08);
        border-radius: 24px;
        padding: 10px 10px;
        background-color: #ffffff;

        .form-content {
          padding: 3px 2px;
          border-radius: 14px;
          background-color: #f2f4f5;

          .drag-from {
            width: 100%;
            height: calc(100vh - 190px);
            min-height: 200px;
            max-height: 600px;
          }

          .form {
            overflow-y: auto;
            width: 100%;
            display: inline-block;
            max-height: 640px;

            .form-item,
            li {
              border: 1px solid #ffffff;
              list-style: none;
              background: #ffffff;
              padding: 10px;
              margin: 5px 0;
              cursor: grab;
            }
          }
        }
      }
    }

    .tip {
      //float: left;
      margin: 0 auto;
      width: 65%;
      max-width: 400px;
      padding: 35px 20px;
      border-radius: 10px;
      border: 1px dashed rgba(25, 31, 37, 0.12);
      margin-top: 50px;
      text-align: center;
      font-size: 14px;
      color: rgb(122, 122, 122);
      z-index: 9999;

      &:hover {
        border: 1px dashed @primary-color;
      }
    }
  }
}

.layout-param {
  text-align: center;
  font-size: 14px;
  color: rgb(122, 122, 122);

  .tool-nav-r {
    text-align: left;
    font-size: small;
    border-left: 1px solid #ebecee;
    padding: 10px 20px;
    background: #fafafb;
    border-bottom: 1px solid #ebecee;
  }

  .tip {
    margin-top: 150px;
  }
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.select {
  color: #4b4b4b !important;
}

.form-header {
  font-size: small;
  color: #818181;
  text-align: left;
  position: relative;
  background-color: #fff;

  p {
    position: relative;
    margin: 0 0 10px 0;

    span {
      position: absolute;
      left: -8px;
      top: 3px;
      color: rgb(217, 0, 19);
    }
  }

  .option {
    position: absolute;
    top: -10px;
    right: -10px;

    i {
      font-size: large;
      cursor: pointer;
      color: #8c8c8c;
      padding: 5px;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  /deep/ .el-date-editor--daterange {
    width: 100%;
  }

  /deep/ .el-date-editor {
    max-width: 100%;
    width: 100%;
  }

  /deep/ .el-date-editor {
    max-width: 100%;
    width: 100%;
  }
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: #f8f8f8;
}

::-webkit-scrollbar-thumb {
  border-radius: 16px;
  background-color: #e8e8e8;
}

.el-collapse {
  border: 0;
}

.el-aside {
  background-color: white;
}
</style>
