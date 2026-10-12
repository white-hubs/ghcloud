<template>
  <div class="treeSelect">
    <el-select
      :value="valueTitle"
      :multiple="multiple"
      :collapse-tags="collapse"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      :style="selectStyle"
      @input="$emit('input',$event)"
      @clear="handleClear"
      @remove-tag="handleRemoveTag"
    >
      <el-option :value="valueId" :label="label">
        <el-tree
          id="tree-option"
          ref="selectTree"
          :accordion="accordion"
          :show-checkbox="multiple"
          :data="options"
          :props="treeProps"
          :node-key="treeProps.id"
          :check-strictly="checkStrictly"
          :default-expand-all="expand"
          :auto-expand-parent="expandParent"
          :expand-on-click-node="expandNode"
          :default-expanded-keys="defaultExpandedKeys"
          @node-click="handleNodeClick"
          @check-change="handleCheckChange"
        >
        </el-tree>
      </el-option>
    </el-select>
  </div>
</template>



<style lang="less" scoped>
 .el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  // max-height: 274px;
  padding: 0;
  overflow: hidden;
  // overflow: hidden;
  // overflow-y: auto;
}

.el-scrollbar .el-select-dropdown__item.selected {
  font-weight: normal;
}

// 横向滚动条
.el-scrollbar__bar.is-horizontal {
  height: 6px;
  left: 2px;
}
// 纵向滚动条
.el-scrollbar__bar.is-vertical {
  width: 6px;
  top: 2px;
}


// 字体和大小
.custom-tree-node {
  font-family:"Microsoft YaHei";
  font-size: 14px;
  position: relative;
}

// 原生el-tree-node的div是块级元素，需要改为inline-block，才能显示滚动条
.treeSelect .el-tree >.el-tree-node {
  display: inline-block;
  min-width: 100%;
}

// ul li ::v-deep .el-tree .el-tree-node__content {
//   height: auto;
//   padding: 0 20px;
// }

// .el-tree-node__label {
//   font-weight: normal;
// }


.el-tree ::v-deep .is-current .el-tree-node__label {
  color: #1B65B9;
  font-weight: 700;
}

.el-tree ::v-deep .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
</style>


