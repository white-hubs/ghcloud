<template>
  <g-layout :title="title">
    <template #content-table>
      <GDetailForm ref="gDetailForm" :formList="formList" :api="api" :rules="rules" :afterGet="afterGet">
        <template v-slot:edit-item="item">
          <slot name="edit-item" :record="item.record" />
        </template>
      </GDetailForm>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <slot name="btn" :record="gDetailForm"></slot>
      <a-button type="primary" @click="saveRecord" :loading="isLoading"
        v-if="route.query.type && route.query.type !== 'detail' && saveBtn">保存</a-button>
    </template>
  </g-layout>
</template>
<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
} from "vue";
import GDetailForm from "./gDetailForm.vue";
import { useRoute } from "vue-router";
import _ from "lodash";
import gLayout from "@/components/common/gLayout.vue";
import {message} from "ant-design-vue"
import { postStaffInfo } from "@/api/index"

export default defineComponent({
  components: { GDetailForm,gLayout },
  name: "gDetail",
  props: {
    title: {
      type: String,
      default: "详情页面",
    },
    formList: {
      type: Array,
      default: () => {
        return [

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
    beforeSave: {
      type: Function,
      default: null,
    },
    afterGet: {
      type: Function,
      default: null,
    },
    rules: {
      type: Object,
      default: () => {
        return {
          value1: [{ required: true, message: "请选择" }],
        };
      },
    },
    saveBtn: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const gDetailForm = ref();
    const route = useRoute();
    const state = reactive({ isLoading: false });

    /*保存数据*/
    const saveRecord = async () => {
      await gDetailForm.value.formRef.validate();
      try {
        state.isLoading = true;
        if (route.query.type === "add") {
          const params = _.cloneDeep(gDetailForm.value.getFormData());
          if (typeof params.postIds === 'string') {
            params.postIds = params.postIds ? [params.postIds] : []
          }
          await postStaffInfo(params).then(
            () => {
              message.success("操作成功");
              state.isLoading = false;
              goBack();
            }
          );
        } else if (route.query.type === "edit") {
          const params = _.cloneDeep(gDetailForm.value.getFormData());
          if (typeof params.postIds === 'string') {
            params.postIds = params.postIds ? [params.postIds] : []
          }
          await postStaffInfo(params).then(() => {
              message.success("操作成功");
              state.isLoading = false;
              goBack();
            }
          );
        }
      } catch (error) {
        state.isLoading = false;
      } finally{
        state.isLoading = false;
      }
    };
    /*返回*/
    const goBack = () => {
      history.go(-1);
    };

    const getData = () => {
      gDetailForm.value.getData();
    };

    return {
      gDetailForm,
      route,
      ...toRefs(state),
      getData,
      goBack,
      saveRecord,
    };
  },
});
</script>
<style lang="less" scoped></style>
