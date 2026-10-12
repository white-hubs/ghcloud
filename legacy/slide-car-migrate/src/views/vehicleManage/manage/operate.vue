<template lang="pug">
g-layout(:title="type === 'add' ? '车辆新增' : '车辆编辑'")
  template(#content-table)
    g-detail-form(
      ref="form"
      :api="api"
      :formList="formlist"
      :afterGet="afterGet"
      :rules="rules")
      template(v-slot:carNo="{record}") 
        //- a-input-group.flex(style="width:300px")
        a-input(v-model:value="record.carNo" placeholder="请输入车牌号码" style="width:calc(100% - 56px); maxWidth: 244px;")
        a-button(type="primary" @click="openModal") {{province}}{{letter}}
  template(#footer-page)
    a-button(@click="goBack") 返回
    a-button(type="primary" @click="submit") 保存
  a-modal(v-model:visible="visible" centered @ok="save" @cancel="cancel" :width="550" :title="modalType==='province' ? '省份选择' : '市属选择'")  
    div.modalGrid
      template(v-if="modalType==='province'")
        template(v-for="item in provinceList" :key="item.label")
          a-button(@click="choseProvince(item.label)" :type="storageProv === item.label ? 'primary' : 'default'") {{item.label}}
      template(v-else)
        template(v-for="item in letterList" :key="item.value")
          a-button(@click="choseLetter(item.value)" :type="storageLetter === item.label ? 'primary' : 'default'") {{item.label}}
    template(#footer)
      template(v-if="modalType==='province'")
        a-button(@click="cancel") 取消
        a-button(type="primary" @click="modalType='letter'") 下一步
      template(v-else) 
        a-button(@click="cancel")  取消
        a-button(type="primary" @click="modalType='province'") 上一步 
        a-button(type="primary" @click="save") 确定 
</template>

<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { millennial, timeFormat, validArray } from "@/utils/common";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import provinceList from "./province.json";
import { Form } from "ant-design-vue";
import replaceObjectKeys from "@pansy/replace-object-keys";
export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();

    const id = route.query.id;
    const type = route.query.type;
    const form = ref();

    const state = reactive({
      api: {
        detail: "carInfoId",
      },
      formlist: [
        {
          title: "车辆信息",
          form: [
            { label: "车主姓名", value: "driverName", maxlength: "20" },
            { label: "电话号码", value: "phone" },
            {
              label: "车辆类型",
              value: "carTypeId",
              component: "gSelect",
              url: "carTypeConfigList",
              field: { carTypeName: "label", id: "value" },
            },
            { label: "车牌号码", value: "carNo", slot: true },
            { label: "皮重", value: "carWeight", maxlength: 8 },
            { label: "车长", value: "carLength", maxlength: 8 },
            { label: "载重", value: "carLoad", maxlength: 8 },
            { label: "容积", value: "carVolume", maxlength: 8 },
          ],
        },
        {
          title: "车辆照片信息",
          form: [
            {
              label: "照片(最多5张)",
              value: "carImageIds",
              detailValue: "carImageFiles",
              component: "gUpload",
              max: 5,
              singleLine: true,
            },
            {
              label: "行驶证正面",
              value: "drivingLicenseImage1",
              component: "gUpload",
              // singleLine: true,
              detailValue: "drivingLicenseImageFile1",
            },
            {
              label: "行驶证反面",
              value: "drivingLicenseImage2",
              component: "gUpload",
              // singleLine: true,
              detailValue: "drivingLicenseImageFile2",
            },
          ],
        },
      ],
      rules: {
        carTypeId: [{ required: true, message: "请选择车辆类型" }],
        phone: [
          { required: false, message: "" },
          {
            pattern: new RegExp(/^1[3|4|5|6|7|8|9][0-9]{9}$/, "g"),
            message: "请输入正确的电话",
          },
        ],
        carNo: [
          { required: true, message: "请输入车牌号码" },
          {
            pattern: new RegExp(
              /^(((([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/,
              "g"
            ),
            message: "请输入正确的车牌号码",
          },
        ],
        carWeight: [
          { required: false, message: "" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的皮重(最多两位小数)",
          },
        ],
        carLength: [
          { required: false, message: "" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的车长(最多两位小数)",
          },
        ],
        carLoad: [
          { required: false, message: "" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的载重(最多两位小数)",
          },
        ],
        carVolume: [
          { required: false, message: "" },
          {
            pattern: new RegExp(/^\d+(\.\d{0,2})?$/, "g"),
            message: "请输入正确的容积(最多两位小数)",
          },
        ],
      },
      visible: false,
      modalType: "province",
      provinceList: provinceList,
      letterList: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
        { label: "D", value: "D" },
        { label: "E", value: "E" },
        { label: "F", value: "F" },
        { label: "G", value: "G" },
        { label: "H", value: "H" },
        { label: "J", value: "J" },
        { label: "K", value: "K" },
        { label: "L", value: "L" },
        { label: "M", value: "M" },
        { label: "N", value: "N" },
        { label: "P", value: "P" },
        { label: "Q", value: "Q" },
        { label: "R", value: "R" },
        { label: "S", value: "S" },
        { label: "T", value: "T" },
        { label: "U", value: "U" },
        { label: "V", value: "V" },
        { label: "W", value: "W" },
        { label: "X", value: "X" },
        { label: "Y", value: "Y" },
        { label: "Z", value: "Z" },
      ],
      province: "川",
      letter: "A",
      storageProv: "川",
      storageLetter: "A",
    });

    const getDefaultPro = () => {
      proxy.$api.defaultProvince(null,"get").then((res) => {
        if (typeof res === "object") {
          state.province = res.carNoPre;
          state.storageProv = res.carNoPre;
        }
      });
    };

    const choseProvince = (value) => {
      state.storageProv = value;
    };

    const choseLetter = (value) => {
      state.storageLetter = value;
    };

    const openModal = () => {
      state.modalType = "province";
      state.visible = true;
    };

    const cancel = () => {
      state.storageProv = state.province;
      state.storageLetter = state.letter;
      state.visible = false;
    };

    const save = () => {
      state.province = state.storageProv;
      state.letter = state.storageLetter;
      state.visible = false;
    };

    const goBack = () => {
      history.back()
    };

    const submit = async () => {
      const res = await form.value.formValidate();
      if (res) {
        let params = {
          ...form.value.form,
          carNo: `${state.province}${state.letter}${form.value.form.carNo}`,
          carImageIds: form.value.form?.carImageIds
            ? form.value.form.carImageIds.split(",")
            : [],
        };
        id
          ? proxy.$api.carEdit(params,"put" ).then(() => {
              proxy.$message.success("操作成功");
              goBack();
            })
          : proxy.$api.carAdd(params,"post" ).then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
      }
    };

    const afterGet = (form) => {
      const carNo = form.carNo.substr(2);
      state.province = form.carNo.substr(0, 1);
      state.storageProv = form.carNo.substr(0, 1);
      state.letter = form.carNo.substr(1, 1);
      state.storageLetter = form.carNo.substr(1, 1);
      return {
        ...form,
        carNo: carNo,
        carTypeId: form?.carTypeId ? form?.carTypeId : "",
        carImageIds: form.carImageFiles?.length
          ? form.carImageFiles.map((item) => item?.id)?.join(",")
          : "",
        drivingLicenseImage1: form.drivingLicenseImageFile1[0]?.id
          ? form.drivingLicenseImageFile1[0]?.id
          : "",
        drivingLicenseImage2: form.drivingLicenseImageFile2[0]?.id
          ? form.drivingLicenseImageFile2[0]?.id
          : "",
        carImageFiles: form.carImageFiles
          ? form.carImageFiles.map((item) => {
              return {
                uid: item.id,
                id: item.id,
                name: item.name,
                status: "done",
                url: item.path,
                response: {
                  data: item,
                },
              };
            })
          : [],
        drivingLicenseImageFile1: form.drivingLicenseImageFile1
          ? form.drivingLicenseImageFile1.map((item) => {
              return {
                uid: item.id,
                id: item.id,
                name: item.name,
                status: "done",
                url: item.path,
                response: {
                  data: item,
                },
              };
            })
          : [],
        drivingLicenseImageFile2: form.drivingLicenseImageFile2
          ? form.drivingLicenseImageFile2.map((item) => {
              return {
                uid: item.id,
                id: item.id,
                name: item.name,
                status: "done",
                url: item.path,
                response: {
                  data: item,
                },
              };
            })
          : [],
      };
    };

    onMounted(() => {
      getDefaultPro();
    });

    return {
      form,
      type,
      ...toRefs(state),
      choseProvince,
      choseLetter,
      openModal,
      afterGet,
      submit,
      goBack,
      cancel,
      save,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-input-group) {
  position: relative;
}
:deep(.ant-modal) {
  position: absolute;
  top: 0;
}
.modalGrid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-column-gap: 16px;
  grid-row-gap: 16px;
}
</style>
