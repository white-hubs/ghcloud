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
        <template #appealTypeId="{ record }">
          <g-select
            v-if="type !== 'detail'"
            v-model:value="record.appealTypeId"
            :url="'getTypeList'"
            :params="{ tag: 'APPEAL' }"
          ></g-select>
          <span v-if="type === 'detail'">{{ formData.appealTypeName }}</span>
        </template>
        <template #time="{ record }">
          <a-date-picker
            v-if="type !== 'detail'"
            show-time
            format="YYYY-MM-DD HH:mm"
            placeholder="请选择"
            v-model:value="record.time"
            :get-popup-container="pickerPopupContainer"
          />
          <span v-if="type === 'detail'">
            {{ moment(formData.time).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </template>
        <template #enterpriseId="{ record }">
          <g-select
            v-if="type !== 'detail'"
            v-model:value="record.enterpriseId"
            :url="'getEnterpriseList'"
          ></g-select>
          <span v-if="type === 'detail'">{{ formData.enterpriseName }}</span>
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
import moment from "moment";
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
      title: "企业诉求-新增",
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
        detail: "getDemandsDetails",
      },
      imgPath: "",
      fileList: [],
      formList: [
        {
          title: "企业诉求",
          form: [
            {
              label: "诉求名称",
              value: "name",
              placeholder: "请输入诉求名称",
            },

            {
              label: "诉求类型",
              value: "appealTypeId",
              component: "gSelect",
              url: "getTypeList",
              params: { tag: "APPEAL" },
              field: { id: "value", name: "label" },
              placeholder: "请选择诉求类型",
              slot: true,
            },
            {
              label: "诉求时间",
              value: "time",
              component: "a-date-picker",
              slot: true,
            },
            {
              label: "反馈人员",
              value: "username",
              placeholder: "请输入反馈人员",
            },

            {
              label: "企业名称",
              value: "enterpriseId",
              component: "gSelect",
              url: "getEnterpriseList",
              field: { id: "value", name: "label" },
              placeholder: "请选择企业名称",
              slot: true,
            },
            {
              label: "诉求描述",
              value: "description",
              component: "a-textarea",
              maxlength: 200,
              placeholder: "请输入诉求描述(限字数200)",
            },
            {
              label: "解决措施",
              value: "measure",
              component: "a-textarea",
              maxlength: 200,
              placeholder: "请输入解决措施(限字数200)",
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
        name: [{ required: true, message: "请输入诉求名称" }],
        appealTypeId: [{ required: true, message: "请选择" }],
        time: [{ required: true, message: "请选择" }],
        username: [{ required: true, message: "请输入" }],
        description: [{ required: true, message: "请输入" }],
        enterpriseId: [{ required: true, message: "请选择" }],
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
            .getDemandsAdd(params)
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
            .getDemandsEdit(itemId, params)
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
      proxy.$api.getDemandsDetails(id).then(res => {
        state.imgPath = res.fileVOS[0].path ? res.fileVOS[0].path : "";
        state.formData = res;
      });
    };
    const afterGet = form => {
      state.formData = form;
      const time = moment(form.time).format("YYYY-MM-DD HH:mm:ss");
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
      return { ...form, fileVOS, time };
    };
    const pickerPopupContainer = (triggerNode) => {
      if (!triggerNode || typeof triggerNode.closest !== "function") {
        return document.body;
      }
      return (
        triggerNode.closest(".g-layout-container") || document.body
      );
    };
    onMounted(() => {
      if (type === "add") {
        state.title = "企业诉求-新增";
      }
      if (type === "edit") {
        state.title = "企业诉求-编辑";
      }
      if (type === "detail") {
        state.title = "企业诉求-详情";
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
      moment,
      pickerPopupContainer,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
