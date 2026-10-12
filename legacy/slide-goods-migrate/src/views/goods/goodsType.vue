<template lang="pug">
a-layout
  a-layout-content
    div.p2
      a-table(
        :columns="columns"
        :data-source="data"
        size="middle"
        :pagination="false"
        :rowKey="(record) => record.id"
        :expandedRowKeys="expandedRowKeys"
        :scroll="{x:1050, y: tableHeight }"
        @expand="iconExpand"
        :loading="loading")
        template(#title)
          div.flex.justify-between.bottomLine
            g-vertical-line(title="商品品类")
            a-button(type="primary" @click="AddSubare('addHighest')") 新增一级
          a-form.p2(layout="inline" style="padding-top:16px")
            a-form-item(label="") 
              a-input( v-model:value.trim="condition.keyword" placeholder="品类名称" @pressEnter="search" allowClear)
            a-form-item
              a-space(:size="16") 
                a-button(type="primary" @click="search") 查询
        template(#expandIcon="record") 
          IconFont(v-if="record.record?.children.length" :type="expandedRowKeys.includes(record.record.id) ? 'icon-xiangxia' :'icon-xiangyou'" @click="iconExpand(!record.expanded,record.record)")
        template(
          v-for="col in ['name']"
          #[col]="{ text, record }"
          :key="col")
          div
            a-input(
              v-if="editableData[record.id]"
              v-model:value.trim="editableData[record.id][col]"
              allowClear
              :maxlength="20"
              style="margin: -5px 0")
            template( v-else) {{ text }}
        template( #action="{ record }")
          div(class="editable-row-operations")
            span( v-if="editableData[record.id]")
              a-space(:size="16")
                a(@click.stop="save(record.id)") 保存
                a-popconfirm(
                  title="是否取消修改"
                  cancelText="取消"
                  okText="确定"
                  @confirm.stop="cancel(record)")
                  a(@click.stop="") 取消
            span(v-else)
              a-space(:size="16")
                a(@click="AddSubare(record)" v-if="record.level < 3") 新增下级
                a(@click.stop="edit(record.id)") 编辑
                a-popconfirm(
                title="是否删除当前选中？"
                cancelText="取消"
                okText="确定"
                @confirm.stop="Delete(record)")
                  a.deleteRow(@click.stop="") 删除
</template>
<script lang="jsx">
import { cloneDeep } from "lodash-es";
import { flattenTree } from "@/utils/common.js";
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  onMounted,
} from "vue";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons-vue";
import { tableColumns } from "@/utils/common";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const editableData = reactive({});
    const state = reactive({
      columnList: ["name", "action"],
      columns: [
        {
          mark: "name",
          dataIndex: "name",
          key: "name",
          title: "品类名称",
          slots: {
            customRender: "name",
          },
          // width: 90,
        },

        {
          mark: "code",
          dataIndex: "code",
          key: "code",
          title: "商品编号",
          slots: {
            customRender: "code",
          },
          // width: 90,
        },
        {
          title: "操作",
          mark: "action",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 180,
          fixed: "right",
        },
      ],
      visiables: ["name", "code"],
      data: [],
      icon: createVNode(CaretDownOutlined),
      allType: [],
      loading: true,
      pagination: null,
      tableHeight: 500,
      allowClick: true,
      expandedRowKeys: [],
    });
    const condition = ref({
      keyword: "",
    });

    // 获取商品品类数据
    const getTableData = (data) => {
      // debugger
      proxy.$api
        .getGoodsTypeList(data,"get" )
        .then((res) => {
          sessionStorage.setItem("allowAdd", 1);
          state.data = res;
          if (res) {
            state.allType = flattenTree(res);
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };
    onMounted(() => {
      // state.columns = tableColumns("goodsManage", state.columnList);
      getTableData(condition.value);

      setTimeout(() => {
        const contentHei = document.querySelector(
          ".view_content .ant-layout-content"
        ).clientHeight;
        state.tableHeight = contentHei - 235;
      }, 100);
    });

    // 可以点击新增的标识符
    sessionStorage.setItem("allowAdd", 1);

    const judgeIcon = (record) => {
      // debugger
      if (record.record.children.length) {
        if (record.expanded) {
          // 展开时箭头向下
          return createVNode(CaretDownOutlined);
        } else {
          return createVNode(CaretRightOutlined);
        }
      } else {
        return createVNode(<span></span>);
      }
    };

    const search = () => {
      state.loading = true;
      getTableData(condition.value);
    };

    const reset = () => {
      condition.value = {
        keyword: "",
      };
      state.loading = true;
      getTableData(condition.value);
    };

    const AddSubare = (record) => {
      if (Number(sessionStorage.getItem("allowAdd"))) {
        if (record === "addHighest") {
          state.data.push({
            id: "",
            name: "",
            children: [],
            parentId: null,
          });
        } else {
          state.expandedRowKeys.push(record.id);
          record.children.push({
            id: "",
            name: "",
            children: [],
            parentId: record.id,
            parent: record,
          });
        }
        state.allType.push({
          id: "",
          name: "",
          children: [],
          parentId: record === "addHighest" ? null : record.id,
        });

        edit("");
        // 不可新增标识符
        sessionStorage.setItem("allowAdd", 0);
        state.allowClick = false;
      } else {
        proxy.$message.warn("当前正在修改，请保存或取消后再操作");
      }
    };

    const edit = (id) => {
      if (Number(sessionStorage.getItem("allowAdd"))) {
        // debugger;
        editableData[id] = cloneDeep(
          state.allType.filter((item) => id === item.id)[0]
        );
        sessionStorage.setItem("allowAdd", 0);
        state.allowClick = false;
      } else {
        proxy.$message.warn("请先结束当前编辑状态");
      }
    };

    const Delete = (record) => {
      state.loading = true;
      if (record.children.length) {
        proxy.$message.error("当前品类有下级品类，无法删除");
        state.loading = false;
        return;
      }
      proxy.$api.goodsTypeId({ id: record.id },`delete` ).then((res) => {
        state.loading = true;
        getTableData(condition.value);
      });
    };

    const save = (id) => {
      // const data = {
      //   id: null,
      //   code: null,
      //   name: null,
      // };
      Object.assign(
        state.allType.filter((item) => id === item.id)[0],
        editableData[id]
      );
      if (editableData[id].name) {
        // data.id = editableData[id].id;
        // data.code = editableData[id].code;
        // data.name = editableData[id].name;
        proxy.$api
          .goodsType(editableData[id],id ? "put" : "post")
          .then((res) => {
            proxy.$message.success("操作成功");
            state.loading = true;
            getTableData(condition.value);
            // 可以点击新增的标识符
            sessionStorage.setItem("allowAdd", 1);
            state.allowClick = true;
            delete editableData[id];
          })
          .catch(() => {
            proxy.$message.error("保存失败");
          });
      } else {
        proxy.$message.warn("请输入完整信息");
      }
    };

    const cancel = (record) => {
      if (!record.id) {
        // 删掉添加的空数据
        if (!record.parentId) {
          state.data.pop();
        } else {
          record.parent.children.pop();
        }
        state.allType.pop();
      }
      delete editableData[record.id];
      // 可以点击新增的标识符
      sessionStorage.setItem("allowAdd", 1);
      state.allowClick = true;
    };

    const iconExpand = (expanded, record) => {
      if (expanded) {
        state.expandedRowKeys.push(record.id);
      } else {
        if (
          state.expandedRowKeys.length &&
          Number(sessionStorage.getItem("allowAdd"))
        ) {
          state.expandedRowKeys = state.expandedRowKeys.filter((item) => {
            return item !== record.id;
          });
        } else {
          proxy.$message.warn("当前正在修改，请保存或取消后再操作");
        }
      }
    };

    return {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 20,
      },
      ...toRefs(state),
      judgeIcon,
      editingKey: "",
      editableData,
      condition,
      AddSubare,
      edit,
      save,
      cancel,
      Delete,
      getTableData,
      search,
      reset,
      // changePage,
      iconExpand,
    };
  },
});
</script>
<style scoped lang="less">

:deep(.ant-table-tbody tr td) {
  &:first-child {
    align-items: center;
    justify-content: flex-start;
    display: flex;
    .ant-input {
      margin: 0px 5px !important;
    }
    > div {
      margin-left: 15px !important;
    }
  }
}
:deep(.ant-tabs-content) {
  height: calc(100% - 45px);
}
:deep(.ant-table-body) {
  overflow: overlay;
}
:deep(.ant-table-placeholder) {
  border-bottom: none;
}
:deep(.ant-table-content) {
  border-bottom: none !important;
}
:deep(.ant-table-cell-fix-left) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
:deep(.ant-table-selection-column) {
  width: 60px !important;
  padding: 5px !important;
}
:deep(.ant-table colgroup > col.ant-table-selection-col) {
  width: 20px;
}
</style>
