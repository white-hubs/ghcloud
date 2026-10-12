<template>
  <div>
    <FormRender ref="form" :forms="forms" v-model:value="formData" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      forms: [
        {
          title: "日期时间区间",
          name: "DateTimeRange",
          icon: "iconfont icon-kaoqin",
          valueType: "DateRange",
          props: {
            required: false,
            enablePrint: true,
            placeholder: ["开始时间", "结束时间"],
            format: "yyyy-MM-dd HH:mm:ss",
            showLength: false,
          },
          id: "field2551800589819",
        },
        {
          title: "加班类型",
          name: "OvertimeType",
          icon: "el-icon-edit",
          value: "",
          valueType: "String",
          props: {
            required: false,
            enablePrint: true,
            disabled: true,
            params: null,
          },
          id: "field9313200594725",
        },
        {
          title: "加班时长",
          name: "OvertimeLength",
          icon: "el-icon-edit",
          value: "",
          valueType: "String",
          props: {
            required: false,
            enablePrint: true,
            disabled: true,
            params: "field9313200594725",
            params2: "field2551800589819",
          },
          id: "field7800800592922",
        },
      ],
      formData: {
        sponsorId: "1590166448085020673",
        field8058311666091: "5555555",
        field9044313835191: "选项1",
      },
    };
  },
};
</script>

<style></style>
