<template>
  <g-layout :title="type === 'add' ? '新增' : '编辑' + '二维码'">
    <template #content-left>
      <a-form :model="formData" ref="formRef" :rules="formRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入二维码名称"></a-input>
        </a-form-item>
        <div class="flex-start">
          <a-form-item label="实体绑定" name="entityType">
            <div class="flex-start" :style="{ width: '200px' }">
              <a-select
                :allowClear="true"
                v-model:value="formData.entityType"
                placeholder="选择实体绑定类型"
                :options="typeBindOptions"
                @change="changeTypeBind"
              ></a-select>
            </div>
          </a-form-item>
          <a-form-item name="entityName">
            <div class="flex-between" style="flex: 1; margin-left: 10px">
              <a-input v-model:value="formData.entityName" :disabled="true" placeholder="选择绑定实体" style="min-width: 120px"></a-input>
              <a-button type="primary" @click="onSearch">
                <SearchOutlined />
              </a-button>
            </div>
          </a-form-item>
        </div>
        <a-form-item label="二维码code" name="code">
          <div class="flex-between">
            <a-input v-model:value="formData.code" placeholder="请输入二维码code"></a-input>
            <a-button type="primary" @click="createCode">自动生成</a-button>
          </div>
        </a-form-item>
        <a-form-item label="二维码样式" name="styleIdStr">
          <a-select :allowClear="true" v-model:value="formData.styleIdStr" placeholder="请选择" :options="styleOptions"></a-select>
        </a-form-item>
        <!-- <a-form-item label="第三方业务链接">
          <a-button type="primary" @click="linksAdd" >添加</a-button>
        </a-form-item> -->
        <a-form-item label="第三方业务链接" class="links">
          <a-button type="primary" @click="linksAdd" class="mb2">添加</a-button>
          <template v-for="(item, index) in formData.thirdLinks" :key="index">
            <LinksForm :model="item" :index="index" :rules="linksRules" @deleteItem="deleteLinks" :ref="(el) => setRef(el, index)">
            </LinksForm>
          </template>
        </a-form-item>
      </a-form>
    </template>
    <template #content-data>
      <div class="flex-column">
        <div class="header">
          <span>二维码预览：</span>
          <a-button type="primary" @click="createPreview">生成预览</a-button>
        </div>
        <div class="qrcode-box">
          <preview v-if="designConfig" ref="previewModal" :designConfig="designConfig" type="preview"></preview>
        </div>
      </div>
    </template>
    <template #footer-btn>
      <a-button @click="back">返回</a-button>
      <a-button type="primary" :loading="loading" @click="save">确定</a-button>
    </template>
  </g-layout>
  <GModalForQrCode
    :visible="visible"
    title="实体"
    :search="search"
    :columns="columns"
    :url="url"
    selectionType="radio"
    @close="close"
    :activeId="activeId"
    :entityType="formData.entityType"
  ></GModalForQrCode>
</template>

