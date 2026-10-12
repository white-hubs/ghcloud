<template lang="pug">
g-table(
  ref="tableRef"
  title="批发商列表"
  editMode="page"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns")
  template(#header-btns)
    div(class="import")
      a-button(type="primary" @click="downloadTemplate" v-loading="downloadLoading" ) 下载模板
      a-upload(:customRequest="customRequest" :showUploadList="false")
        a-button(type="primary" v-loading="importLoading") 批量导入
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  ref,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { millennial, timeFormat } from "@/utils/common";
import {Switch} from 'ant-design-vue'
import { wholeSalerStatus, wholeSalerType } from "@/utils/enumerate";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    const state = reactive({
      columns: [
        {
          dataIndex: "code",
          title: "档主编号",
          slots: {
            customRender: "code",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "name",
          title: "商铺名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "shiftMaster",
          title: "档主姓名",
          slots: {
            customRender: "shiftMaster",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "disable",
          title: "是否禁用",
          slots: {
            customRender: "disable",
          },
          customRender: ({ text,record }) => {
            return <Switch v-model:checked={record.disable} checked-children="是" un-checked-children="否" onChange={(checked)=>handleChangeStatus(checked,record)}></Switch>;
          },
        },
        {
          dataIndex: "shiftMasterPhone",
          title: "档主手机号",
          slots: {
            customRender: "shiftMasterPhone",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "createBy",
          title: "创建人",
          slots: {
            customRender: "createBy",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "createTime",
          title: "登记时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
          title: "修改时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver content={text ? timeFormat(text, true) : ""}>
                {text ? timeFormat(text, true) : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      downloadLoading: false,
      importLoading: false,
      api: {
        list: "wholeSalerPage",
        path: "/wholeSalerInfoOperate",
      },
      btns: ["add", "edit", "detail"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "请输入商户名称或档主编号",
        },
      ],
    });

    const tableRef = ref();

    const authInfo = (record) => {
      history.pushState({ current: location.pathname + location.search }, "", `/portal/business/authAuditOperate?id=${record.status !== "AUDITED"
        ? record.id
        : record.supplierAuthenticationId}&type=${record.status !== "AUDITED" ? "addAudit" : "detail"}&status=${record.status === "UNAUTHORIZED" || record.status === null
          ? "AUDITED"
          : record.status}
      `)
    };
    const handleChangeStatus=async (checked,record)=>{
      await proxy.$api.updateWholeSalerDisabled([{id:record.id,disable:checked}]);
      tableRef.value.getData();
      proxy.$message.success("操作成功");
    }
    const downloadTemplate = async () => {
      state.downloadLoading = true
      try {
        const res = await proxy.$api.downloadSupplierTemplate({}, "get");
        const link = document.createElement("a");
        let blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "批发商模板.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        proxy.$message.success("下载成功");
      } catch (error) {
      } finally {
        state.downloadLoading = false
      }

    }
    const customRequest = async (info) => {
      state.importLoading = true;
      try {
        const formData = new FormData();
        formData.append('file', info.file)
        await proxy.$api.importSupplierTemplate(formData, 'post')
        proxy.$message.success("导入成功");
        tableRef.value.getData();
      } catch (error) {
      } finally {
        state.importLoading = false
      }
    }
    onMounted(() => { });

    return {
      tableRef,
      ...toRefs(state),
      authInfo,
      customRequest,
      downloadTemplate,
    };
  },
});
</script>
<style scoped lang="less">
.import {
  display: inline-block;
}
</style>
