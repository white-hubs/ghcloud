<template lang="pug">
.detail-form.g-detail-form-wrap
  a-form(layout="inline" :model="form" :rules="rules" ref="formRef")
      template(v-for="(item,index) in formList")
        template(v-if="item.title || item.form")  
          .item-title(v-if="item.title") {{item.title}}
          template(v-for="f in item.form")
            //- 查看详情时
            a-form-item(:label="f.label" v-if="route.query.type === 'detail' && (f.showCondition?f.showCondition(form):true)" :class="f.singleLine?'a-form-item-100':''") 
              template(v-if="f.component === 'a-upload'")
                //- a-image(v-for="p in form[f.detailValue]" :height="100" :width="100" :src="'/filesource/'+p.path") 
                a-image(v-for="p in form[f.detailValue]" :height="100" :width="100" :src="p.path") 
              span(v-else) 
                span(v-if="f.detailFun")
                  span(v-if="!f.html") {{f.detailFun(form[(f.detailValue?f.detailValue:f.value)])}}
                  span(v-else v-html="f.detailFun(form[(f.detailValue?f.detailValue:f.value)])")
                span(v-else) {{f.detailValue?(form[f.detailValue]?form[f.detailValue]:'--'):(form[f.value]?form[f.value]:'--')}} {{f.unit?f.unit:null}}
            //- 编辑新增时
            a-form-item(:label="f.label" :name="f.value" v-else-if="route.query.type !== 'detail' && (f.showCondition?f.showCondition(form):true)")
                span(v-if="f.plaintext")
                  span(v-if="f.detailFun")
                    span(v-if="!f.html") {{f.detailFun(form[(f.detailValue?f.detailValue:f.value)])}}
                    span(v-else v-html="f.detailFun(form[(f.detailValue?f.detailValue:f.value)])")
                  span(v-else) {{f.detailValue?(form[f.detailValue]?form[f.detailValue]:'--'):(form[f.value]?form[f.value]:'--')}} {{f.unit?f.unit:null}}
                template(v-else)            
                  component(
                      v-model:value="form[f.value]" 
                      v-model:checked="form[f.value]" 
                      :is="f.component?f.component:'a-input'" 
                      :placeholder="f.placeholder?f.placeholder:'请输入'"
                      :options="f.options?f.options:[]"
                      :tree-data="f.treeData?f.treeData:[]"
                      :field="f.field?f.field:null"
                      :url="f.url?f.url:null"
                      :disabled="f.disabled?f.disabled:false"
                      :checked-children="f.checkedValue?f.checkedValue:'启用'" :un-checked-children="f.unCheckedValue?f.unCheckedValue:'禁用'"
                      allowClear
                  )
          .item-line
      slot(name='edit-item' :record="form")
                
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  props: {
    formList: {
      type: Array,
      default: () => {
        return [
          // {
          //   title:'基本信息',
          //   form:[
          //     { label: "交易区（档位）",detailValue:'detailValue', value: "value1",component:'a-select',placeholder:'请选择' ,singleLine:true},
          //   ]
          // },
        ];
      },
    },
    api: {
      type: Object,
      default: () => {
        return {
          detail: null,
        };
      },
    },
    afterGet: {
      type: Function,
      default: null,
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const formRef = ref();
    const router = useRouter();
    const state = reactive({
      form: {},
    });

    const getData = () => {
      if (route.query.type && props.api.detail && route.query.type !== "add") {
        proxy.$api[props.api.detail]("get", route.query.id).then((res) => {
          state.form =
            props.afterGet && props.afterGet(res) ? props.afterGet(res) : res;
        });
      }
    };

    onMounted(() => {
      props.formList.forEach((item) => {
        if (item.form && item.form.length > 0) {
          item.form.forEach((f) => {
            if (f.detailValue) {
              state.form[f.detailValue] = f.defaultValue
                ? f.defaultValue
                : null;
            }
            if (f.value) {
              state.form[f.value] = f.defaultValue ? f.defaultValue : null;
            }
          });
        }
      });
      getData();
    });
    return {
      route,
      formRef,
      ...toRefs(state),
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
