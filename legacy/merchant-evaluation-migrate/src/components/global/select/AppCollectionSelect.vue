<template lang="pug">
  div   
    div.value-box
      div.value-item(v-for="post in model.POST" :key="post")
        app-post-display(:id="post" :parameter="params")
      div.value-item(v-for="user in model.USER" :key="user")
        app-user-display(:id="user" :parameter="params")
    a-button(@click="show" type="primary") {{ title }}
    app-modal(v-model="visible" :title="title" :width="800" @ok="handleSubmit" :confirm-loading="loading")
      app-form(:model="model" :rules="rules" ref="form" @change.stop)
        a-form-model-item(label="岗位" prop="code")
          app-remote-select(v-bind="$attrs" v-on="$listeners" v-model="model.POST" mode="multiple" api="/sys/posts" :params="params")
        a-form-model-item(label="用户" prop="name")
          app-user-select(v-bind="$attrs" v-on="$listeners" v-model="model.USER" mode="multiple" :parameter="params")
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    title: {
      default: '选择会签人员',
    },
  },
  data() {
    return {
      options: [],
      visible: false,
      loading: false,
      model: {
        POST: [],
        USER: [],
      },
      rules: {},
    };
  },
  computed: {
    parseValue() {
      return this.value || '';
    },
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      const params = {};
      if (this.project) {
        params.projectId = this.project.id;
      }
      return params;
    },
  },
  created() {
    this.getModel();
  },
  methods: {
    show() {
      this.visible = true;
    },
    reset() {
      this.$refs.form.resetFields();
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        let exp = '';
        this.model.POST.forEach((item) => {
          exp += `,'POST:${item}'`;
        });
        this.model.USER.forEach((item) => {
          exp += `,'USER:${item}'`;
        });

        const expStr =
          '${assigneeService.resolveMultipleUsers(context' + exp + ')}';
        this.$emit('change', expStr);
        this.visible = false;
      }
    },
    getModel() {
      const model = {
        POST: [],
        USER: [],
      };
      if (this.value) {
        const expResults = /\(context,(.+)\)/.exec(this.value) || [];
        const expsStr = expResults[1];
        if (expsStr) {
          const exps = expsStr.replace(/'/g, '').split(',');
          exps.forEach((item) => {
            const [key, value] = item.split(':');
            model[key].push(value);
          });
        }
      }
      this.model = model;
    },
  },
};
</script>
<style lang="less" scoped>
.value-box {
  // padding: 0.5rem;
  // line-height: 1.5em;
  // word-break: break-all;
  // border: 1px solid #ddd;
  // border-radius: 2px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .value-item {
    height: 28px;
    min-width: 60px;
    line-height: normal;
    font-size: 12px;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    margin: 0 0.5rem 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 2px;
  }
}
</style>
