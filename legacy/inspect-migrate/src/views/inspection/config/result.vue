<template>
  <div class="ctr">
    <g-table tableCode="INSPECTION_RESULT" ref="tebleRef" :title="pageTitle" :columns="columns" :btns="btns" :search="search" :api="api" :editMode="editMode"
      :scrollX="600" @operation="operate">
    </g-table>
    <a-modal v-model:visible="visible" centered :title="tableOperateType === 'add' ? '新增巡检结果' : '编辑巡检结果'" @ok="handleOk"
      @cancel="handleCancel" :width="850">
      <a-form ref="modalForm" :model="model" :rules="rules" :labelCol="{ span: 3 }">
        <a-form-item label="名称" name="name">
          <a-input maxlength="33" v-model:value="model.name" placeholder="名称"></a-input>
        </a-form-item>
        <a-form-item label="状态" name="enable">
          <a-switch v-model:checked="model.enable" checked-children="开启" un-checked-children="关闭"></a-switch>
        </a-form-item>
        <a-form-item class="resultItemName" label="结果项">
          <a-button type="primary" @click="addResultItem" class="mb2">添加</a-button>
          <div class="resultItem" v-for="(item, index) in model.options" :key="index">
            <ResultItem :ref="(el) => setRef(el, index)" :model="item" :index="index" :length="model.options.length"
              @delete-item="deleteItem"></ResultItem>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import ResultItem from "./resultItem.vue";
import _ from "lodash";
import { usePageName } from '@ghcloud/cube-utils'
export default defineComponent({
  components: {
    ResultItem,
  },
  setup() {
    const { pageTitle } = usePageName()
    const tebleRef = ref();
    const modalForm = ref();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      editMode: "custom",
      tableOperateType: "",
      tableOperateItem: "",
      // 表头
      columns: [
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "结果项",
          dataIndex: "itemNames",
          key: "itemNames",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      // 接口
      api: {
        list: "inspectResult",
        deleteSingle: "inspectResultId",
      },
      // 操作按钮
      btns: ["add", "edit", "deleteSingle"],
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "名称",
        },
      ],
      // 对话框弹窗
      model: {
        id: "",
        code: "",
        name: "",
        enable: true,
        options: [],
      },
      rules: {
        name: [{ required: true, message: "请输入结果名称" }],
        // resultItem: [{ required: true, message: "" }],
      },
      visible: false,
    });

    const operate = (type, record) => {
      state.tableOperateType = type;
      state.tableOperateItem = record;
      if (type === "edit") {
        proxy.$api.inspectResultId(record.id, "get").then((res) => {
          if (!_.isEmpty(res)) {
            const { options, enable, name, id, code } = res;
            state.model.id = id;
            state.model.code = code;
            state.model.name = name;
            state.model.enable = enable;
            state.model.options = options.length ? options : [];
          }
        });
      }
      state.visible = true;
    };

    let itemForm = ref([]);

    const setRef = (rule, index) => {
      itemForm.value[index] = rule;
    };

    const handleOk = () => {
      // const newArr = state.model.options.map(item => item.itemValue);
      // const isRepeat = newArr.some((x, index, arr) => arr.findIndex(y => y == x) != index);
      // if (isRepeat) {
      //   proxy.$message.warn("结果项值不能重复");
      //   return 
      // }
      state.model.options.forEach((item, index) => item.itemValue = String(index));
      modalForm.value
        .validate()
        .then(() => {
          const res = state.model.options.every(
            (item) => item.itemName && item.itemValue
          );
          const errorRes = state.model.options.some((item) => item.errorFlag);
          if (errorRes) {
            state.model.id
              ? proxy.$api.inspectResultId(state.model, "put").then(() => {
                proxy.$message.success("操作成功");
                tebleRef.value.getData();
                handleCancel();
              })
              : proxy.$api.inspectResultAdd(state.model, "post").then(() => {
                proxy.$message.success("操作成功");
                tebleRef.value.getData();
                handleCancel();
              });
          } else if (!res) {
            itemForm.value.forEach((item) => {
              item.formVali();
            });
          } else if (!errorRes) {
            if (state.model.options.length) {
              proxy.$message.warn("请至少选择一项异常项");
            } else {
              proxy.$message.warn("请添加结果项");
            }
          }
        })
        .catch(() => {
          itemForm.value.forEach((item) => {
            item.formVali();
          });
        });
    };

    const handleCancel = async () => {
      await modalForm.value.resetFields();
      state.model = {
        id: "",
        code: "",
        name: "",
        enable: true,
        options: [],
      };
      state.visible = false;
    };

    const addResultItem = () => {
      state.model.options.forEach((item, index) => {
        item.itemValue = String(index)
      })
      const res = state.model.options.every(
        (item) => item.itemName && item.itemValue
      );
      if (res) {
        state.model.options.push({
          itemName: "",
          itemValue: "",
          errorFlag: false,
        });
      } else {
        itemForm.value.forEach((item) => {
          item.formVali();
        });
      }
    };

    const deleteItem = (index) => {
      state.model.options.splice(index, 1);
    };

    return {
      tebleRef,
      modalForm,
      pageTitle,
      ...toRefs(state),
      addResultItem,
      handleCancel,
      deleteItem,
      handleOk,
      operate,
      setRef,
    };
  },
});
</script>

<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
}

:deep(.resultItemName) {
  .ant-form-item-label label {
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: "*";
    }
  }
}
</style>
