<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit/>
    </el-form-item>
    <el-form-item label="关联参数">
      <el-select v-model="value.params" placeholder="请选择需要统计数量的附件/图片控件" size="small" clearable>
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.title"
          :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>
      <el-form-item label="保留小数">
      <el-input-number controls-position="right" :precision="0" :max="100" :min="0" size="small" v-model="value.precision"  placeholder="小数位数"/>
       位
    </el-form-item>
    <el-form-item label="最小值">
      <el-input size="small" v-model="value.minNum" placeholder="最小值" maxlength="20"/>
    </el-form-item>
    <el-form-item label="最大值">
      <el-input size="small" v-model="value.maxNum" placeholder="最大值" maxlength="20"/>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "NumberInput",
  components: {},
  props:{
    value:{
      type: Object,
      default: ()=>{
        return {}
      }
    },
    id:{
      type: String,
      default: ''
    }
  },
  created(){
    this.getData()
  },
  data() {
    return {
      options: [],
    }
  },
  methods: {
    getData(){
      const linkable = ['FileUpload', 'ImageUpload']
      this.options = this.$store.state.design.formItems
        .filter(item => item.id !== this.id && linkable.includes(item.name))
    }
  }
}
</script>

<style scoped>

</style>
