<template>
  <div style="overflow-y: scroll; height: 100%;">
    <AntdDesignForm
      :basicFields="[
        'input',
        'textarea',
        'checkbox',
        'time',
        'date',
        'rate',
        'select',
        'text',
      ]"
      :advanceFields="[]"
      ref="designForm"
      :generateCode="false"
      :generateJson="false"
    >
      <template #header>
        <div class="designForm-name">
          <a-input addon-before="表单名称" v-model:value="name" />
        </div>
        <a-button type="link" size="small" @click="clickBack">
          <template #icon>
            <LogoutOutlined />
          </template>
          返回
        </a-button>
        <a-button type="link" size="small" @click="clickSave">
          <template #icon>
            <SaveOutlined />
          </template>
          保存
        </a-button>
        <!-- <a-button type="link" size="small" @click="openModal">
            <template #icon>
              <AppstoreOutlined />
            </template>
           系统控件 
        </a-button> -->
      </template>
    </AntdDesignForm>
    <a-modal v-model:visible="visible" title="系统控件" @ok="handleOk">
      <div class="control-container">
        <div
          v-for="(item, index) in controlList"
          :key="index"
          @click="clickControl(item)"
          :class="
            controlActive && item.label === controlActive.label
              ? 'primary-color'
              : null
          "
        >
          {{ item.label }}
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  getCurrentInstance,
  reactive,
  onMounted,
} from "vue";
import {
  LogoutOutlined,
  SaveOutlined,
  AppstoreOutlined,
} from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  components: {
    LogoutOutlined,
    SaveOutlined,
    AppstoreOutlined,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      name: route.query.name ? route.query.name : "新建表单",
      visible: false,
      definition: null,
      controlActive: null,
      controlList: [
        {
          label: "工单类型",
          value: {
            label: "单行文本",
            type: "input",
            options: {
              width: "100%",
              defaultValue: "",
              placeholder: "",
              maxlength: null,
              prefix: "",
              suffix: "",
              addonBefore: "",
              addonAfter: "",
              disabled: false,
              allowClear: false,
              readonly: false,
              rules: {
                trigger: "blur",
                enum: "",
                message: "",
                pattern: "",
                required: false,
                type: "any",
              },
            },
            key: "696f6a74689d4ec3bfb3a823b2c9f2e0",
            model: "input_696f6a74689d4ec3bfb3a823b2c9f2e0",
            rules: [],
          },
        },
        {
          label: "工单对象",
          value: "",
        },
        {
          label: "工单区域",
          value: "",
        },
        {
          label: "组织结构",
          value: "",
        },
        {
          label: "工单标准",
          value: "",
        },
      ],
    });
    const designForm = ref();
    //获取数据
    const getData = () => {
      proxy.$api.getFormDefinition(route.query.id).then((res) => {
        state.name = res.name;
        state.definition = JSON.parse(res.definition);
        designForm.value.setJson(state.definition);
      });
    };
    onMounted(() => {
      if (route.query.id) {
        getData();
      }
    });
    //点击保存
    const clickSave = () => {
      const definition = designForm.value.getJson();
      definition.list = definition.list.map((item) => {
        if (item.type === "select" || item.type === "checkbox") {
          if (!item.options.showLabel) {
            item.options.options = item.options.options.map((op) => {
              return {
                label: op.value,
                value: op.value,
              };
            });
          }
        }
        return {
          ...item,
          controlType: item.controlType ? item.controlType : "BASIC_CONTROL",
        };
      });
      proxy.$api
        .postFormDefinition({
          name: state.name,
          definition: JSON.stringify(definition),
          id: route.query.id ? route.query.id : null,
        })
        .then((res) => {
          history.go(-1);
        });
    };
    //点击返回
    const clickBack = () => {
      history.go(-1);
    };
    //点击系统控件
    const openModal = () => {
      state.visible = true;
    };
    //点击弹框确定
    const handleOk = () => {
      state.visible = false;
      if (state.controlActive) {
        state.definition.list.push(state.controlActive.value);
        designForm.value.setJson(state.definition);
        state.controlActive = null;
      }
    };
    //选择控件
    const clickControl = (item) => {
      state.controlActive =
        state.controlActive && state.controlActive.label === item.label
          ? null
          : item;
    };
    return {
      ...toRefs(state),
      designForm,
      clickSave,
      clickBack,
      openModal,
      handleOk,
      clickControl,
    };
  },
});
</script>
<style lang="less" scoped>
.designForm-name {
  display: inline-block;
  width: 300px;
  height: 100%;
  > span {
    margin-top: 6px;
  }
}
.control-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  > div {
    width: 45%;
    margin-bottom: 5px;
    line-height: 1.5715;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    border: 1px solid transparent;
    box-shadow: 0 2px #00000004;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    user-select: none;
    touch-action: manipulation;
    height: 32px;
    padding: 4px 15px;
    font-size: 14px;
    border-radius: 2px;
    color: #000000d9;
    background: #fff;
    border-color: #d9d9d9;
  }
}
</style>
