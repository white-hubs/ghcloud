<template lang="pug">
div(:style="{ height:'100%'}")
  g-table(
    title="合同模板"
    :api="api"
    :btns="[]"
    :columns="columns"
    :search="search"
    :slots="slots"
    @slot="onToggle"
    ref="tableRef"
  )
    template(v-slot:btn='item')
      a-button(type="link" @click="previewContract(item.record)") 预览
      a-button(type="link" @click="AddSubare(item.record)") 编辑
      a-popconfirm(title="是否确定删除?" @confirm="deleteRecord(item.record)")
        a.deleteRow 删除
    template(#header-btns)
      a-button(type="primary" @click="AddSubare('')") 新增
  a-modal(v-model:visible.sync="modalVisible" width="600px" :title="modalTitle" @ok="submit")
    a-form( :model="formState.form" :rules="formState.rules" ref="formRef" class="modal-form" :label-col="{span: 4}" :wrapper-col="{span: 22}" v-if="modalVisible")
      a-form-item(label="模板名称" name="name")
        a-input(v-model:value="formState.form.name" placeholder="请输入合同模板名称")     
      a-form-item(label="合同类型" name="typeId")
        a-tree-select(v-model:value="formState.form.typeId" placeholder="请选择合同类型" :tree-data="typeSource")     
      a-form-item(label="启用状态" name="enabled")
        <a-switch v-model:checked="formState.form.enabled" checked-children="启用" un-checked-children="禁用"></a-switch>     
      a-form-item(label="模板附件" name="fileId")
        g-upload(@changeFile="handleChange" :file="fileList" accept=".docx" listType="text"  businessKey="contract")
  a-modal(
        v-model:visible="fullModal.visible"
            title="文件预览"
            width="100%"
            wrapClassName="full-modal"
            okText="打印"
            @ok="handleOk"
    )
        iframe(:src="'/office-preview/index.html?file=' + fullModal.src"
            ref="iframeRef")    
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
} from "vue";
import { CaretDownOutlined } from "@ant-design/icons-vue";
import { timeFormat } from "@/utils/common";
import { replaceObjectKeys } from "@pansy/utils";
export default defineComponent({
  setup() {
    const tableRef = ref();
    const { proxy } = getCurrentInstance();
    const editableData = reactive({});
    const modalVisible = ref(false);
    const iframeRef = ref();
    const formRef = ref();
    const formState = reactive({
      form: {
        name: "",
        typeId: null,
        id: null,
        enabled: true,
        fileId: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入合同模板名称",
            trigger: "blur",
          },
        ],
        typeId: [
          {
            required: true,
            message: "请选择合同类型",
            trigger: "change",
          },
        ],
        fileId: [
          {
            required: true,
            message: "请上传.docx文件",
            trigger: "change",
          },
        ],
      },
    });
    const state = reactive({
      api: {
        list: "getContractTmps",
      },
      columns: [
        {
          dataIndex: "name",
          key: "name",
          title: "合同模板名称",
          slots: {
            customRender: "name",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "typeName",
          key: "typeName",
          title: "合同类型",
          slots: {
            customRender: "typeName",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "enabled",
          key: "enabled",
          title: "启用状态",
          slots: {
            customRender: "enabled",
          },
        },
        {
          dataIndex: "createTime",
          key: "createTime",
          title: "创建时间",
          slots: {
            customRender: "createTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={timeFormat(text, true)}>
                {timeFormat(text, true)}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "updateTime",
          key: "updateTime",
          title: "更新时间",
          slots: {
            customRender: "updateTime",
          },
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={timeFormat(text, true)}>
                {timeFormat(text, true)}
              </PopOver>
            );
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
      slots: [
        {
          slot: "enabled",
          component: "a-switch",
        },
      ],
      search: [
        {
          label: "启用状态",
          value: "enabled",
          component: "a-select",
          options: [
            { label: "禁用", value: false },
            { label: "启用", value: true },
          ],
          placeholder: "请选择",
        },
        { label: "", value: "keyword", placeholder: "合同模板名称" },
      ],
      dataSource: [],
      typeSource: [],
      icon: createVNode(CaretDownOutlined),
      loading: true,
      panination: null,
      modalTitle: "新增合同模板",
      fullModal: {
        visible: false,
        src: null,
      },
    });
    const condition = ref({
      keyword: null,
      enabled: null,
      pageNumber: 1,
      pageSize: 10,
    });
    const fileList = ref([]);
    // 默认显示一页5条
    state.panination = {
      total: 0,
      position: "bottom",
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["1", "5", "10", "20", "50"],
      // showTotal: (total) => `共${total}条数据`,
      showTotal: () => `共${state.dataSource.length}条数据`,
    };

    const getType = () => {
      proxy.$api.getContractTypes().then((res) => {
        let data = res.map((item) => {
          return Object.assign(item, {
            children: item.contractTypeVOS,
            id: Math.random(1000),
            disabled: true,
          });
        });
        state.typeSource = replaceObjectKeys(data, {
          disabled: "disabled",
          children: "children",
          id: "value",
          name: "title",
        });
      });
    };
    getType();

    const AddSubare = (record) => {
      fileList.value = [];
      if (record) {
        formState.form = {
          name: record.name,
          typeId: record.typeId,
          id: record.id,
          enabled: record.enabled,
          fileId: record.fileVOS ? record.fileVOS.id : null,
        };
        if (record.fileVOS) {
          fileList.value = [
            {
              uid: record.fileVOS.id,
              name: record.fileVOS.name,
              status: "done",
              url: record.fileVOS.path,
              thumbUrl: record.fileVOS.path,
              response: {
                data: { id: record.fileVOS.id },
              },
            },
          ];
        }

        state.modalTitle = "编辑合同模板";
      } else {
        formState.form = {
          name: "",
          typeId: null,
          id: null,
          enabled: true,
          fileId: "",
        };
        state.modalTitle = "新增合同模板";
      }
      modalVisible.value = true;
    };

    // 切换状态
    const onToggle = (slot, record) => {
      if (slot === "enabled") {
        proxy.$api.putContractTmp( record).then(() => {
          proxy.$message.success("操作成功");
        });
      }
    };

    //选择文件
    const handleChange = (data) => {
      if (data[0]) {
        formState.form.fileId = data[0];
      } else {
        formState.form.fileId = null;
      }
    };

    const previewContract = (res) => {
      if (res.fileVOS && res.fileVOS.path) {
        state.fullModal.src = res.fileVOS.path;
        state.fullModal.visible = true;
      } else {
        proxy.$message.warn("当前模板未上传附件");
      }
    };
    const handleOk = () => {
      let prnHtml =
        iframeRef.value.contentWindow.document.getElementById("top").innerHTML; //需要打印的内容
      const newWin = window.open(); // 新打开一个空窗口
      newWin.document.body.innerHTML = prnHtml; //把需要打印的内容插入新窗口
      newWin.document.close(); //关闭文档输入流（window.close()和document.close()的区别）
      newWin.focus();
      setTimeout(() => {
        //定时器等待，JS单线程，异步执行此行代码
        newWin.print();
        newWin.close(); //打印完成或取消，关闭新窗口
      }, 300);
    };
    //保存数据
    const submit = () => {
      const data = {
        id: formState.form.id, //模板
        name: formState.form.name, //模板名称
        typeId: formState.form.typeId, //合同类型id
        enabled: formState.form.enabled, //是否启用
        fileId: formState.form.fileId, //模板附件id
      };
      formRef.value.validate().then((res) => {
        if (formState.form.id) {
          proxy.$api.putContractTmpId(data,"put" ).then(() => {
            modalVisible.value = false;
            proxy.$message.success("操作成功");
            tableRef.value.getData();
          });
        } else {
          proxy.$api.postContractTmp(data,"post" ).then(() => {
            modalVisible.value = false;
            proxy.$message.success("操作成功");
            tableRef.value.getData();
          });
        }
      });
    };
    const deleteRecord = (record) => {
      proxy.$api.deleteContractTmp( record).then(() => {
        tableRef.value.getData();
        proxy.$message.success("操作成功");
      });
    };
    return {
      ...toRefs(state),
      editingKey: "",
      editableData,
      iframeRef,
      formRef,
      condition,
      formState,
      modalVisible,
      fileList,
      AddSubare,
      getType,
      onToggle,
      handleChange,
      previewContract,
      handleOk,
      submit,
      tableRef,
      deleteRecord,
    };
  },
});
</script>
<style scoped lang="less">
.buttonGroup {
  button {
    margin-left: 10px;
  }
}

</style>
<style lang="less">
.full-modal {
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    flex: 1;
  }
}
</style>
