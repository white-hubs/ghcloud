<template>
  <g-layout :title="title">
    <template #content-table>
      <gDetailFormRef
        ref="detailForm"
        :api="api"
        :formList="formList"
        :rules="rules"
        :afterGet="afterGet"
      >
        <template #fileVOS="{ record }">
          <g-upload
            v-if="type !== 'detail'"
            v-model:value="record.fileVOS"
            :file="fileList"
          ></g-upload>
          <a-image
            :width="104"
            :height="'100%'"
            v-if="type === 'detail' && imgPath"
            :src="imgPath"
          ></a-image>
          <span v-if="type === 'detail' && !imgPath">暂无数据</span>
        </template>
      </gDetailFormRef>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        type="primary"
        :loading="loading"
        @click="save"
        v-if="type !== 'detail'"
      >
        保存
      </a-button>
    </template>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  onMounted,
  toRefs,
  reactive,
  ref,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import replaceObjectKeys from "@pansy/replace-object-keys";

import { isInteger } from "@/utils/validator.js";
import gDetailFormRef from "../../../components/Common/gDetailFormRef.vue";

export default defineComponent({
  components: {
    gDetailFormRef,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      loading: false,
      title: "企业信息-新增",
      formData: {
        name: "",
        type: undefined,
        corporation: "",
        industryTypeId: "",
        scale: "",
        contacts: "",
        contactsPhone: "",
        fileIds: "",
      },
      api: {
        detail: "getEnterpriseDeils",
      },
      imgPath: "",
      fileList: [],
      formList: [
        {
          title: "企业信息",
          form: [
            {
              label: "企业名称",
              value: "name",
              placeholder: "请输入企业名称",
            },
            {
              label: "企业法人",
              value: "corporation",
              placeholder: "请输入企业法人",
            },
            {
              label: "企业类型",
              value: "type",
              component: "gSelect",
              url: "getEnterpriseManagementTypes",
              field: { code: "value", name: "label" },
              placeholder: "请选择企业类型",
              detailValue: "typeName",
            },
            {
              label: "企业行业",
              value: "industryTypeId",
              component: "gSelect",
              url: "getTypeList",
              params: { tag: "INDUSTRY" },
              field: { id: "value", name: "label" },
              placeholder: "请选择企业行业",
              detailValue: "industryTypeName",
            },
            {
              label: "企业规模",
              value: "scale",
              component: "gSelect",
              url: "getEnterpriseScale",
              field: { code: "value", name: "label" },
              placeholder: "请选择企业规模",
              detailValue: "scaleName",
            },
            {
              label: "企业联系人",
              value: "contacts",
              placeholder: "请输入企业联系人",
            },
            {
              label: "联系人电话",
              value: "contactsPhone",
              component: "a-input",
              placeholder: "请输入联系人电话",
            },
            {
              label: "附件图片",
              value: "fileVOS",
              component: "gUpload",
              slot: true,
            },
          ],
        },
      ],
      rules: {
        name: [{ required: true, message: "请输入企业名称" }],
        corporation: [{ required: true, message: "请输入企业法人" }],
        type: [{ required: true, message: "请选择企业类型" }],
        industryTypeId: [{ required: true, message: "请选择企业行业" }],
        scale: [{ required: true, message: "请选择企业规模" }],
        contactsPhone: [
          {
            required: true,
            message: "请输入整数格式电话号",
            trigger: "blur",
            validator: isInteger,
          },
        ],
      },
    });
    const type = route.query.type;
    const itemId = route.query.id;

    const { proxy } = getCurrentInstance();
    const goBack = () => {
      history.go(-1);
    };
    const detailForm = ref(null);

    const save = async () => {
      const res = await detailForm.value.formValidate();
      if (res) {
        state.loading = true;

        const params = {
          ...detailForm.value.form,
          fileIds:
            detailForm.value.form && detailForm.value.form.fileVOS
              ? detailForm.value.form.fileVOS.split(",")
              : [],
        };
        if (type === "add") {
          proxy.$api
            .getEnterpriseAdd(params)
            .then(() => {
              proxy.$message.success("操作成功");
              goBack();
              state.loading = false;
            })
            .catch(() => {
              state.loading = false;
            });
        }
        if (type === "edit") {
          proxy.$api
            .getEnterpriseEdit(itemId, params)
            .then(() => {
              proxy.$message.success("操作成功");
              goBack();
              state.loading = false;
            })
            .catch(() => {
              state.loading = false;
            });
        }
      }
    };
    const getDeils = id => {
      proxy.$api.getEnterpriseDeils(id).then(res => {
        state.imgPath = res.fileVOS[0].path;
      });
    };
    const afterGet = form => {
      state.formData = form;
      const fileVOS = form.fileVOS.map(item => item.id).join(",");
      state.fileList = replaceObjectKeys(form.fileVOS, {
        id: "id",
        path: "url",
        name: "name",
        type: "type",
        size: "size",
        suffix: "suffix",
        refCount: "refCount",
        businessKey: "businessKey",
      });
      return { ...form, fileVOS };
    };
    onMounted(() => {
      if (type === "add") {
        state.title = "企业信息-新增";
      }
      if (type === "edit") {
        state.title = "企业信息-编辑";
      }
      if (type === "detail") {
        state.title = "企业信息-详情";
        getDeils(itemId);
      }
    });
    return {
      ...toRefs(state),
      detailForm,
      type,
      itemId,
      goBack,
      save,
      router,
      afterGet,
      getDeils,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
