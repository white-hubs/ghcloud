<template>
  <div class="person-container">
    <g-layout :title="pageTitle">
      <!-- 头部按钮区域 -->
      <template v-slot:header-btn>
        <div style="display: flex">
          <a-button
            type="primary"
            :disabled="data.length === 0"
            :loading="downLoading"
            @click="
              () => {
                handleDownload();
              }
            "
            >导出</a-button
          >
          <a-upload :customRequest="fileUpload" :showUploadList="false">
            <a-button type="primary" :loading="templateLoading.import">导入</a-button>
          </a-upload>
          <a-button type="primary" @click="downTemplate" :loading="templateLoading.down">下载模版</a-button>
          <a-button type="primary" @click="addPerson">新增</a-button>
        </div>
      </template>
      <!-- 内容左侧区域 -->
      <!-- <template v-slot:content-left>
        <div style="margin-right:10px; height: 100%;">
          <a-input v-model.trim="deptKeyWord" @change="change" placeholder="请输入部门名称" :maxlength="20"></a-input>
          <a-tree class="draggable-tree" v-model:expandedKeys="expandedKeys" :treeData="treeData"
            :fieldNames="treeFieldNames" :blockNode="true" :selectedKeys="selectedKeys"
            @select="selectedNode"></a-tree>
        </div>
      </template> -->
      <!-- 内容搜索区域 -->
      <template v-slot:content-search>
        <a-form layout="inline" ref="formRef">
          <a-form-item name="organizationId" label="部门">
            <a-tree-select
              allowClear
              tree-node-filter-prop="name"
              show-search
              dropdownMatchSelectWidth
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="treeData"
              :fieldNames="treeFieldNames"
              v-model:value="personForm.organizationId"
              :getPopupContainer="(triggerNode) => triggerNode.parentNode"
              @select="selectedNode"
              style="width: 200px"
            >
              <template #title="{ name }">
                <span :title="name" class="text-ellipsis">{{ name }}</span>
              </template>
            </a-tree-select>
          </a-form-item>
          <a-form-item name="enabled" label="状态">
            <a-select v-model:value="personForm.enabled" allowClear @change="changeStatus" style="width: 180px">
              <a-select-option v-for="item in types" :value="item.value" :key="item.value">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="positionId" label="职位">
            <a-select v-model:value="personForm.positionId" allowClear style="width: 180px">
              <a-select-option v-for="item in postList" :value="item.id" :key="item.value">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="appointmentId" label="岗位">
            <a-select v-model:value="personForm.appointmentId" allowClear style="width: 180px">
              <a-select-option v-for="item in appointmentList" :value="item.id" :key="item.value">{{ item.name }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item name="keyword">
            <a-input v-model:value="personForm.keyword" placeholder="请输入人员名称/手机号" :maxlength="20"></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="default" @click="resetTable">重置</a-button>
          </a-form-item>
        </a-form>
      </template>
      <!-- 内容表格区域 -->
      <template v-slot:content-table>
        <a-table
          :columns="columns"
          :data-source="data"
          :loading="tabLoading"
          size="small"
          rowKey="id"
          bordered
          :pagination="false"
          :locale="{ emptyText: '暂无数据' }"
          :scroll="{ y: tableScrollY }"
        >
          <template v-slot:switch="{ record }">
            <span @click.stop="">
              <a-switch
                :checked="record.enabled"
                @change="(checked) => changeEnabled(checked, record)"
                checked-children="启用"
                un-checked-children="禁用"
              ></a-switch>
            </span>
          </template>
          <template v-slot:button="{ record }">
            <span @click.stop="">
              <a-space :size="12">
                <a @click.stop="editPerson(record)" class="a_primary">编辑</a>
                <a @click.stop="resetPassWord(record)" class="a_primary">重置密码</a>
                <a-popconfirm title="是否删除当前选中？" cancelText="取消" okText="确定" @confirm.stop="deletePerson(record)">
                  <a-button @click.stop="" type="link" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </span>
          </template>
        </a-table>
      </template>
      <!-- 底部页码区域 -->
      <template v-slot:footer-page>
        <a-pagination
          v-model:current="pageNum"
          v-model:pageSize="pageSize"
          :total="total"
          show-size-changer
          :show-total="(total, range) => `共 ${total} 条`"
          @change="changeNum"
          @showSizeChange="changeSize"
        >
          <template v-slot:buildOptionText="props">
            <span>{{ props.value }}条/页</span>
          </template>
        </a-pagination>
      </template>
    </g-layout>
    <!-- 重置密码模态框 -->
    <a-modal v-model:visible="visible" title="重置密码">
      <template v-slot:footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="modalFormRef" :model="modalForm" :rules="modalRules">
        <a-form-item label="姓名" name="name">
          <span>{{ modalForm.name }}</span>
        </a-form-item>
        <a-form-item label="所属部门" name="organizations">
          <span>{{ modalForm.organizations }}</span>
        </a-form-item>
        <a-form-item label="管理部门" name="managedOrganizations">
          <span>{{ modalForm.managedOrganizations }}</span>
        </a-form-item>
        <a-form-item label="联系电话" name="mobile">
          <span>{{ modalForm.mobile }}</span>
        </a-form-item>
        <a-form-item label="新密码" name="newPassword">
          <a-input-password v-model:value="modalForm.newPassword" placeholder="请输入新密码" :maxlength="16"></a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="jsx">
import { DownOutlined } from "@ant-design/icons-vue";
import { TreeSelect } from "ant-design-vue";
import { message } from "ant-design-vue";
import _ from "lodash";
import { defineComponent, onMounted, toRefs, reactive, ref, computed, getCurrentInstance, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import { KEYWORD_ALIAS } from "@ghcloud/cube-business-alias-manage-plugin";
import { usePageName, useDownloadExcel, queryParameter } from "@ghcloud/cube-utils";

import { cubeOuaaService } from "@/api/service";
import { SessionEnum } from "@/models/session";
import axios from "@/utils/axios";
import Crypto from "@/utils/crypto.js";
import { types } from "@/utils/enumerate";
import { getSessionItemWithObject } from "@/utils/session";
import { historyPush } from "@/utils/utils";
export default defineComponent({
  components: {
    DownOutlined,
    TreeSelect,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const store = useStore();
    const formRef = ref();
    const modalFormRef = ref();
    const tabLoading = ref(false);
    const treeLoading = ref(false);
    const { pageTitle } = usePageName();
    const { downLoading, handleDownload } = useDownloadExcel({
      fileName: pageTitle,
      exportServiceApi: async () => {
        const params = Object.keys(state.personForm).reduce((acc, key) => {
          if (state.personForm[key] !== null) {
            acc[key] = state.personForm[key];
          }
          return acc;
        }, {});
        return await cubeOuaaService.getUsersExcel(params);
      },
    });

    const templateLoading = reactive({
      down: false,
      import: false,
    });
    /** Tree / TreeSelect 的字段映射（antd-vue 3+ 用 fieldNames，勿用 fieldNames） */
    const treeFieldNames = {
      label: "name",
      key: "id",
      value: "id",
      children: "children",
    };
    const state = reactive({
      timer: null,
      deptKeyWord: "",
      appointmentList: [],
      treeData: [],
      expandedKeys: [],
      postList: [],
      defaultProps: {
        key: "id",
        value: "id",
        children: "children",
      },
      tableScrollY: 550,
      personForm: {
        keyword: "",
        enabled: "",
        organizationId: "",
        positionId: "",
        appointmentId: "",
      },
      types: types,
      columns: [
        {
          title: "帐号",
          dataIndex: "username",
          width: 120,
          ellipsis: true,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>;
          },
        },
        {
          title: "姓名",
          dataIndex: "name",
          width: 120,
          ellipsis: true,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>;
          },
        },
        {
          title: "手机号",
          dataIndex: "mobile",
          width: 120,
          ellipsis: true,
          customRender: ({ text }) => {
            return <PopOver content={text}>{text}</PopOver>;
          },
        },
        {
          title: "微信号",
          dataIndex: "wechatName",
          width: 120,
          ellipsis: true,
          customRender: ({ text }) => {
            return <PopOver content={text ?? "--"}>{text ?? "--"}</PopOver>;
          },
        },
        {
          title: "所属部门",
          dataIndex: "organizations",
          width: 120,
          slots: {
            customRender: "organizations",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const data = text?.map((item) => item.name);
            if (data.length) {
              return <PopOver content={data.join("/")}>{data.join("/")}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "管理部门",
          dataIndex: "managedOrganizations",
          width: 120,
          slots: {
            customRender: "managedOrganizations",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const data = text?.map((item) => item.name);
            if (data && data.length) {
              return <PopOver content={data.join("，")}>{data.join("，")}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "职位",
          dataIndex: "positions",
          width: 120,
          slots: {
            customRender: "positions",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const data = text?.map((item) => item.name);
            if (data && data.length) {
              return <PopOver content={data.join("，")}>{data.join("，")}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "岗位",
          dataIndex: "appointmentList",
          width: 120,
          slots: {
            customRender: "appointmentList",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const data = text?.map((item) => item.name);
            if (data && data.length) {
              return <PopOver content={data.join("，")}>{data.join("，")}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "角色",
          dataIndex: "roles",
          width: 120,
          slots: {
            customRender: "roles",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            const data = text?.map((item) => item.name);
            if (data.length) {
              return <PopOver content={data.join("、")}>{data.join("、")}</PopOver>;
            } else {
              return "--";
            }
          },
        },
        {
          title: "状态",
          dataIndex: "",
          width: 200,
          slots: { customRender: "switch" },
        },
        {
          title: "操作",
          dataIndex: "",
          slots: { customRender: "button" },
          width: "200px",
        },
      ],
      data: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      selectedKeys: [],
      nowEnterprise: null,
      getDataTimer: null,
      visible: false,
      modalForm: {
        name: null,
        organizations: null,
        managedOrganizations: null,
        mobile: null,
        newPassword: null,
      },
    });
    const modalRules = {
      newPassword: [
        { required: true, message: "请输入新密码", trigger: "change" },
        {
          pattern: new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/, "g"),
          trigger: "blur",
          message: "密码必须包含字母大写、小写、数字、特殊字符且至少8位",
        },
      ],
    };

    const getAllData = () => {
      getDeptTree();
      getPersonList();
    };

    onMounted(() => {
      const cacheQuery = queryParameter.getQuery() || {};
      state.personForm = {
        ...state.personForm,
        keyword: cacheQuery.keyword ?? "",
        enabled: cacheQuery.enabled === "true" ? true : cacheQuery.enabled === "false" ? false : (cacheQuery.enabled ?? ""),
        organizationId: cacheQuery.organizationId ?? "",
        appointmentId: cacheQuery.appointmentId ?? "",
        positionId: cacheQuery.positionId ?? "",
      };
      state.pageNum = Number(cacheQuery.pageNum ?? 1);
      state.pageSize = Number(cacheQuery.pageSize ?? 10);
      getAllData();
      getAppointmentList();
      getPostList();
      nextTick(() => {
        setTimeout(() => {
          getScrollY();
        }, 200);
      });
    });
    // 获取职位
    const getPostList = async () => {
      const data = await proxy.$api.positions("get", {
        name: "",
        enabled: true,
        pageNumber: 1,
        pageSize: 1000,
      });
      state.postList = data.records;
    };
    const getAppointmentList = async () => {
      const data = await proxy.$api.getAppointment("get", {
        enable: true,
        pageNumber: 1,
        pageSize: 1000,
      });
      state.appointmentList = data.records;
    };
    const getScrollY = () => {
      const contentHeight = document.querySelector(".layout-content")?.offsetHeight;
      const searchHeight = document.querySelector(".content-search")?.offsetHeight;
      if (contentHeight && searchHeight) {
        state.tableScrollY = contentHeight - searchHeight - 50;
      }
    };

    const getDeptTree = async () => {
      treeLoading.value = true;
      const data = await proxy.$api.organizations("get", {
        name: state.deptKeyWord,
        enabled: true,
      });
      treeLoading.value = false;
      if (data && Array.isArray(data)) {
        // []
        // const addKeys = {
        //   value: 'id',
        //   key: 'id',
        //   children: 'children',
        //   slots: {
        //     title: 'title'
        //   },
        // }
        // let handleData = [...data]
        // for (const key in addKeys) {
        //   handleData = addOrReplaceProperty(handleData, key, addKeys[key])
        // }
        state.treeData = addOrReplaceProperty(data, "slots", { title: "title" });
      }
    };
    //todo 新增属性有值就赋值 没有值
    const addOrReplaceProperty = (tree, propertyName, propertyValue) => {
      tree.forEach((node) => {
        const keys = Object.keys(node);
        // 给当前节点添加指定属性
        node[propertyName] = node[propertyValue] ?? propertyValue;
        if (node.children && node.children.length > 0) {
          // 如果有子节点，递归调用函数继续给子节点添加属性
          addOrReplaceProperty(node.children, propertyName, propertyValue);
        }
      });
      return tree;
    };
    // 处理input节流
    const change = () => {
      if (state.timer) {
        return;
      }
      state.timer = setTimeout(() => {
        clearTimeout(state.timer);
        state.timer = null;
        getDeptTree();
      }, 500);
    };
    const handleSearch = () => {
      state.pageNum = 1;
      getPersonList();
    };

    const getPersonList = async () => {
      tabLoading.value = true;
      queryParameter.setAddressQuery({
        ...state.personForm,
        pageNum: state.pageNum,
        pageSize: state.pageSize,
      });
      const data = await proxy.$api.tenantUsers("get", {
        ...state.personForm,
        pageSize: state.pageSize,
        pageNumber: state.pageNum,
      });
      tabLoading.value = false;
      state.total = data.total;
      if (data.records && Array.isArray(data.records)) {
        state.data = data.records;
      }
    };

    const resetTable = () => {
      state.pageNum = 1;
      state.pageSize = 10;
      state.personForm = {
        keyword: "",
        enabled: "",
        organizationId: "",
        appointmentId: "",
        positionId: "",
      };
      // state.personForm.organizationId = "";
      state.selectedKeys = [];
      queryParameter.setAddressQuery({});
      getPersonList();
    };

    const addPerson = () => {
      historyPush({}, "/person/editPerson");
    };
    const fileUpload = async (file) => {
      templateLoading.import = true;
      const formData = new FormData();
      formData.append("file", file.file);
      // const data = await proxy.$api.tenantUsers(formData);
      axios({
        url: "/api/ouaa/user-under-tenant/import-user",
        responseType: "blob",
        method: "post",
        data: formData,
        headers: {
          tenant: getSessionItemWithObject(SessionEnum.nowEnterprise).code,
          terminal: 10000,
          Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("GH-Token")).access_token}`,
          "Content-Type": "multipart/form-data",
        },
      })
        .then(() => {
          templateLoading.import = false;
          message.success("导入成功");
        })
        .catch((e) => {
          templateLoading.import = false;
          e.response.data.text().then((e) => {
            message.error(JSON.parse(e).message);
          });
        });
    };
    const downTemplate = async () => {
      templateLoading.down = true;
      axios({
        url: "/api/ouaa/user-under-tenant/download/template",
        responseType: "blob",
        method: "post",
        headers: {
          tenant: getSessionItemWithObject(SessionEnum.nowEnterprise).code,
          terminal: 10000,
          Authorization: `Bearer ${JSON.parse(sessionStorage.getItem("GH-Token")).access_token}`,
          "Content-Type": "application/json",
        },
      }).then((res) => {
        // 创建一个隐藏的a链接
        const link = document.createElement("a");
        const blob = new Blob([res], { type: "application/vnd.ms-excel" }); // 文件流处理
        link.style.display = "none"; // 去除a标签的样式
        link.href = URL.createObjectURL(blob);
        link.download = `${KEYWORD_ALIAS.staff}管理模版.xlsx`;
        document.body.appendChild(link);
        // 模拟点击事件
        link.click();
        // 移除创建的a标签
        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
        templateLoading.down = false;
      });
    };
    const changeEnabled = async (checked, record) => {
      const item = _.cloneDeep(record);
      item.enabled = checked;
      Object.assign(item, {
        managedOrganizationIds: item.managedOrganizations?.map((item) => item.id) || [],
        organizationIds: item.organizations?.map((item) => item.id) || [],
        positionIds: item.positions?.map((item) => item.id) || [],
        roleIds: item.roles?.map((item) => item.id) || [],
      });
      await proxy.$api.userId("put", item);
      record.enabled = checked;
      message.success("操作成功");
      getPersonList();
    };
    const resetPassWord = (record) => {
      state.modalForm = {
        id: record.id,
        name: record.name,
        organizations: record.organizations.map((item) => item.name).join("、"),
        managedOrganizations: record.managedOrganizations.map((item) => item.name).join("、") || "--",
        mobile: record.mobile,
        newPassword: null,
      };
      state.visible = true;
    };
    const editPerson = (record) => {
      historyPush({ id: record.id }, "/person/editPerson");
    };
    const deletePerson = async (record) => {
      await proxy.$api.deletePerson("delete", record.id);
      message.success("操作成功");
      getPersonList();
    };
    const changeNum = (page) => {
      state.pageNum = page;
      getPersonList();
    };
    const changeSize = (current, size) => {
      state.pageSize = size;
      getPersonList();
    };
    const selectedNode = (selectedKeys) => {
      getPersonList();
    };
    const changeStatus = () => {
      state.pageNum = 1;
    };
    //保存新密码
    const handleOk = () => {
      modalFormRef.value.validate().then(() => {
        state.modalForm.newPassword = Crypto.encrypt(state.modalForm.newPassword);
        proxy.$api.resetPassword("put", state.modalForm).then((res) => {
          proxy.$message.success("操作成功");
          state.visible = false;
        });
      });
    };
    //
    const handleCancel = () => {
      state.visible = false;
    };
    return {
      ...toRefs(state),
      treeFieldNames,
      getDeptTree,
      change,
      formRef,
      modalFormRef,
      getPersonList,
      handleSearch,
      resetTable,
      addPerson,
      downTemplate,
      fileUpload,
      tabLoading,
      changeEnabled,
      resetPassWord,
      editPerson,
      deletePerson,
      changeNum,
      changeSize,
      treeLoading,
      selectedNode,
      changeStatus,
      modalRules,
      templateLoading,
      handleOk,
      pageTitle,
      handleCancel,
      KEYWORD_ALIAS,
      downLoading,
      handleDownload,
    };
  },
});
</script>

<style lang="less" scoped>
.draggable-tree {
  text-align: left;
  height: calc(100% - 32px);
  overflow-x: auto;
  overflow-y: auto;
}

.text-ellipsis {
  width: 190px;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}

.view_sider {
  width: 200px;
  height: 100%;
  overflow-y: auto;
}

// ant_design.less文件注释后可以删除 (
:deep(.ant-tree-treenode-selected) {
  background-color: transparent;
  color: #000;

  .ant-tree-title {
    color: #000;
  }
}

:deep(.ant-select-tree-title) {
  display: flex;
}

:deep(.ant-tree) {
  li .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background-color: #bae7ff;
    // color: #1890ff;
  }
}

// )
</style>
<style lang="less">
.person-container {
  width: 100%;
  height: 100%;
}
</style>
