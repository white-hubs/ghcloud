<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder[0]" placeholder="开始日期提示" maxlength="20" show-word-limit/>
      <el-input size="small" v-model="value.placeholder[1]" placeholder="结束日期提示" maxlength="20" show-word-limit class='end-date-tips'/>
    </el-form-item>
    <el-form-item label="日期格式">
      <el-select size="small" v-model="value.format">
        <el-option value="yyyy" label="年"></el-option>
        <el-option value="yyyy-MM" label="年-月"></el-option>
        <el-option value="yyyy-MM-dd" label="年-月-日"></el-option>
        <el-option value="yyyy-MM-dd HH:mm" label="年-月-日 时:分"></el-option>
        <el-option value="yyyy-MM-dd HH:mm:ss" label="年-月-日 时:分:秒"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="关联参数">
     <el-select v-model="value.params" placeholder="请选择" size="small" clearable>
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.title"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="展示时长">
      <el-switch v-model="value.showLength"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "DateTimeRangeConfig",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  created(){
    this.getData()
  },
  data() {
    return {
      options: []
    }
  },
  methods: {
    getData(){
      const formItems = this.$store.state.design.formItems || [];
      // 递归获取所有组件，包括 GroupList 内部的组件
      this.options = this.getAllComponents(formItems);
    },
    getAllComponents(components, parentGroupList = null) {
      let allComponents = [];
      if (!components || !components.length) {
        return allComponents;
      }
      components.forEach(component => {
        // 添加当前组件
        const componentCopy = { ...component };
        // 如果有父级 GroupList，保存父级 GroupList 的 field 信息
        if (parentGroupList) {
          componentCopy.id = `${parentGroupList.id}>${componentCopy.id}`;
          // 修改显示标题，使其更清晰
          componentCopy.title = `${parentGroupList.title}>${componentCopy.title}`;
        }
        allComponents.push(componentCopy);
        // 如果是 GroupList 组件，递归获取其内部组件
        if (component.name === 'GroupList' && component.props && component.props.items && component.props.items.length > 0) {
          const nestedComponents = this.getAllComponents(component.props.items, component);
          allComponents = allComponents.concat(nestedComponents);
        }
      });
      return allComponents;
    }
  }
}
</script>

<style scoped>
  .defaul-Value .el-date-editor.el-input{
    width: 190px;
  }
  .end-date-tips{
    margin-top: 22px;
  }
</style>
