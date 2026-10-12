<template>
  <a-form
    :model="model"
    :rules="rules"
    layout="inline"
    id="configForm"
    ref="configFormRef"
  >
    <a-form-item name="mgmtType">
      <g-select
        v-model:value="model.mgmtType"
        :field="{
          id: 'value',
          name: 'label',
          disabled: 'disabled',
        }"
        :options="model.options"
        @change-check="(value, option) => changeSelect(value, option)"
        :style="selectStyle"
      ></g-select>
    </a-form-item>
    <a-form-item
      name="mgmtValues"
      v-if="model.mgmtType && model.mgmtType !== 'MANAGEMENT'"
    >
      <g-select
        v-if="model.mgmtType === 'DEPARTMENT'"
        v-model:value="model.mgmtValues"
        placeholder="请选择部门"
        :url="'deptList'"
        :mode="'multiple'"
        :max="9"
        :style="selectStyle"
        :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
      ></g-select>
      <g-select
        v-if="model.mgmtType === 'POST'"
        v-model:value="model.mgmtValues"
        placeholder="请选择岗位"
        :url="'position'"
        :mode="'multiple'"
        :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
        :max="9"
        :style="selectStyle"
      ></g-select>
      <g-select
        v-if="model.mgmtType === 'PERSONNAL'"
        v-model:value="model.mgmtValues"
        placeholder="请选择人员"
        :url="'tenantUsers'"
        :mode="'multiple'"
        :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
        :max="9"
        :style="selectStyle"
      ></g-select>
    </a-form-item>
    <a-form-item :style="{ width: '14px !important' }">
      <MinusCircleOutlined
        id="reduceBtn"
        @click="deleteArea"
      ></MinusCircleOutlined>
    </a-form-item>
  </a-form>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  watch,
  ref,
  nextTick,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import _ from "lodash";
export default defineComponent({
  props: {
    model: {
      type: Object,
    },
    rules: {
      type: Object,
    },
    index: {
      type: Object,
    },
    length: {
      type: Object,
    },
    type: {
      type: String,
      default: "equipModel",
    },
  },
  components: { MinusCircleOutlined },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const configFormRef = ref();

    const state = reactive({
      selectStyle: { width: "100% !important" },
    });

    const deleteArea = () => {
      emit("delete-item", props.index);
    };
    const changeSelect = (value, option) => {
      emit("change-item", props.index, value, option, props.type);
    };

    const formVali = async () => {
      let res;
      await configFormRef.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });

      return res;
    };

    onMounted(function(){});

    watch(
      () => props.model.mgmtType,
      (n) => {
        nextTick(() => {
          formVali();
        });
      }
    );

    return {
      configFormRef,
      ...toRefs(state),
      changeSelect,
      deleteArea,
      formVali,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
#reduceBtn {
  width: 14px !important;
  max-width: 14px !important;
}
</style>
