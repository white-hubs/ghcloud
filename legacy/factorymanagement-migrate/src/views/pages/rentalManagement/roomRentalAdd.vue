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
        <template #rentRoomsId="{ record }">
          <a-select
            v-if="type != 'detail'"
            mode="multiple"
            showSearch
            v-model:value="record.rentRoomsId"
            :filterOption="filterOption"
            :options="rentRoomsData"
            placeholder="请选择"
            @change="changeModel"
            style="min-width: 150px;"
          ></a-select>
          <span v-if="type == 'detail'">{{ formData.roomNames }}</span>
        </template>
        <template #enterpriseId="{ record }">
          <g-select
            v-if="type !== 'detail'"
            v-model:value="record.enterpriseId"
            :url="'getEnterpriseList'"
            style="min-width: 150px;"
          ></g-select>
          <span v-if="type === 'detail'">{{ formData.enterpriseName }}</span>
        </template>
        <template #signTime="{ record }">
          <a-date-picker
            v-if="type !== 'detail'"
            show-time
            format="YYYY-MM-DD HH:mm"
            placeholder="请选择"
            v-model:value="record.signTime"
            :get-popup-container="pickerPopupContainer"
          />
          <span v-if="type === 'detail'">
            {{ moment(formData.signTime).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </template>
        <template #beginTime="{ record }">
          <a-date-picker
            v-if="type === 'add'"
            show-time
            format="YYYY-MM-DD HH:mm"
            placeholder="请选择"
            v-model:value="record.beginTime"
            :get-popup-container="pickerPopupContainer"
          />
          <span v-else>
            {{ moment(formData.beginTime).format("YYYY-MM-DD HH:mm:ss") }}
          </span>
        </template>

        <template #endTime="{ record }">
          <a-date-picker
            v-if="type === 'add'"
            show-time
            format="YYYY-MM-DD HH:mm"
            placeholder="请选择"
            v-model:value="record.endTime"
            :get-popup-container="pickerPopupContainer"
          />
          <span v-else>
            {{ moment(formData.endTime).format("YYYY-MM-DD HH:mm:ss") }}
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
      title: "房间租赁-新增",
      rentRoomsData: [],
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
        detail: "getRentalDetails",
      },
      imgPath: "",
      fileList: [],
      formList: [
        {
          title: "租赁信息",
          form: [
            {
              label: "租赁企业",
              value: "enterpriseId",
              url: "getEnterpriseList",
              component: "gSelect",
              field: { id: "value", name: "label" },
              placeholder: "请选择租赁企业",
              slot: true,
            },
            {
              label: "租赁房间",
              value: "rentRoomsId",
              url: "tenantRoomList",
              component: "gSelect",
              defaultValue: [],
              slot: true,
            },

            {
              label: "签订时间",
              value: "signTime",
              component: "a-date-picker",
              slot: true,
              placeholder: "请选择签订时间",
            },
            {
              label: "开始时间",
              value: "beginTime",
              component: "a-date-picker",
              slot: true,
              placeholder: "请选择开始时间",
            },

            {
              label: "结束时间",
              value: "endTime",
              component: "a-date-picker",
              slot: true,
              placeholder: "请选择结束时间",
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
        enterpriseId: [{ required: true, message: "请选择" }],
        rentRooms: [{ required: false, message: "请选择房间" }],
        signTime: [{ required: true, message: "请选择签订时间" }],
        beginTime: [{ required: true, message: "请选择" }],
        endTime: [{ required: true, message: "请选择" }],
        rentRoomsId: [{ required: true, message: "请选择", type: "array" }],
      },
    });

    const type = route.query.type;
    const itemId = route.query.id;

    const { proxy } = getCurrentInstance();
    const goBack = () => {
      history.go(-1);
    };
    const detailForm = ref(null);

    const rentRoomsIdArr = ref([]);
    const save = async () => {
      if (detailForm.value.form.beginTime > detailForm.value.form.endTime) {
        proxy.$message.warning("开始时间不能大于结束时间");
        return;
      }
      const res = await detailForm.value.formValidate();
      if (res) {
        state.loading = true;
        const params = {
          ...detailForm.value.form,
          beginTime: moment(detailForm.value.form.beginTime).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          endTime: moment(detailForm.value.form.endTime).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          signTime: moment(detailForm.value.form.signTime).format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          rentRooms: rentRoomsIdArr.value.length ? rentRoomsIdArr.value : [],
          fileIds:
            detailForm.value.form && detailForm.value.form.fileVOS
              ? detailForm.value.form.fileVOS.split(",")
              : [],
        };
        if (type === "add") {
          proxy.$api
            .getRentalAdd(params)
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
            .getRentalEdit(itemId, params)
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
    const changeModel = (value, option) => {
      rentRoomsIdArr.value = option.map(item => {
        return Object.assign(
          {},
          {
            roomId: item.value,
            roomName: item.label,
          },
        );
      });
    };
    const getDeils = id => {
      proxy.$api.getRentalDetails(id).then(res => {
        state.formData = res;
        state.imgPath = res.fileVOS[0].path;
      });
    };
    const getRoomList = () => {
      proxy.$api.tenantRoomList().then(res => {
        let arr = [];
        res.forEach(item => {
          if (item.deleted !== true) {
            arr.push({
              value: item.id,
              label: item.name,
            });
          }
        });

        state.rentRoomsData = arr;
      });
    };
    const filterOption = (inputValue, option) => {
      return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
    };
    const afterGet = form => {
      state.formData = form;
      const beginTime = moment(form.beginTime).format("YYYY-MM-DD HH:mm:ss");
      const endTime = moment(form.endTime).format("YYYY-MM-DD HH:mm:ss");
      const signTime = moment(form.signTime).format("YYYY-MM-DD HH:mm:ss");
      const rentRooms = [];

      form.rentRooms.map(item => {
        rentRooms.push(item.roomId);
      });

      rentRoomsIdArr.value = form.rentRooms;
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
      return {
        ...form,
        fileVOS,
        beginTime,
          signTime,
        endTime,
        rentRoomsId: rentRooms,
      };
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
      getRoomList();
      if (type === "add") {
        state.title = "房间租赁-新增";
      }
      if (type === "edit") {
        state.title = "房间租赁-编辑";
      }
      if (type === "detail") {
        state.title = "房间租赁-详情";
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
      changeModel,
      rentRoomsIdArr,
      getRoomList,
      moment,
      filterOption,
      pickerPopupContainer,
    };
  },
});
</script>

<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
