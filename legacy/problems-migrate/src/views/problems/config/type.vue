<template>
  <div id="basePage">
    <g-layout-no-footer :title="pageTitle">
      <template #header-btn>
      </template>
      <template #content-left>
        <div class="baseLeft">
          <div class="title flex-between">
            <gVerticalLine :title="'隐患分类'"></gVerticalLine>
            <a-button type="primary" @click="category('')" size="small">新增</a-button>
          </div>
          <div class="list">
            <ul>
              <li
                v-for="item in categoryList"
                :key="item.id"
                :class="[
                  checkCateId === item.id ? 'primary-color-1' : '',
                  ,
                  'flex-between',
                  'primary-color-1-hover',
                ]"
                @click="checkCategory(item)"
              >
                <div class="liName">{{ item.name }}</div>
                <div class="liBtn">
                  <EditOutlined @click.stop="category(item)" />
                  <DeleteOutlined
                    style="color: red"
                    @click.stop="deleteCategory(item)"
                  />
                  <!-- </a-popconfirm> -->
                </div>
              </li>
            </ul>
          </div>
        </div>
      </template>
      <template #content-table>
        <div class="pl2 tableCtr">
          <TableInModal
            ref="tableRef"
            :columns="columns"
            :api="api"
            :btns="btns"
            :search="search"
            :searchLength="0"
            :sizeChanger="true"
            :rowSelection="false"
            :pagination="false"
            :rowKey="'id'"
            :modal="modal"
            :modalTitle="'隐患类型'"
            :rules="rules"
            tableCode="HIDDEN_DANGER_TYPE_LIST"
          ></TableInModal>
        </div>
      </template>
    </g-layout-no-footer>
    <a-modal
      v-model:visible="visible"
      :title="editCategory ? '编辑隐患分类' : '新增隐患分类'"
      centered
      @ok="save"
      @cancel="cancel"
    >
      <a-form ref="modalForm" :model="model" :rules="modelRules">
        <a-form-item label="隐患分类" name="name">
          <a-input
            v-model:value="model.name"
            placeholder="隐患分类名称"
          ></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import { usePageName } from '@ghcloud/cube-utils'

export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const { pageTitle } = usePageName()
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const tableRef = ref();
    const modalForm = ref();
    const state = reactive({
      api: {
        list: "dangerType",
        deleteSingle: "dangerTypeId",
        edit: "dangerTypeId",
        detail: "record",
        add: "dangerTypeAdd",
      },
      btns: ["add", "edit", "deleteSingle"],
      modal: [
        {
          label: "类型名称",
          value: "name",
          maxLength: 20,
          placeholder: "请输入类型名称",
        },
        {
          label: "隐患分类",
          value: "hiddenDangerCategoryId",
          component: "g-select",
          url: "dangerCategory",
          placeholder: "请选择隐患分类",
          field: { name: "label", id: "value" },
          changeLabel: (value, option, modalForm) => {
            Object.assign(modalForm, {
              hiddenDangerCategoryName: option.label,
            });
          },
        },
      ],
      model: {
        id: "",
        name: "",
      },
      modelRules: {
        name: [{ required: true, message: "请输入隐患分类" }],
      },
      rules: {
        name: [{ required: true, message: "请输入类型名称" }],
        hiddenDangerCategoryId: [{ required: true, message: "请选择隐患分类" }],
      },
      columns: [
        {
          dataIndex: "name",
          title: "隐患类型",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "hiddenDangerCategoryName",
          title: "隐患分类",
          slots: {
            customRender: "hiddenDangerCategoryName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver content={text} position="topLeft">
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      categoryList: [],
      editCategory: "",
      visible: false,
      checkCateId: "",
    });

    const getCategory = () => {
      proxy.$api.dangerCategory("get").then((res) => {
        state.categoryList = res;
      });
    };

    const category = (item) => {
      state.editCategory = item;
      if (item) {
        state.model.id = item.id;
        state.model.name = item.name;
      }
      state.visible = true;
    };

    const deleteCategory = (item) => {
      Modal.confirm({
        title: "删除当前分类？",
        content: item.name,
        okText: '确认',
        cancelText: '取消',
        icon: () => createVNode(ExclamationCircleOutlined),
        centered: true,
        onOk: () => {
          proxy.$api.dangerCategoryId(item.id, "delete").then(() => {
            getCategory();
          });
        },
      });
    };

    const cancel = () => {
      state.model = {
        name: "",
        id: "",
      };
      modalForm.value.resetFields();
      state.visible = false;
    };
    const save = () => {
      modalForm.value.validate().then(() => {
        state.model.id
          ? proxy.$api.dangerCategoryId(state.model, "put").then(() => {
              getCategory();
              cancel();
            })
          : proxy.$api
              .dangerCategoryAdd({ name: state.model.name }, "post")
              .then(() => {
                getCategory();
                cancel();
              });
      });
    };

    const checkCategory = (record) => {
      state.checkCateId = state.checkCateId === record.id ? "" : record.id;
      tableRef.value.getData({ hiddenDangerCategoryId: state.checkCateId });
    };

    onMounted(() => {
      getCategory();
    });

    return {
      tableRef,
      modalForm,
      ...toRefs(state),
      deleteCategory,
      checkCategory,
      category,
      cancel,
      save,
      pageTitle
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/theme/color.less");

#basePage {
  width: 100%;
  height: 100%;
}
:deep(.content-left) {
  .baseLeft {
    min-width: 200px;
    height: 100%;
    padding-right: 16px;
    border-right: 1px solid @tableBottomLine;
    .title {
      width: 100%;
      height: 32px;
      line-height: 32px;
    }
    .list {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      padding: 12px 0;
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        li {
          width: 100%;
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          cursor: pointer;
          // &.primary-color-1-hover:hover {
          //   background-color: #001529;
          //   color: #fff;
          // }
          // &.primary-color-1 {
          //   background-color: #001529;
          //   color: #fff;
          // }
          .liName {
            width: calc(100% - 35px);
            overflow: hidden;
          }
          .liBtn {
            width: 35px;
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }
  }
}
.tableCtr {
  width: 100%;
  height: 100%;
}
</style>
