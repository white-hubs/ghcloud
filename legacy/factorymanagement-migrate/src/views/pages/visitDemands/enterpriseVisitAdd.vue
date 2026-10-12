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
        <template #enterpriseId="{ record }">
          <g-select
            v-if="type !== 'detail'"
            v-model:value="record.enterpriseId"
            :url="'getEnterpriseList'"
          ></g-select>
          <span v-if="type === 'detail'">{{ formData.enterpriseName }}</span>
        </template>
        <template #interviewTypeId="{ record }">
          <g-select
            v-if="type !== 'detail'"
            v-model:value="record.interviewTypeId"
            :url="'getTypeList'"
            :params="{ tag: 'INTERVIEW' }"
          ></g-select>
          <span v-if="type === 'detail'">{{ formData.interviewTypeName }}</span>
        </template>

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
        <template #measure="{}">
          <div v-if="type !== 'detail'">
            <a-button type="primary" @click="addMeasure">
              <template #icon>
                <PlusCircleOutlined />
              </template>
              添加
            </a-button>

            <div
              class="measure"
              v-for="(item, index) in measureData"
              :key="index"
            >
              <div class="measure-item">
                <div>
                  <a-select
                    v-model:value="item.appealTypeId"
                    @change="handleChange"
                    placeholder="请选择企业诉求"
                  >
                    <a-select-option
                      v-for="(itemChild, indexChild) in item.measureList"
                      :key="indexChild"
                      :value="itemChild.value"
                    >
                      {{ itemChild.label }}
                    </a-select-option>
                  </a-select>
                </div>
                <div class="measure-item-del" @click="delMeasure(index)">
                  <MinusCircleOutlined />
                </div>
              </div>
            </div>
          </div>

          <span v-if="type === 'detail'">
            {{ measureListPamaryName.join(",") }}
          </span>
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
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import gDetailFormRef from "../../../components/Common/gDetailFormRef.vue";

export default defineComponent({
  components: {
    PlusCircleOutlined,
    MinusCircleOutlined,
    gDetailFormRef,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      title: "企业走访-新增",
      loading: false,

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
        detail: "getVisitDetails",
      },
      imgPath: "",
      fileList: [],
      measureList: [],
      measureListPamary: [],
      measureListPamaryName: [],
      formList: [
        {
          title: "走访信息",
          form: [
            {
              label: "走访企业",
              value: "enterpriseId",
              component: "gSelect",
              field: { id: "value", name: "label" },
              placeholder: "请选择企业名称",
              slot: true,
            },

            {
              label: "走访时间",
              value: "time",
              component: "a-date-picker",
              slot: true,
            },
            {
              label: "走访类型",
              value: "interviewTypeId",
              component: "gSelect",

              field: { id: "value", name: "label" },
              placeholder: "请选择走访类型",
              slot: true,
            },
            {
              label: "走访人员",
              value: "person",
              maxlength: 15,
              placeholder: "请输入走访人员",
            },
            {
              label: "企业对接人",
              value: "receptionPerson",
              placeholder: "请输入企业对接人",
            },

            {
              label: "走访记录",
              value: "recordContent",
              component: "a-textarea",
              maxlength: 200,
              placeholder: "请输入走访记录",
            },
            {
              label: "企业诉求",
              value: "measure",
              component: "a-buttom",
              placeholder: "请输入企业诉求",
              slot: true,
            },
            {
              label: "附件图片",
              value: "fileVOS",
              component: "gUpload",
              slot: true,
            },
          ],
        },
        // {
        //   title: "诉求信息",
        //   form: [

        //   ],
        // },
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
    const measureData = ref([
      {
        name: undefined,
        appealTypeId: undefined,
        measureList: state.measureList,
      },
    ]);
    const { proxy } = getCurrentInstance();
    const goBack = () => {
      history.go(-1);
    };
    const handleChange = value => {
      state.measureListPamary.push(value);
    };
    const addMeasure = () => {
      measureData.value.push({
        name: undefined,
        appealTypeId: undefined,
        measureList: state.measureList,
      });
    };
    const delMeasure = index => {
      measureData.value.splice(index, 1);
      state.measureListPamary.splice(index, 1);
    };
    const getDemandList = () => {
      proxy.$api.getDemandsList().then(res => {
        state.measureList = res.map(item => {
          return Object.assign(
            {},
            {
              label: item.name,
              value: item.id,
            },
          );
        });
        measureData.value[0].measureList = state.measureList;

      });
    };
    const detailForm = ref(null);

    const save = async () => {
      const res = await detailForm.value.formValidate();

      if (res) {
        state.loading = true;

        const params = {
          ...detailForm.value.form,
          appealIds: state.measureListPamary.join(","),
          time: moment(detailForm.value.form.time).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          fileIds:
            detailForm.value.form && detailForm.value.form.fileVOS
              ? detailForm.value.form.fileVOS.split(",")
              : [],
        };
        if (type === "add") {
          proxy.$api
            .getVisitAdd(params)
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
            .getVisitEdit(itemId, params)
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
      proxy.$api.getVisitDetails(id).then(res => {
        state.imgPath = res.fileVOS[0].path;
        state.formData = res;
      });
    };
    const afterGet = form => {
      state.formData = form;
      const time = moment(form.time).format("YYYY-MM-DD HH:mm:ss");
      const fileVOS = form.fileVOS.map(item => item.id).join(",");
      measureData.value = [];
      form.appealListVOS.forEach(item => {
        measureData.value.push({
          appealTypeId: item.id,
          name: undefined,
          measureList: state.measureList,
        });
      });
      state.measureListPamary = [];
      state.measureListPamaryName = [];

      form.appealListVOS.forEach(item => {
        state.measureListPamary.push(item.id);
        state.measureListPamaryName.push(item.name);
      });
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
      getDemandList();

      if (type === "add") {
        state.title = "企业走访-新增";
      }
      if (type === "edit") {
        state.title = "企业走访-编辑";
      }
      if (type === "detail") {
        state.title = "企业走访-详情";
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
      addMeasure,
      handleChange,
      getDemandList,
      delMeasure,
      measureData,
      moment,
      pickerPopupContainer,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.measure {
  display: flex;
  flex-direction: column;
  .measure-item {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;
    .measure-item-del {
      display: flex;
      align-items: center;
      margin-left: 20px;
      cursor: pointer;
    }
  }
}
</style>