<script>
export default {
  name: 'tree-select',
  props:{
    // 是否可多选，默认单选
    multiple: {
      type: Boolean,
      default: false
    },
    // 可清空选项
    clearable:{
      type:Boolean,
      default:() => { return true }
    },
    // -------------------- el-tree --------------------
    // 配置项
    treeProps:{
      type: Object,
      default:() => {
        return {
          id:'id', // ID字段名
          label: 'title', // 显示名称
          children: 'children' // 子级字段名
        }
      }
    },
    // 选项列表数据(树形结构的对象数组)
    options:{
      type: Array,
      default: () => { return [] }
    },
    // 自动收起
    accordion:{
      type:Boolean,
      default:() => { return false }
    },
    // 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
    checkStrictly:{
      type:Boolean,
      default:() => { return false }
    },
    // 是否展开所有节点，默认展开
    expand: {
      type: Boolean,
      default() {
        return true;
      }
    },
    // 展开子节点的时候是否自动展开父节点 默认值为 true
    expandParent:{
      type: Boolean,
      default() {
        return true;
      }
    },
    // 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
    expandNode: {
      type: Boolean,
      default() {
        return true;
      }
    },
    // -------------------- el-select --------------------
    // 初始值 - 绑定value是为了外面也可以传值改变到里面的值双向绑定
    value: {
      type: [String, Number, Boolean, Array],
      default: () => { return null }
    },
    // 多选时是否将选中值按文字的形式展示
    collapse: {
      type: Boolean,
      default: false
    },
    // 选择框大小
    size:{
      type:String,
      default:() => { return 'small' }
    },
    // 选择框 宽度
    width: {
      type: String,
      default: '270px'
    },
    // 是否禁用
    disabled:{
      type:Boolean,
      default:() => { return false }
    }
  },
  data() {
    return {
      valueId: this.value, // 初始值
      valueTitle: '',
      label:'', // 分组
      defaultExpandedKeys:[]
    }
  },
  mounted(){
    this.initHandle();
  },
  methods: {
    /**
     * @description: 初始化组件
     * @param {*}
     * @return {*}
     */
    initHandle(){
      // 单选
      if(this.valueId && !this.multiple){
        var node = this.$refs.selectTree.getNode(this.valueId);
        if(node){
          this.valueTitle = node.data[this.treeProps.label]; // 初始化显示
          this.defaultExpandedKeys = [this.valueId]; // 设置默认展开
          this.$nextTick(() => {
            this.$refs.selectTree.setCurrentKey(this.valueId); // 设置默认选中
          })
        }
      }
      // 多选
      if(this.valueId && this.multiple){
        this.defaultExpandedKeys = this.valueId; // 设置默认展开
        this.$nextTick(() => {
          this.$refs.selectTree.setCheckedKeys(this.valueId); // 设置默认选中
        })
      }
    },
    /**
     * @description: 单选 - 节点被点击时的回调,返回被点击的节点数据
     * @param {*}
     * @return {*}
     */
    handleNodeClick(node){
      this.valueTitle = node[this.treeProps.label];
      this.valueId = node[this.treeProps.id];
      this.defaultExpandedKey = [];
      this.$emit('getValue', this.valueId, this.valueTitle);
    },
    /**
     * @description: 多选，节点勾选状态发生变化时的回调
     * @param {*}
     * @return {*}
     */
    handleCheckChange (data, checked) {
      let currentNode = this.$refs.selectTree.getNode(data);
      if(this.checkStrictly){
        // 用于：父子节点严格互不关联时，父节点勾选变化时通知子节点同步变化，实现单向关联
        if(checked) {
          // 选中 子节点只要被选中父节点就被选中
          this.parentNodeChange(currentNode);
        } else {
          // 未选中 处理子节点全部未选中
          this.childNodeChange(currentNode);
        }
      }
      // 用于：父子节点严格关联时
      this.valueId = this.$refs.selectTree.getCheckedKeys();
      var checkedNodes = this.$refs.selectTree.getCheckedNodes();
      this.valueTitle = checkedNodes.map((node) => {
        return node[this.treeProps.label];
      });
      this.defaultExpandedKeys = [];
      this.$emit('getValue', this.valueId, this.valueTitle);
    },
    /**
     * @description: 清除选中
     * @param {*}
     * @return {*}
     */
    handleClear(){
      this.valueTitle = '';
      this.valueId = '';
      this.defaultExpandedKeys = [];
      // 清除树
      if(this.multiple){
        this.$refs.selectTree.setCheckedKeys(null);
      } else {
        this.$refs.selectTree.setCurrentKey(null);
      }
      this.$emit('getValue', null);
    },
    /**
     * @description: 多选 删除任一标签选项的回调
     * @param {*}
     * @return {*}
     */
    handleRemoveTag(val){
      var checkedNodes = this.$refs.selectTree.getCheckedNodes();
      var node = checkedNodes.find(node => node[this.treeProps.label] === val);
      this.$refs.selectTree.setChecked(node[this.treeProps.id], false);
    },
    // 统一处理子节点为不选中
    childNodeChange (node) {
      for(let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].checked = false;
        this.childNodeChange(node.childNodes[i]);
      }
    },
    // 统一处理父节点为选中
    parentNodeChange (node) {
      if(node.parent.key !== undefined) {
        node.parent.checked = true;
        this.parentNodeChange(node.parent);
      }
    }
  },
  watch: {
    value(){
      this.valueId = this.value
      this.initHandle()
      if(!this.value){
        this.valueTitle=''
      }
    },
    // 父子组件双向绑定value
    valueId(){
      this.$emit('input', this.valueId);
    }
  },
  computed:{
    selectStyle() {
      return {
        width: `${this.width}`
      };
    }
  }
};
</script>


