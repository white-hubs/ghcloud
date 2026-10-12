<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置日期提示" maxlength="20" show-word-limit/>
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
    <el-form-item label="默认值" class='defaul-Value'>
      <el-date-picker size="small" v-model="value.defaultValue" type="datetime" :format="value.format" popper-class='date-picker-default-value'>
      </el-date-picker>
      <el-checkbox v-model="value.autoCurrentTime" @change="(val)=>{if(val) value.defaultValue=null}">自动带出当前时间</el-checkbox>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "DateTime",
  components: {},
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
  .defaul-Value .el-date-editor.el-input{
    width: 190px;
  }
</style>
<style>
.date-picker-default-value{
  right: 31px !important;
  left: unset !important;
}
</style>
