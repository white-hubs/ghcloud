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
        detail: "getRoomDetails",
      },
      imgPath: "",
      fileList: [],
      formList: [
        {
          title: "房间信息",
          form: [
            {
              label: "房间名称",
              value: "name",
              placeholder: "请输入房间名称",
            },

            {
              label: "房间类型",
              value: "roomTypeId",
              component: "gSelect",
              url: "getRoomTypePage",
              field: { id: "value", name: "label" },
              placeholder: "请选择房间类型",
            },
            {
              label: "所属区域",
              value: "areaId",
              // defaultData: "areaId",
              valueType: "string",
              component: "g-cascader",
              url: "getAreaList",
              field: { id: "value", name: "label", children: "children" },
              placeholder: "请选择区域",
            },
            {
              label: "使用状态",
              value: "status",
              url: "getRoomStatus",
              component: "g-select",
              field: { code: "value", name: "label" },
              placeholder: "请选择使用状态",
            },
            {
              label: "建筑面积",
              value: "floorage",
              placeholder: "请输入建筑面积",

              suffix: "㎡",
            },
            {
              label: "计费面积",
              value: "floorageBilling",
              placeholder: "请输入计费面积",

              suffix: "㎡",
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
        name: [{ required: true, message: "请输入房间名称" }],
        areaId: [{ required: true, message: "请选择区域" }],
        roomTypeId: [{ required: true, message: "请选择房间类型" }],
        status: [{ required: true, message: "请选择使用状态" }],
        floorage: [
          { required: true, message: "请输入整数", validator: isInteger },
        ],
        floorageBilling: [
          { required: true, message: "请输入整数", validator: isInteger },
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
          areaId:
            detailForm.value.form && detailForm.value.form.areaId
              ? detailForm.value.form.areaId.reverse()[0]
              : [],
          areaSequence:
            detailForm.value.form && detailForm.value.form.areaId
              ? detailForm.value.form.areaId.join(",")
              : "",
          fileIds:
            detailForm.value.form && detailForm.value.form.fileVOS
              ? detailForm.value.form.fileVOS.split(",")
              : [],
        };
        if (type === "add") {
          proxy.$api
            .getRoomAdd(params)
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
            .getRoomEdit(itemId, params)
            .then(() => {
              proxy.$message.success("操作成功");
              goBack();
              state.loading = false;
            })
            .catch(() => {
              state.loading = false;
              detailForm.value.getData();
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
      const areaId = form.areaSequence.split(",").reverse();

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
      return { ...form, fileVOS, areaId };
    };
    onMounted(() => {
      if (type === "add") {
        state.title = "房间信息-新增";
      }
      if (type === "edit") {
        state.title = "房间信息-编辑";
      }
      if (type === "detail") {
        state.title = "房间信息-详情";
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
