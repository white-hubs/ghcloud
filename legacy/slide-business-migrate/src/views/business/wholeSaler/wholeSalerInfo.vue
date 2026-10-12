<template lang="pug">
g-table(
  ref="tableRef"
  title="批发商资料"
  editMode="page"
  :api="api"
  :btns="btns"
  :search="search"
  :columns="columns")
  template(v-slot:btn="{record}")
    a-button(v-if="record.status === 'AUDITED'" type="link" @click="authInfo(record)" :disabled="record.status === 'CERTIFIED' ? true : false") 审核
    a-button(v-else type="link" @click="authInfo(record)" :disabled="record.status !== 'UNAUTHORIZED' && record.status !== null ? true : false") 认证
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
import { wholeSalerStatus, wholeSalerType } from "@/utils/enumerate";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "商家名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "liaison",
          title: "联系人姓名",
          slots: {
            customRender: "liaison",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "phone",
          title: "联系人手机号",
          slots: {
            customRender: "phone",
          },
          customRender: ({ text }) => {
            return <PopOver content={text}>{text ? text : "--"}</PopOver>;
          },
        },
        {
          dataIndex: "status",
          title: "认证状态",
          slots: {
            customRender: "status",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={
                  text
                    ? text === "INVALID"
                      ? "已失效"
                      : text === "UNAUTHORIZED"
                        ? "未认证"
                        : text === "AUDITED"
                          ? "待审核"
                          : text === "CERTIFIED"
                            ? "已认证"
                            : "未通过"
                    : ""
                }
              >
                <g-table-dot
                  content={
                    text
                      ? text === "INVALID"
                        ? "已失效"
                        : text === "UNAUTHORIZED"
                          ? "未认证"
                          : text === "AUDITED"
                            ? "待审核"
                            : text === "CERTIFIED"
                              ? "已认证"
                              : "未通过"
                      : "--"
                  }
                  status={
                    text
                      ? text === "INVALID"
                        ? "blue"
                        : text === "UNAUTHORIZED"
                          ? "audit"
                          : text === "AUDITED"
                            ? "audit"
                            : text === "CERTIFIED"
                              ? "normal"
                              : "delete"
                      : "--"
                  }
                ></g-table-dot>
              </PopOver>
            );
          },
        },
        {
          dataIndex: "type",
          title: "认证类型",
          slots: {
            customRender: "type",
          },
          customRender: ({ text }) => {
            return (
              <PopOver
                content={
                  text
                    ? text === "PERSONAL"
                      ? "个人"
                      : text === "ENTERPRISE"
                        ? "企业"
                        : "个体工商户"
                    : ""
                }
              >
                {text
                  ? text === "PERSONAL"
                    ? "个人"
                    : text === "ENTERPRISE"
                      ? "企业"
                      : "个体工商户"
                  : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
          title: "更新时间",
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
          label: "认证状态",
          value: "status",
          component: "a-select",
          options: wholeSalerStatus,
          placeholder: "请选择认证状态",
        },
        {
          label: "认证类型",
          value: "type",
          component: "a-select",
          options: wholeSalerType,
          placeholder: "请选择认证类型",
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入商户名称",
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