<script>
import { SearchOutlined } from "@ant-design/icons-vue";
import { Popover } from "ant-design-vue";
import _ from "lodash";
import { cloneDeep } from "lodash-es";
import { defineComponent, toRefs, reactive, getCurrentInstance, ref, onMounted, h, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import GModalForQrCode from "../../components/Common/gModalForQrCode.vue";
import preview from "../components/preview.vue";
import LinksForm from "./linksForm.vue";

export default defineComponent({
  components: { preview, SearchOutlined, GModalForQrCode, LinksForm },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { id, type } = route.query;
    const formRef = ref(null);
    const validateLinkUrl = (rule, value, callback) => {
      var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/;
      if (value && !reg.test(value)) {
        return callback(new Error("请输入正确的第三方链接URL"));
      }
      callback();
    };
    const state = reactive({
      formData: {
        code: "",
        name: "",
        entityType: null,
        entityIdStr: "",
        entityName: "",
        styleIdStr: null,
        thirdLinks: [],
      },
      activeId: [],
      initFormData: {},
      designConfig: null,
      formRules: {
        name: [{ required: true, message: "请输入二维码名称" }],
        entityType: [{ required: true, message: "选择实体绑定类型", trigger: "change" }],
        entityName: [{ required: true, message: "请选择绑定实体", trigger: "change" }],
        code: [{ required: true, message: "请生成二维码code" }],
        styleIdStr: [{ required: true, message: "请选择二维码样式", trigger: "change" }],
      },
      linksRules: {
        thirdLinkName: [
          { required: true, message: "请输入业务名称" },
          { max: 20, message: "最多输入20个字" },
        ],
        thirdLinkUrl: [
          { required: true, message: "请输入第三方链接URL" },
          { required: true, validator: validateLinkUrl, trigger: "change" },
        ],
      },
      styleOptions: [],
      typeBindOptions: [],
    });
    const modal = reactive({
      visible: false,
      search: [
        {
          label: "所属区域",
          value: "areaId",
          defaultData: "areaId",
          valueType: "number",
          component: "g-cascader",
          url: "getAreaList",
          placeholder: "请选择",
          field: { id: "value", name: "label", children: "children" },
        },
        {
          label: "实体类型",
          value: "typeId",
          component: "g-select",
          url: "getDeviceTypeList",
          placeholder: "请选择",
          field: { id: "value", name: "label" },
        },
        { label: "", value: "keyword", placeholder: "请输入实体名称" },
      ],
      columns: [
        {
          title: "名称",
          dataIndex: "name",
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          ellipsis: true,
          customRender: ({ text, record }) => {
            let areaName = text;
            if (state.formData.entityType === "PROPERTY" || state.formData.entityType === "PATROL_POINT") {
              areaName = Array.isArray(record.area) ? record.area.map((e) => e.name).join("/") : "";
            }
            if (state.formData.entityType === "DEVICE") {
              areaName = Array.isArray(record.area) ? record.area.map((e) => e.pathName).join("/") : "";
              areaName = record.area?.pathName ?? "";
            }
            return [h(Popover, { content: areaName }, { default: () => areaName || "--" })];
          },
        },
      ],
      url: "",
    });
    watch(
      () => state.formData.entityType,
      () => {
        if (state.formData.entityType === "STALL") {
          modal.columns.forEach((x) => {
            if (x.title === "所属区域") {
              x.dataIndex = "areaNames";
            }
          });
        } else {
          modal.columns.forEach((x) => {
            if (x.title === "所属区域") {
              x.dataIndex = "areaName";
            }
          });
        }
      },
      { immediate: true, deep: true },
    );
    onMounted(async () => {
      state.initFormData = cloneDeep(state.formData);
      if (id) {
        const data = await proxy.$api.getQrcodeDetail({ id: id });
        if (data) {
          const { code, name, entityType, entityName, thirdLinks } = data;
          state.formData = { code, name, entityType, entityName, thirdLinks };
          state.formData.entityIdStr = data.entityId;
          state.formData.styleIdStr = data.styleId;
          state.designConfig = JSON.parse(data.configJson);
        }
      }
      state.styleOptions = await getStyleOption();
      getTypeBind();
    });
    //获取样式
    const getStyleOption = async () => {
      const res = await proxy.$api.qrcodeStyleList();
      const styleOptions = [];
      res.forEach((item) => {
        styleOptions.push({
          value: item.id,
          label: item.name,
        });
      });
      return styleOptions;
    };
    //获取实体绑定
    const getTypeBind = async () => {
      const res = await proxy.$api.getEntityType();
      res.forEach((item) => {
        state.typeBindOptions.push({
          value: item.entityType,
          label: item.typeName,
          styleId: item.styleId,
        });
      });
    };
    //选择实体绑定
    const changeTypeBind = (value, option) => {
      state.visible = false;
      getStyleOption().then((res) => {
        if (value) {
          state.styleOptions = _.cloneDeep(res.filter((x) => x.value === option.styleId));
          state.formData.styleIdStr = state.styleOptions[0].value;
        } else {
          state.styleOptions = _.cloneDeep(res);
          state.formData.styleIdStr = null;
        }
      });
    };
    const createCode = async () => {
      const data = await proxy.$api.createCode();
      if (data) {
        state.formData.code = data;
      }
    };
    const createPreview = async () => {
      const formValid = await formRef.value.validate().catch(() => false);
      const linksValid = await Promise.all(
        linksRefList.value.map((item) => {
          if (item) return item.formVali();
        }),
      )
        .then(() => true)
        .catch(() => false);

      if (formValid && linksValid) {
        const data = await proxy.$api.previewQrcode(state.formData);
        if (data) {
          state.designConfig = data;
        }
      }
    };
    const onSearch = () => {
      if (!state.formData.entityType) {
        proxy.$message.warn("请选择实体类型");
        return false;
      }
      switch (state.formData.entityType) {
        case "DEVICE":
          modal.url = "getInstanceList";
          break;
        case "STALL":
          modal.url = "getBoothList";
          break;
        case "SITE_POINT":
          modal.url = "getPointList";
          break;
        case "PROPERTY":
          modal.url = "getPropertyDetailedPage";
          break;
        case "RISK_SOURCE":
          modal.url = "getRiskSourcePage";
          break;
        case "PATROL_POINT":
          modal.url = "patrolLocationPage";
          break;
      }
      if (state.formData.entityIdStr) {
        state.activeId = [state.formData.entityIdStr];
      }
      modal.visible = true;
    };
    const back = () => {
      history.back();
    };
    const close = (selectedRows) => {
      if (selectedRows && selectedRows.length) {
        state.formData.entityIdStr = selectedRows[0].id;
        state.formData.entityName = selectedRows[0].name;
      }
      modal.visible = false;
    };
    // 业务链接
    const linksRefList = ref([]);
    const setRef = (el, index) => {
      linksRefList.value[index] = el;
    };
    const linksAdd = () => {
      if (state.formData.thirdLinks && state.formData.thirdLinks.length > 0) {
        const valueRes = state.formData.thirdLinks.every((item) => item.thirdLinkName && item.thirdLinkUrl);
        if (valueRes) {
          state.formData.thirdLinks.push({
            thirdLinkName: "",
            thirdLinkUrl: "",
          });
        } else {
          linksRefList.value.forEach((item) => {
            item.formVali();
          });
        }
      } else {
        state.formData.thirdLinks = [];
        state.formData.thirdLinks.push({
          thirdLinkName: "",
          thirdLinkUrl: "",
        });
      }
    };
    const deleteLinks = (index) => {
      state.formData.thirdLinks.splice(index, 1);
    };
    const loading = ref(false);
    const save = async () => {
      const formValid = await formRef.value.validate().catch(() => false);
      const linksValid = await Promise.all(
        linksRefList.value.map((item) => {
          if (item) return item.formVali();
        }),
      )
        .then(() => true)
        .catch(() => false);
      if (formValid && linksValid) {
        try {
          loading.value = true;
          if (id) {
            const data = await proxy.$api.editQrcode({
              ...state.formData,
              id: id,
            });
            if (data) {
              proxy.$message.success("修改成功！");
              back();
            }
          } else {
            const data = await proxy.$api.addQrcode(state.formData);
            if (data) {
              state.formData = cloneDeep(state.initFormData);
              state.designConfig = null;
              proxy.$message.success("保存成功！");
              back();
            }
          }
          loading.value = false;
        } catch (err) {
          loading.value = false;
        }
      }
    };
    return {
      ...toRefs(state),
      ...toRefs(modal),
      loading,
      formRef,
      labelCol: { style: { width: "100px" } },
      wrapperCol: { span: 14 },
      createPreview,
      createCode,
      onSearch,
      back,
      save,
      close,
      changeTypeBind,
      type,
      deleteLinks,
      linksAdd,
      setRef,
      validateLinkUrl,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.content-left) {
  flex: 1;
  padding: 0 16px;
  border-right: 1px solid #d9d9d9;
  min-width: 500px;
  overflow-y: auto;
}
:deep(.content-right) {
  flex: 1;
  padding: 0 16px;
  min-width: 800px;
  overflow: auto !important;
}
.header {
  padding: 16px 0;
}
.qrcode-box {
  min-width: 800px;
  overflow: auto;
  border: 1px solid #d9d9d9;
}
:deep(.footer-btn) {
  width: 100%;
  text-align: right;
}
.links {
  :deep(.ant-col-14) {
    max-width: none;
  }
  .mb2 {
    display: flex;
  }
}
</style>
