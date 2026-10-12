<template lang="pug">
g-layout(:title="`企业`")
  template(#content-table)
    a-form(ref="form" :model="data" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="rules" labelAlign="right")
      a-form-item(:label="`企业名称`" name="name")
        a-input(v-model:value.trim="data.name"  allowClear :maxLength="20" :placeholder="`请输入企业名称`")

      a-form-item(:label="`企业编号`" name="code")
        a-input(v-model:value.trim="data.code"  disabled allowClear :maxLength="5" placeholder="系统自动生成")

      a-form-item(label="管理用户" name="userAdminId")
        a-select(v-model:value="data.userAdminId"  placeholder="请选择管理用户" @click="openModal" :open="false" :options="options")
      a-form-item.updatePic(:label="`企业LOGO`")
        g-upload(
          :file="logo"
          :max="1"
          @changeFile="changeFileLogo"
          @preview="handlePreview"
        )    

      a-form-item.updatePic(:label="`企业宣传图`")
        g-upload(
          :file="img"
          :max="1"
          @preview="handlePreview"
          @changeFile="changeFile"
        )     

      a-form-item(label="所在地区" name="locations")
        AreaCascader(v-model:value="data.locations" placeholder="请选择所在地区" @getLabel="getLabel" @change="changeLocations")

      a-form-item(label="详细地址" name="address")
        a-input(v-model:value.trim="data.address" allowClear :maxlength="20" placeholder="请输入详细地址")

      a-form-item(label="楼栋数" name="building" )
        a-input-number(v-model:value.trim="data.building" allowClear :maxLength="20" placeholder="请输入联系人")
        span.pl2 栋

      a-form-item(label="占地面积" name="areaCovered")
        a-input-number(v-model:value.trim="data.areaCovered" allowClear placeholder="请输入占地面积")
        span.pl2 平方米 

      a-form-item.remark(:label="`企业简介`" name="remark")
        a-textarea(v-model:value="data.remark" showCount :maxlength="200" allowClear :auto-size="{ minRows: 2, maxRows: 18 }" placeholder="请输入")
      a-form-item(label="业务端地址" name="webSiteUrl")
        a-input(v-model:value.trim="data.webSiteUrl" allowClear :maxlength="200" placeholder="请输入业务端地址")
      a-form-item(label="启用状态" name="enabled")
        a-switch(v-model:checked="data.enabled" un-checked-children="禁用" checked-children="启用")  
  template(#footer-page)   
    a-button(@click="cancel") 返回
    a-button(type="primary" @click="onSubmit('')" :loading="loading") 保存

  a-modal(v-model:visible="visible" title="管理员列表" centered @ok="saveUserAdmin" @cancel="cancelAdmin") 
    a-form(layout="inline" :model="params" ref="modelForm")
      a-form-item(label="")
        a-input(v-model:value="params.keyword" placeholder="姓名")
      a-form-item()  
        a-space(:size="16")
          a-button(type="primary" @click="search") 查询
          a-button(@click="reset") 重置


    div.pt2   
      a-table(
        :columns="columns"
        :data-source="tableData"
        :rowKey="(record) => record.id" 
        :pagination="pagination"
        :rowSelection="rowSelection" 
        :custom-row="customRow"
        :loading="modalTabLoad"
        size="small"
        @change="changePage")
a-modal(v-model:visible="preview.previewVisible"
  :title="preview.previewTitle"
    @ok="preview.previewVisible=false"
      @cancel="preview.previewVisible=false") 
        a-image(:src="preview.previewImage" style="width: 100%;height: 100%")


</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRaw,
  ref,
  getCurrentInstance,
  onMounted,
  toRefs,
  computed,
  unref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import { getToken } from "@/services/AccountService";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
export default defineComponent({
  components: {
    PlusOutlined,
    LoadingOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      data: {
        name: "",
        code: "",
        userAdminId: null,
        locations: [],
        locationName: "",
        address: "",
        phone: "",
        enabled: "",
        remark: "",
        building: "",
        areaCovered: "",
        logoId: "",
        fileIds: "",
        webSiteUrl: ""
      },
      headers: null,
      options: null,
    });

    const logo = ref([]);
    const img = ref([]);

    const status = ref("");
    const form = ref();
    const fileList = ref([]);
    const businessImg = ref([]);

    const rules = {
      name: [
        {
          required: true,
          message: `请输入企业名称`,
        },
      ],
      userAdminId: [
        {
          required: true,
          message: "请选择管理用户",
        },
      ],
      locations: [
        {
          required: true,
          message: "请选择所在地区",
        },
      ],
    };

    const imageUrl = ref("");
    const loading = ref(false);
    const modalTabLoad = ref(false);

    // 有id
    const id = route.query.id;

    const visible = ref(false);
    const tableState = reactive({
      tableData: null,
      columns: [
        { dataIndex: "name", title: "姓名" },
        { dataIndex: "mobile", title: "联系电话" },
      ],
      pagination: {
        current: 1,
        size: "small",
        total: 0,
        defaultPageSize: 5,
      },
      params: {
        keyword: "",
        pageSize: 5,
        pageNumber: 1,
        enabled: true,
      },
    });

    const onSubmit = (data) => {
      form.value.validate().then(() => {
        try {
          loading.value=true
          if (!id) {
            proxy.$api.tenantPost("post", toRaw(formState.data)).then((res) => {
              proxy.$message.success("操作成功");
              router.back(-1);
            });
          } else {
            proxy.$api.tenants("put", toRaw(formState.data)).then((res) => {
              proxy.$message.success("操作成功");
              router.back(-1);
            });
          }
        } catch (error) {

        } finally{
          loading.value=false
        }
      });
    };
    const cancel = () => {
      form.value.resetFields();
      router.back(-1);
    };

    const beforeUpload = (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/svg+xml";

      if (!isJpgOrPng) {
        proxy.$message.error("仅限上传JPG,JPEG,PNG,SVG格式!");
      }

      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        proxy.$message.error("图片小于2MB!");
      }

      return isJpgOrPng && isLt2M;
    };

    const handleChange = (info) => {
      if (info.file.status === "uploading") {
        loading.value = true;
        return;
      }

      if (info.file.status === "done") {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, (base64Url) => {
          imageUrl.value = base64Url;
          loading.value = false;
        });
      }

      if (info.file.status === "error") {
        loading.value = false;
        proxy.$message.error("上传失败");
      }
    };

    const customRequest = (info) => {
      fileList.value.push(info.file);
      const formData = new FormData();
      fileList.value.forEach((item) => {
        formData.append("uploadExcel", item);
      });
      upLoadFile({ file: fileList.value });
    };

    const upLoadFile = (data) => {
      proxy.$api.upload("post", data);
    };

    const getTableData = async () => {
      modalTabLoad.value = true;
      const data = await proxy.$api.managerList("get", tableState.params);
      if (data && data.records) {
        tableState.tableData = data.records;
        tableState.pagination.total = data.total;
      }
      modalTabLoad.value = false;
    };

    const openModal = async () => {
      tableState.params.keyword = "";
      tableState.params.pageNumber = 1;
      tableState.pagination.current = 1;
      await getTableData();
      visible.value = true;
    };

    const selectedRowKeys = ref(null);

    const onSelectChange = (changableRowKeys, selectedRows) => {
      selectedRowKeys.value = changableRowKeys;
    };

    const Select = (record) => {
      selectedRowKeys.value = record.id;
    };

    const rowSelection = computed(() => {
      return {
        type: "radio",
        selectedRowKeys: unref([selectedRowKeys.value]),
        onSelect: Select,
      };
    });
    const customRow = (record) => {
      return {
        onClick: () => {
          onSelectChange(record.id, record);
        },
      };
    };

    const getData = async (id) => {
      const data = await proxy.$api.tenants("get", { id: id });
      formState.data.id = data?.id;
      formState.data.name = data?.name;
      formState.data.code = data?.code;
      formState.data.userAdminId = data.userAdminId ? data.userAdminId : null;
      formState.data.locations = data?.locations;
      formState.data.building = data?.building;
      formState.data.areaCovered = data?.areaCovered;
      formState.data.address = data?.address;
      formState.data.phone = data?.phone;
      formState.data.enabled = data?.enabled;
      formState.data.webSiteUrl = data?.webSiteUrl??'';
      formState.data.remark = data?.remark;
      formState.data.logoId = data?.logoId ? data?.logoId : "";
      formState.data.fileIds = data?.fileIds ? data?.fileIds : [];
      if (data?.logo) {
        Object.assign(data.logo, { url: data.logo.path });
        logo.value = [data?.logo];
      }
      if (data?.files?.length) {
        data.files = data.files.filter((item) => {
          Object.assign(item, { url: item.path });
          return item;
        });
        img.value = data.files;
      }
      // 表格默认选中管理员
      selectedRowKeys.value = data.userAdminId;
      // 查询管理员构造选项
      if (data.userAdminId || data.userAdminId === 0) {
        const userInfo = await proxy.$api.userId("get", {
          id: data.userAdminId,
        });
        const adminData = {
          value: "",
          label: "",
        };
        adminData.value = userInfo.id;
        adminData.label = userInfo.name;
        formState.options = [{ ...adminData }];
      }
    };

    const cancelAdmin = () => {
      selectedRowKeys.value = formState.data.userAdminId;
      visible.value = false;
    };

    const saveUserAdmin = async () => {
      formState.data.userAdminId = selectedRowKeys.value
        ? selectedRowKeys.value
        : null;
      // 查询管理员构造选项
      const userInfo = await proxy.$api.userId("get", {
        id: selectedRowKeys.value,
      });
      const data = {
        value: "",
        label: "",
      };
      data.value = userInfo.id;
      data.label = userInfo.name;
      formState.options = [{ ...data }];
      visible.value = false;
      form.value.validateFields(["userAdminId"]);
    };

    const changePage = (e) => {
      tableState.params.pageNumber = e.current;
      tableState.pagination.current = e.current;
      getTableData();
    };

    const search = () => {
      tableState.pagination.current = 1;
      getTableData();
    };
    const reset = () => {
      tableState.pagination.current = 1;
      tableState.params.pageNumber = 1;
      tableState.params.keyword = "";
      getTableData();
    };
    const preview = reactive({
      previewVisible: false,
      previewTitle: '',
      previewImage: '',

    })
    const handlePreview = (data) => {
    
      preview.previewVisible = true
      preview.previewTitle='图片展示'
      preview.previewImage=data.url
    }
    const changeFileLogo = (data) => {
      if (data[0]) {
        formState.data.logoId = data[0];
      } else {
        formState.data.logoId = null;
      }
    };

    const changeFile = (data) => {
      if (data[0]) {
        formState.data.fileIds = data;
      } else {
        formState.data.fileIds = null;
      }
    };

    const getLabel = (value) => {
      formState.data.locationName = value
        ? value.length
          ? value.join("/")
          : ""
        : "";
    };
    const changeLocations = () => {
      form.value.validateFields(["locations"]);
    };
    onMounted(async () => {
      if (id) {
        getData(id);
      } else {
        formState.data = {
          name: "",
          code: "",
          userAdminId: null,
          enabled: true,
          remark: "",
        };
      }

      const token = await getToken();
      formState.headers = {
        Authorization: "Bearer " + token.access_token,
        terminal: window.config.terminal,
      };
    });

    return {
      img,
      logo,
      form,
      rules,
      modalTabLoad,
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
      fileList,
      businessImg,
      ...toRefs(formState),
      ...toRefs(tableState),
      changeLocations,
      changeFileLogo,
      handlePreview,
      customRequest,
      saveUserAdmin,
      beforeUpload,
      handleChange,
      rowSelection,
      cancelAdmin,
      changeFile,
      changePage,
      openModal,
      customRow,
      imageUrl,
      getLabel,
      onSubmit,
      loading,
      visible,
      status,
      preview,
      search,
      cancel,
      reset,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/form/index.less");

.businessCtr {
  border-radius: 4px;
}

:deep(.ant-upload) {
  width: 100px;
  height: 100px;
  overflow: hidden;

  img {
    width: 100px;
    height: 100px;
  }
}

:deep(.ant-input-number) {
  width: 75%;
}

:deep(.ant-form-item-control-input) {
  height: 100%;
}

.updatePic {
  grid-row-start: 2;
  grid-row-end: 4;
}</style>
