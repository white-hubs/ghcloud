<template>
  <!--渲染表单-->
  <el-form
    ref="form"
    class="process-form"
    label-position="top"
    :rules="rules"
    :model="_value"
  >
    <el-form-item
      v-if="item.name !== 'GroupList' && item.name !== 'Description'"
      :prop="item.id"
      :label="item.title"
      v-for="(item, index) in formList"
      :key="item.name + index"
    >
      <form-design-render
        :ref="`sub-item_${item.id}`"
        v-model="_value[item.id]"
        mode="PC"
        :config="item"
        :formData="_value"
      />
    </el-form-item>
    <form-design-render
      ref="span-layout"
      v-else
      v-model="_value"
      mode="PC"
      :config="item"
    />

  </el-form>
</template>

<script>
import FormDesignRender from "@/views/admin/layout/form/FormDesignRender";

export default {
  name: "FormRender",
  components: { FormDesignRender },
  props: {
    forms: {
      type: Array,
      default: () => {
        return [];
      },
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
    flowJson: {
      type: String,
      default: () => {
        return null;
      },
    },
    nodeId: {
      type: String,
      default: () => {
        return "root";
      },
    },
  },
  data() {
    return {
      rules: {},
    };
  },
  created() {
   
  },
  computed: {
    _value: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    formList(){
       if (this.flowJson) {
        return this.getFormJson(this.forms, this.flowJson, this.nodeId);
      } else {
        return this.forms;
      }
    }
  },
  watch:{
    formList(){
      this.loadFormConfig(this.formList);
    }
  },
  methods: {
    validate(call) {
      let success = true;
      this.$refs.form.validate((valid) => {
        success = valid;
        if (valid) {
          //校验成功再校验内部
          for (let i = 0; i < this.formList.length; i++) {
            if (this.formList[i].name === "TableList") {
              let formRef = this.$refs[`sub-item_${this.formList[i].id}`];
              if (formRef && Array.isArray(formRef) && formRef.length > 0) {
                formRef[0].validate((subValid) => {
                  success = subValid;
                });
                if (!success) {
                  break;
                }
              }
            }
          }
        }
        call(success);
      });
    },
    loadFormConfig(forms) {
      forms.forEach((item) => {
        if (item.name === "GroupList") {
          this.loadFormConfig(item.props.items);
        } else {
          this.$set(this._value, item.id, this.value[item.id]);
          if (item.props.required) {
            this.$set(this.rules, item.id, [
              {
                type: item.valueType === "Array" ? "array" : undefined,
                required: true,
                message: `请填写${item.title}`,
                trigger: "blur",
              },
            ]);
          }
        }
      });
    },
    getFormJson(formJson, flowJson, key) {
      if (formJson) {
        if (flowJson) {
          let formPerms = this.getFormPerms(JSON.parse(flowJson), key);
          let form = formJson;
          let arr = [];
          formPerms.forEach((item) => {
            form.forEach((f, fi) => {
              if (item.perm !== "H" && item.id === f.id) {
                if (item.perm === "R") {
                  f.props.disabled = true;
                }
                arr.push(f);
              }
            });
          });
          return arr;
        } else {
          return JSON.parse(formJson);
        }
      } else {
        return [];
      }
    },
    getFormPerms(flowJson,key){
        if(flowJson.id === key){
            return flowJson.props.formPerms
        }else if(flowJson.children) {
            return this.getFormPerms(flowJson.children,key)
        }
    },
  },
};
</script>

<style lang="less" scoped>
.process-form {
  /deep/ .el-form-item__label {
    padding: 0 0;
  }
}
</style>
