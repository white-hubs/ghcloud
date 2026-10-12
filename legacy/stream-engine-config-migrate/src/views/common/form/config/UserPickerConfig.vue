<template>
  <div>
    <el-form-item label="提示文字">
      <el-input size="small" v-model="value.placeholder" placeholder="请设置提示语" maxlength="20" show-word-limit />
    </el-form-item>
    <el-form-item label="默认值">
      <el-switch v-model="value.defaultValue"></el-switch>
      <span style="display:block;line-height: normal;">勾选后自动带出发起人</span>
    </el-form-item>
    <el-form-item label="是否多选">
      <el-switch v-model="value.multiple"></el-switch>
    </el-form-item>
    <el-form-item label="关联部门">
      <el-select v-model="value.params" placeholder="请选择" size="small" clearable>
        <el-option v-for="item in options" :key="item.id" :label="item.title" :value="item.id"> </el-option>
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "UserPicker",
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
		return {
			options: [],
		};
	},
	methods: {
		getData() {
			this.options = this.$store.state.design.formItems;
		},
	},
  created() {
		this.getData();
	},
}
</script>

<style scoped></style>
