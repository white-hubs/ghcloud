<template lang="pug">
g-layout(title="合同类型")
  template(#content-search)
    a-form.p2(layout="inline")
      a-form-item 
        a-input( v-model:value="condition.keyword" placeholder="合同类型名称" :style="{width: '200px'}")
      a-form-item 
        a-space(:size="16")  
          a-button(type="primary" @click="search") 查询
          //- a-button( @click="reset") 重置
  template(#content-table)
    a-table(
      :columns="columns"
      :data-source="dataSource"
      size="middle"
      :pagination="false"
      :rowKey="(record) => record.id"
      :expandedRowKeys="expandedRowKeys"
      :scroll="{ y: tableHeight}"
      @expand="iconExpand"
      :loading="loading")
      template(#expandIcon="props")
        CaretUpOutlined(v-if="props.record.children&&expandedRowKeys.includes(props.record.id)" @click="iconExpand(!props.expanded,props.record)")
        CaretDownOutlined(v-else-if="props.record.children&&!expandedRowKeys.includes(props.record.id)" @click="iconExpand(!props.expanded,props.record)")
      template(#name="{ text, record }")
        div
          a-input(
            v-if="editableData[record.id]"
            v-model:value.trim="editableData[record.id]['name']"
            style="margin: -5px 0"
            placeholder="请输入类型名称")
          template(v-else) 
            div.rowText {{ text }}
      template(#enabled="{ text, record }")
        div(v-if="record.notEdit") --
        div(v-else)
          <a-switch v-model:checked="record.enabled"  key='disabled' @change="changeStatus(record)" checked-children="启用" un-checked-children="禁用"/>

      template( #action="{ record }")
        div(v-if="record.notEdit")
          a( @click.stop="addRecord(record)") 新增下级
        div(class="editable-row-operations" v-else)
          span( v-if="editableData[record.id]")
            a-space(:size="16")
              a( @click.stop="saveRecord(record)") 保存
              a-popconfirm(
                title="是否取消修改"
                cancelText="取消"
                okText="确定"
                @confirm.stop="cancelRecord(record)")
                a( @click.stop="") 取消
          span(v-else)
            a-space(:size="16")
              //-  v-if="!record.level === '3'"
              a(@click.stop="editRecord(record)") 编辑
              a-popconfirm(
                  title="是否删除当前选中？"
                  cancelText="取消"
                  okText="确定"
                  @confirm.stop="DeleteRecord(record)")
                a.deleteRow(@click.stop="") 删除
       
</template>
<script lang="jsx">
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons-vue";
import { cloneDeep } from "lodash-es";
import { defineComponent, reactive, toRefs, getCurrentInstance, ref, onMounted } from "vue";

import { queryParameter } from "@ghcloud/cube-utils";
export default defineComponent({
  components: {
    CaretDownOutlined,
    CaretUpOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const editableData = reactive({});
    const state = reactive({
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "类型名称",
          slots: {
            customRender: "name",
          },
          // width: 650,
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "类型状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          slots: {
            customRender: "action",
          },
          width: 200,
          fixed: "right",
        },
      ],
      dataSource: [],
      loading: true,
      tableHeight: 530,
      expandedRowKeys: [],
    });
    const cacheQuery = queryParameter.getQuery() || {};
    const condition = ref({
      keyword: cacheQuery.keyword || "",
    });

    const syncKeywordCache = () => {
      const keyword = condition.value.keyword;
      queryParameter.setAddressQuery(keyword ? { keyword } : {});
    };

    //获取列表数据
    const getTableData = (data) => {
      proxy.$api.getContractTypes(data).then((res) => {
        state.dataSource = res.map((item) => {
          return Object.assign(item, {
            children: item.contractTypeVOS,
            id: Math.random(1000),
            enabled: true,
            notEdit: true,
          });
        });
        state.loading = false;
      });
    };

    onMounted(() => {
      getTableData(condition.value);
    });

    const iconDerection = (record) => {
      if (state.expandedRowKeys.includes(record.id)) {
        return "icon-xiangxia";
      } else {
        return "iocon-xiangyou";
      }
    };

    const search = () => {
      state.loading = true;
      syncKeywordCache();
      getTableData(condition.value);
    };
    const reset = () => {
      condition.value = {
        keyword: "",
      };
      syncKeywordCache();
      getTableData(condition.value);
    };
    //新增数据
    const addRecord = (record) => {
      iconExpand(true, record);
      state.dataSource.forEach((item) => {
        if (item.type === record.type) {
          const add = {
            id: "add" + Math.random(),
            name: "",
            enabled: true,
            type: record.type,
          };
          item.children.push(add);
          editableData[add.id] = cloneDeep(add);
        }
      });
    };
    //点击编辑
    const editRecord = (record) => {
      editableData[record.id] = cloneDeep(record);
    };
    //删除
    const DeleteRecord = (record) => {
      state.loading = true;
      proxy.$api.deleteContractType(record).then(() => {
        state.loading = true;
        getTableData(condition.value);
        proxy.$message.success("操作成功");
      });
    };
    //保存编辑
    const saveRecord = (record) => {
      editableData[record.id].enabled = record.enabled;
      state.dataSource.forEach((item) => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((c) => {
            if (record.id === c.id) {
              c = Object.assign(c, editableData[record.id]);
            }
          });
        }
      });
      if (!editableData[record.id].name) {
        proxy.$message.warn("请输入类型名称");
        return;
      }
      if (record.id.indexOf("add") > -1) {
        proxy.$api
          .postContractType({
            name: editableData[record.id].name,
            type: editableData[record.id].type,
            enabled: editableData[record.id].enabled,
          })
          .then((res) => {
            delete editableData[record.id];
            proxy.$message.success("操作成功");
            getTableData(condition.value);
          });
      } else {
        proxy.$api.putContractType(editableData[record.id]).then((res) => {
          delete editableData[record.id];
          proxy.$message.success("操作成功");
          getTableData(condition.value);
        });
      }
    };
    //取消编辑
    const cancelRecord = (record) => {
      if (record.id.indexOf("add") > -1) {
        state.dataSource.forEach((item) => {
          if (record.type === item.type) {
            item.children.pop();
          }
        });
      }
      delete editableData[record.id];
    };

    const iconExpand = (expanded, record) => {
      if (expanded) {
        state.expandedRowKeys.push(record.id);
      } else {
        if (state.expandedRowKeys.length) {
          state.expandedRowKeys = state.expandedRowKeys.filter((item) => {
            return item !== record.id;
          });
        }
      }
    };
    const changeStatus = (record) => {
      if (record.id.indexOf("add") === -1) {
        proxy.$api.putContractType(record).then((res) => {
          proxy.$message.success("操作成功");
          getTableData(condition.value);
        });
      }
    };
    return {
      ...toRefs(state),
      editingKey: "",
      editableData,
      condition,
      addRecord,
      editRecord,
      saveRecord,
      cancelRecord,
      DeleteRecord,
      getTableData,
      search,
      reset,
      iconExpand,
      iconDerection,
      changeStatus,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-table-tbody tr td) {
  &:first-child {
    /* display: grid; */
    /* grid-template-columns: 14px auto; */
    align-items: center;
    justify-content: flex-start;
    display: flex;
    .ant-input {
      margin: -5px 5px !important;
    }
    > div {
      margin-left: 15px !important;
    }
  }
}
</style>
