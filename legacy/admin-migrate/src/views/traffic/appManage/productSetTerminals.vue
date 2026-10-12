<template lang="pug">
div.ctr(ref="ctr")
  g-layout(title="访问端配置")
    template(#content-table)
      div.terminalGrid
        div.terminalList
          div.terminalBtn.flex.justify-between
            span.title 访问端列表
            a-button(type="primary" @click="terminalOperate(false)" :disabled="!useAdmin") 新增
          ul 
            template(v-for="item in terminalList")
              li.flex.justify-between(@click="checkTerminal(item)" :class="nowClickTerminal===item.id?'clickTerminal':''" @mouseover="modifyTerminal(item)" @mouseleave="mouseLeave") 
                span.ellipsis(:title="item.name") {{item.name}}
                span.liBtn(v-if="item.id === hoverClickTerminal")
                  a-space(:size="8")
                    EditOutlined(@click.stop="terminalOperate(item)" v-if='useAdmin')
                    DeleteOutlined.deleteRow(@click.stop="deleteTerminal(item)" v-if='useAdmin')
        div.appList 
          div.tips
            span.title 应用列表
              sub.deleteRow.pl2 请先选择访问端
          a-checkbox-group(v-model:value="checked")
            a-empty(v-if="!appList")
            template(v-for="element in appList")
              div.checkboxCtr(:class="[checkedApp === element.id? 'clickApp':'','flex']" @click.stop="checkApp(element)")
                //- a-checkbox(:value="element.id" @change="(e)=> change(e,element)" :disabled="(nowClickTerminal? false:true)||!useAdmin" ) 
                div(class="APPName flex justify-between pr1")
                  span {{element.name}}
                  a(type="link" v-if="nowClickTerminal&&useAdmin" @click.stop="setPath(element)" ) 路径配置
        div.menuTable
          a-tabs(v-model:activeKey="activeKey")
            a-tab-pane(key="table" tab="菜单配置")
              div.flex.justify-between.terminalBtn
                span.title 菜单表格
                a-button(type="primary" @click="menuAdd(false,'add')" :disabled="(checkedApp? false:true)||!useAdmin") 新增
              div
                a-table(
                  :columns="columns"
                  :dataSource="menuTable"
                  :expandedRowKeys="expandedKeys"
                  :pagination="false"
                  :scroll="{x:600,y:tableHeight}"
                  :rowKey="'id'"
                  :indentSize="16"
                  @expand="iconClick")
                  template(#expandIcon="{record,expanded}")
                    <CaretRightOutlined v-if="record.children && record.children.length>0 && !expandedKeys.includes(record.id)" @click="iconClick(!expanded,record)"/>
                    <CaretDownOutlined v-if="record.children && record.children.length>0 && expandedKeys.includes(record.id)" @click="iconClick(!expanded,record)"/>
                  template(#action="{record}")
                    a-space(:size="16")
                      a-popconfirm(
                        title="是否删除当前菜单？"
                        okText="确定"
                        cancelText="取消"
                        :disabled="!useAdmin"
                        @confirm="deleteItem(record)")
                        dia
                        a.deleteRow(:disabled="!useAdmin") 删除
                      a(@click="menuAdd(record,'edit')") 编辑
                      a(@click="menuAdd(record,'addItem')" v-if="record.level === 1&&useAdmin") 新增下级
            a-tab-pane(key="card" tab="卡片")     
              div.flex.justify-between.terminalBtn
                span.title 卡片
                a-button(type="primary" @click="cardOperate('','add')" :disabled="(checkedApp? false:true)||!useAdmin") 新增
              template(v-if="nowClickTerminal&&checkedApp")   
                template(v-if="cardList?.length")  
                  a-checkbox-group(v-model:value="checkedCard")
                    div.cardCtr
                      div.itemBox(v-for="item in cardList" :key="item.code" @mouseover="mouseover(item)" @mouseleave="mouseleave")
                        div.cardTitle(v-if="item.name?.length < 7") {{item.name}}
                        popOver(v-else :content="item.name" )
                          div.cardTitle {{item.name}}
                        div(v-if="item.id === hoverCard")
                          a-space(:size="6")
                            EditOutlined(@click="cardOperate(item,'edit')" v-if='useAdmin')
                            DeleteOutlined(class="deleteRow" @click="cardOperate(item,'delete')"  v-if='useAdmin')
                template(v-else)  
                  a-empty(description="暂无卡片")  
              template(v-else)
                a-empty(v-if="!nowClickTerminal" description="请选择访问端")
                a-empty(v-else description="请选择应用")
    template(#footer-page) 
      a-button(@click="cancel") 返回 
  a-modal(v-model:visible="visible" :title="autnOpen ? '配置菜单功能' : modalTitle " centered @ok="submit" @cancel="modalCancel" :getContainer="()=> $refs.ctr" :width="autnOpen ? 920 : 520" :confirmLoading="loading") 
      a-form(ref="modalForm" :model="model" :rules="rules" v-bind="layout" v-if="!autnOpen")
        a-form-item(label="名称" name="name")
          a-input(v-model:value="model.name" placeholder="请输入名称" :maxlength="32")
        a-form-item(label="编号" name="code")
          a-input(v-model:value="model.code" placeholder="请输入编号" :disabled="!useAdmin")
        template(v-if="modalType === 'menu'")
          a-form-item(label="状态" name="enabled")  
            a-switch(v-model:checked="model.enabled" checked-children="启用" un-checked-children="禁用" :disabled="!useAdmin")    
          template(v-if="!formType")  
            a-form-item(label="路径" :name="model.parentId?'path':''")
              a-input(v-model:value="model.path" placeholder="请输入路径" :disabled="!useAdmin")
            a-form-item(label="图标" name="icon")
              a-input(v-model:value="model.icon" placeholder="请输入图标路径" :disabled="!useAdmin")
          a-form-item(label="排序" name="sort")
            a-input(v-model:value="model.sort" placeholder="请输入排序" :disabled="!useAdmin")
        a-form-item(label="备注" name="remark")  
          a-textarea(v-model:value="model.remark" placeholder="请输入备注" :maxlength="200" showCount :disabled="!useAdmin")
      a-form(ref="authorityForm" :model="authModel" :rules="authRules" v-else)  
        a-form-item(label="" Align="right" width="100%")
          div.flex.justify-between.bottomLine
            span.title 配置菜单功能
            a-button(type="primary" @click="addFunc") 新增功能
        div.authCtr(v-for="item,index in authList")
          AuthCom(:index="index" :authModel="item" :length="authList.length" :ref="el => setRef(el,index)" @deleteFunc="deleteFunc")
  a-modal(v-model:visible="pathVisi" :title="pathTitle" centered @ok="pathSave" @cancel="pathCancel" :confirmLoading="confirmLoading")        
    a-form(ref="pathFormRef" :model="pathModel" :rules="pathRules")
      a-form-item(label="路径" name="path")
        a-input(v-model:value="pathModel.path" placeholder="请输入路径" :disabled="!useAdmin")
</template>
<script lang='jsx'>
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  nextTick,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined
} from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import _ from "lodash";
import AuthCom from "./AuthCom.vue";
export default defineComponent({
  components: {
    AuthCom,
    EditOutlined,
    DeleteOutlined,
    CaretRightOutlined,
    CaretDownOutlined
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();

    const id = route.query.id;

    const ctr = ref();
    const modalForm = ref();
    const pathFormRef = ref();
    const visible = ref(false);
    const autnOpen = ref(false);

    const state = reactive({
      terminalList: [],
      appList: [],
      checked: [],
      nowClickTerminal: "",
      hoverClickTerminal: "",
      checkedApp: "",
      checkedAppCode: "",
      modalTitle: "",
      editItem: "",
      modalType: "",
      authList: [],
      AuthMenuId: "",
      cardList: [
        // {
        //   id: "1536268670509010945",
        //   code: "1",
        //   name: "卡片一",
        //   sort: 1,
        //   remark: "",
        //   enabled: true,
        //   fileVO: null,
        // },
        // {
        //   id: "1536245883018956801",
        //   code: "12",
        //   name: "卡片二",
        //   sort: 12,
        //   remark: "",
        //   enabled: true,
        //   fileVO: null,
        // },
        // {
        //   id: "1536267848664502273",
        //   code: "121231",
        //   name: "卡片三",
        //   sort: 121,
        //   remark: "",
        //   enabled: true,
        //   fileVO: null,
        // },
        // {
        //   id: "1536269740027170817",
        //   code: "121234",
        //   name: "数据统计折线图",
        //   sort: 123,
        //   remark: "",
        //   enabled: true,
        //   fileVO: null,
        // },
      ],
      fileList: [],
      activeKey: "table",
      checkedCard: "",
      formType: "",
      hoverCard: "",
    });

    const refList = ref([]);

    const setRef = (el, index) => {
      refList.value[index] = el;
    };

    const modalState = reactive({
      model: {
        id: "", //主键
        name: "", //名称
        code: "", //编号
        sort: "", //菜单排序
        parentId: "", //父级菜单id
        productId: id, //产品id
        terminalId: "", //访问端id
        applicationId: "", //应用id
        applicationCode: "", //应用code
        enabled: true, //状态
        remark: "", //备注
        icon: "", //图标
      },
      rules: {
        name: [{ required: true, message: "请输入名称" }],
        code: [{ required: true, message: "请输入编号" }],
        path: [{ required: true, message: "请输入路径" }],
        sort: [
          { required: false },
          {
            pattern: new RegExp(/^[1-9]\d*$/, "g"),
            message: "请输入正确排序(正整数)",
          },
        ],
        enabled: [{ required: true, message: "请输入状态" }],
      },
      layout: {
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 18,
        },
      },
      authModel: {},
      pathModel: {
        path: "",
        applicationId: "",
      },
      pathRules: {
        path: [{ required: true, message: "请输入应用路径" }],
      },
      loading: false,
      pathTitle: "",
      pathVisi: false,
      confirmLoading: false,
    });

    const tableState = reactive({
      columns: [
        { dataIndex: "name", title: "菜单名称", ellipsis: true },
        { dataIndex: "level", title: "菜单等级", ellipsis: true },
        { dataIndex: "path", title: "菜单路径", ellipsis: true },
        {
          dataIndex: "action",
          title: "操作",
          slots: { customRender: "action" },
          fixed: "right",
          width: 250,
        },
      ],
      menuTable: [],
      expandedKeys: [],
      tableHeight: 0,
    });

    const getTerminal = async (params) => {
      const data = await proxy.$api.getproductTerminals("get", {
        ...params,
        productId: id,
        pageSize: 1000,
        pageNum: 1,
      });
      if (data && data.records) {
        state.terminalList = data.records;
      } else {
        state.terminalList = data;
      }
    };

    const getTerminalApp = async (id) => {
      const data = await proxy.$api.terminalCheckedApp("get", id);
      if (data && data.records) {
        state.appList = data.records;
        state.checked = data.records.map((item) => item.id);
      } else {
        state.appList = data;
        state.checked = data.map((item) => item.id);
      }
    };

    const getMenu = async (params) => {
      const setParams = {
        ...params,
        pageSize: 1000,
        pageNumber: 1,
      };
      const data = await proxy.$api.getMenu("get", setParams);
      if (data && data.records) {
        tableState.menuTable = data.records;
      } else {
        tableState.menuTable = data;
      }
    };

    // const getAppList = async (params) => {
    //   const data = await proxy.$api.productApp("get", params);
    //   if (data && data.records) {
    //     state.appList = data.records;
    //   } else {
    //     state.appList = data;
    //   }
    // };

    const checkTerminal = (item) => {
      state.nowClickTerminal = item.id;
      getTerminalApp(item.id);
    };

    const checkApp = (record) => {
      if (state.checked.includes(record.id)) {
        state.checkedApp = record.id;
        state.checkedAppCode = record.code;
      }
    };

    const change = async (e, element) => {
      if (e.target.checked) {
        state.checkedApp = e.target.value;
        state.checkedAppCode = element.code;
        getMenu({
          terminalId: state.nowClickTerminal,
          applicationId: state.checkedApp,
        });
      } else {
        state.checkedApp = "";
        state.checkedAppCode = "";
      }
      if (state.nowClickTerminal) {
        // 选中
        await proxy.$api.terminalApp(e.target.checked ? "post" : "delete", {
          id: state.nowClickTerminal,
          appId: e.target.value,
        });
        proxy.$message.success("操作成功");
      } else {
        proxy.$message.warn("请选择访问端");
      }
    };

    const changeCard = async (e, item) => {
      if (e.target.checked) {
        const params = {
          ...item,
          applicationId: state.checkedApp,
          applicationCode: state.checkedAppCode,
          terminalId: state.nowClickTerminal,
        };
        // 选中
        await proxy.$api.cardAdd("post", params);
        proxy.$message.success("操作成功");
      } else {
        // 取消选中
        const params = {
          applicationId: state.checkedApp,
          terminalId: state.nowClickTerminal,
          code: item.code,
        };
        await proxy.$api.cardIdUnbind("delete", params);
        proxy.$message.success("操作成功");
      }
    };

    const modifyTerminal = (record) => {
      state.hoverClickTerminal = record.id;
    };

    const mouseLeave = () => {
      state.hoverClickTerminal = "";
    };

    const deleteTerminal = async (record) => {
      Modal.confirm({
        title: "确认",
        content: "是否删除当前访问端？",
        centered: true,
        okText: "确认",
        cancelText: "取消",
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          await proxy.$api.delProductTerminals("delete", record.id);
          proxy.$message.success("操作成功");
          getTerminal();
        },
      });
    };

    const terminalOperate = (record) => {
      state.modalType = "terminal";
      if (record) {
        state.modalTitle = "访问端修改";
        state.editItem = record;
        modalState.model = _.cloneDeep(record);
        delete modalState.model.categoryId;
      } else {
        state.modalTitle = "访问端新增";
        state.editItem = "";
      }
      visible.value = true;
    };

    const menuAdd = (record, type) => {
      state.modalType = "menu";
      if (type === "add") {
        state.modalTitle = "菜单新增";
        state.editItem = "";
      } else if (type === "edit") {
        state.modalTitle = "菜单修改";
        state.editItem = record;
        modalState.model = _.cloneDeep(record);
        delete modalState.model.categoryId;
      } else if (type === "addItem") {
        state.modalTitle = "新增二级菜单";
        state.editItem = "";
        modalState.model.parentId = record.id; //父级id
      }
      modalState.model.applicationId = state.checkedApp; //应用id
      modalState.model.terminalId = state.nowClickTerminal; //访问端id
      visible.value = true;
    };

    const cardOperate = (item, status) => {
      if (status === "delete") {
        Modal.confirm({
          title: "是否删除当前卡片？",
          centered: true,
          onOk: () => {
            modalState.loading = true;
            proxy.$api.cardId("delete", item.id).then(() => {
              proxy.$message.success("操作成功");
              getCardList();
              modalCancel();
              modalState.loading = false;
            });
          },
        });
      } else {
        // autnOpen.value = false;
        state.modalType = "menu";
        state.formType = "card";
        state.editItem = item;
        modalState.model =
          status === "edit"
            ? item
            : {
                id: "", //主键
                name: "", //名称
                code: "", //编号
                sort: "", //菜单排序
                parentId: "", //父级菜单id
                productId: id, //产品id
                terminalId: "", //访问端id
                applicationId: "", //应用id
                applicationCode: "", //应用code
                enabled: true, //状态
                remark: "", //备注
                icon: "", //图标
              };
        state.modalTitle = status === "add" ? "新增卡片" : "编辑卡片";
        visible.value = true;
        
      }
    };

    const deleteItem = async (record) => {
      await proxy.$api.menuId("delete", record.id);
      proxy.$message.success("操作成功");
      getMenu({
        terminalId: state.nowClickTerminal,
        applicationId: state.checkedApp,
      });
    };

    const cancel = () => {
      router.back(-1);
    };

    const submit = async () => {
      if (!autnOpen.value) {
        modalForm.value.validate().then(async () => {
          if (state.modalType === "terminal") {
            state.editItem
              ? await proxy.$api.terminalId("put", modalState.model)
              : await proxy.$api.addTerminal("post", modalState.model);
            proxy.$message.success("操作成功");
            getTerminal();
          } else {
            if (state.formType) {
              modalState.loading = true;
              const params = {
                ...modalState.model,
                applicationId: state.checkedApp,
                terminalId: state.nowClickTerminal,
                applicationCode: state.checkedAppCode,
              };
              delete params.productId;
              delete params.parentId;
              params.id
                ? proxy.$api
                    .cardId("put", params)
                    .then(() => {
                      proxy.$message.success("操作成功");
                      getCardList();
                      modalCancel();
                      modalState.loading = false;
                    })
                    .catch(() => {
                      modalState.loading = false;
                    })
                : proxy.$api
                    .cardAdd("post", params)
                    .then(() => {
                      proxy.$message.success("操作成功");
                      getCardList();
                      modalCancel();
                      modalState.loading = false;
                    })
                    .catch(() => {
                      modalState.loading = false;
                    });
              return;
            }
            if (!modalState.model.id) {
              await proxy.$api.addAppMenu(
                state.editItem ? "put" : "post",
                modalState.model
              );
            } else {
              await proxy.$api.menuId("put", modalState.model);
            }
            proxy.$message.success("操作成功");
            getMenu({
              terminalId: state.nowClickTerminal,
              applicationId: state.checkedApp,
            });
          }
          modalState.loading = false;
          modalCancel();
        });
      } else {
        // 循环调取接口新增或修改菜单功能
        if (state.authList.length) {
          modalState.loading = true;
          // 掉调接口
          for (let i of state.authList) {
            i.id
              ? proxy.$api.menuFuncId("put", i).finally(() => {
                  modalState.loading = false;
                })
              : proxy.$api.addMenuFunc("post", i).finally(() => {
                  modalState.loading = false;
                });
          }
          visible.value = false;
          await proxy.$message.success("操作完成");
          state.authList = await findNenuFun(state.AuthMenuId);
        } else {
          proxy.$message.warn("请先添加菜单功能");
        }
      }
    };

    const modalCancel = () => {
      modalState.model = {
        id: "", //主键
        name: "", //名称
        code: "", //编号
        sort: "", //菜单排序
        parentId: "", //父级菜单id
        productId: id, //产品id
        terminalId: "", //访问端id
        applicationId: "", //应用id
        enabled: true, //状态
        remark: "", //备注
      };
      state.authList = [];
      state.fileList = [];
      autnOpen.value = false;
      visible.value = false;
      state.formType = "";
      modalForm.value?.resetFields();
      modalForm.value?.clearValidate();
    };

    const iconClick = (expanded, record) => {
      if (expanded) {
        tableState.expandedKeys.push(record.id);
      } else {
        tableState.expandedKeys = tableState.expandedKeys.filter(
          (item) => item !== record.id
        );
      }
    };

    const findNenuFun = async (id) => {
      const data = await proxy.$api.menuFunc("get", id);
      return data;
    };

    const setAuthority = async (record) => {
      autnOpen.value = true;
      visible.value = true;
      // 查询当前菜单的功能并赋值
      state.authList = await findNenuFun(record.id);
      // state.authList.push({
      //   menuId: record.id,
      //   name: "",
      //   code: "",
      //   remark: "",
      //   enabled: true,
      // });
      state.AuthMenuId = record.id;
    };

    const addFunc = async () => {
      if (!state.authList.length) {
        state.authList.push({
          id: "",
          name: "",
          code: "",
          enabled: true,
          remark: "",
          menuId: state.AuthMenuId,
        });
        return;
      } else {
        const res = [];
        for (let i = 0; i < state.authList.length; i++) {
          const data = await refList.value[i].refValidate();
          res.push(data);
        }
        const completeRes = res.every((item) => item);
        if (completeRes) {
          state.authList.push({
            name: "",
            code: "",
            enabled: true,
            remark: "",
            menuId: state.AuthMenuId,
          });
        }
      }
    };

    const deleteFunc = (index) => {
      Modal.confirm({
        title: "删除功能",
        content: "是否删除当前功能?",
        centered: true,
        icon: createVNode(ExclamationCircleOutlined),
        onOk: async () => {
          await proxy.$api.menuFuncId("delete", state.authList[index]);
          state.authList = await findNenuFun(state.AuthMenuId);
        },
      });
    };

    const getCardList = () => {
      proxy.$api
        .cardList("get", {
          terminalId: state.nowClickTerminal,
          applicationId: state.checkedApp,
        })
        .then((res) => {
          state.cardList = res;
          // state.checkedCard = res.map((item) => item.code);
        });
    };

    const mouseover = (item) => {
      state.hoverCard = item.id;
    };

    const mouseleave = () => {
      state.hoverCard = "";
    };

    const getPath = (id) => {
      modalState.confirmLoading = true;
      proxy.$api
        .checkPath("get", { id: state.nowClickTerminal, applicationId: id })
        .then((res) => {
          modalState.pathModel =
            typeof res === "object"
              ? res
              : {
                  path: "",
                  applicationId: id,
                };
          modalState.confirmLoading = false;
        });
    };

    const setPath = async (record) => {
      modalState.pathModel.applicationId = record.id;
      modalState.pathModel.path = record.path;
      modalState.pathTitle = record.name + "路径配置";
      // 查询当前路径
      getPath(record.id);
      modalState.pathVisi = true;
    };

    const pathSave = () => {
      pathFormRef.value
        .validate()
        .then(() => {
          modalState.confirmLoading = true;
          proxy.$api
            .appPath("post", {
              ...modalState.pathModel,
              terminalId: state.nowClickTerminal,
            })
            .then(() => {
              proxy.$message.success("操作成功");
              // getAppList(id);
              // getTerminalApp(state.nowClickTerminal);
              pathCancel();
              modalState.confirmLoading = false;
            });
        })
        .catch(() => {
          modalState.confirmLoading = false;
        });
    };

    const pathCancel = async () => {
      await pathFormRef.value.resetFields();
      modalState.pathModel.applicationId = "";
      modalState.pathVisi = false;
    };

    onMounted(async () => {
      if (id) {
        getTerminal();
        // getAppList(id);
      }
      nextTick(() => {
        // 获取表格容器高度
        const tableCtrHei =
          document.getElementsByClassName("menuTable")[0].offsetHeight;
        tableState.tableHeight = tableCtrHei - 170;
      });
    });

    watch(
      () => state.checkedApp,
      (newVal, oldVal) => {
        if (newVal !== oldVal && newVal) {
          getMenu({
            terminalId: state.nowClickTerminal,
            applicationId: state.checkedApp,
          });
        }
        if (newVal) {
          getCardList();
        }
      }
    );
    watch(
      () => state.nowClickTerminal,
      (newVal, oldVal) => {
        if (newVal !== oldVal && oldVal) {
          state.checkedApp = "";
          state.checkedAppCode = "";
          tableState.menuTable = [];
        }
      }
    );
    watch(
      () => state.activeKey,
      (n, o) => {
        if (n === "card" && state.checkedApp) {
          getCardList();
        }
      }
    );

    return {
      ctr,
      visible,
      autnOpen,
      modalForm,
      pathFormRef,
      ...toRefs(state),
      ...toRefs(tableState),
      ...toRefs(modalState),
      setRef,
      cancel,
      submit,
      change,
      addFunc,
      setPath,
      menuAdd,
      pathSave,
      checkApp,
      iconClick,
      mouseover,
      mouseleave,
      deleteFunc,
      mouseLeave,
      changeCard,
      deleteItem,
      pathCancel,
      modalCancel,
      cardOperate,
      setAuthority,
      checkTerminal,
      modifyTerminal,
      deleteTerminal,
      terminalOperate,
      useAdmin:window.config.useAdmin,
    };
  },
});
</script>
<style lang="less" scoped>
.ctr {
  width: 100%;
  height: 100%;
  .content-table {
    height: 100%;
    overflow: hidden;
  }
}
.title {
  text-align: left;
  font-family: @fontMedium;
  font-size: 16px;
}
.terminalGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 3fr;
  grid-template-rows: repeat(auto-fill, 100%);
  height: 100%;
  overflow: hidden;
  > div {
    width: 100%;
    height: 100%;
  }
  .terminalBtn {
    width: 100%;
    height: 48px;
    line-height: 48px;
    align-items: center;
    padding-left: 10px;
  }
  .terminalList {
    min-width: 210px;
    height: 100%;
    ul {
      width: 100%;
      list-style: none;
      padding: 0;
      margin: 0;
      height: calc(100% - 58px);
      overflow-y: auto;
      &::-webkit-scrollbar {
        padding-top: 10px;
        width: 0.16rem;
        background: rgba(117, 180, 253, 0.2);
        box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
        border-radius: 0.08rem;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: @blue;
        box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
      }
      /*滚动条的上下两端的按钮*/
      &::-webkit-scrollbar-button {
        height: 0px;
      }
      li {
        width: 100%;
        height: 32px;
        line-height: 32px;
        padding: 0 10px;
        text-align: left;
        overflow: hidden;
        display: flex;
        cursor: pointer;
        &:hover {
          background-color: @infoHover;
          color: @blue;
        }
        &.clickTerminal {
          background-color: @bluedeep;
          color: @white;
        }
        .ellipsis {
          flex: 1;
          display: inline-block;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        .liBtn {
          display: inline-block;
          width: 35px;
        }
      }
    }
  }

  // middle
  .appList {
    min-width: 180px;
    width: 100%;
    height: 100%;

    text-align: left;
    :deep(.ant-checkbox-group) {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      &::-webkit-scrollbar {
        padding-top: 10px;
        width: 0.16rem;
        background: rgba(117, 180, 253, 0.2);
        box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
        border-radius: 0.08rem;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: @blue;
        box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
      }
      /*滚动条的上下两端的按钮*/
      &::-webkit-scrollbar-button {
        height: 0px;
      }
      .ant-checkbox-wrapper {
        padding: 0 10px;
      }
    }
    .tips {
      height: 32px;
      line-height: 32px;
      padding-left: 10px;
    }
    .checkboxCtr {
      width: 100%;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      &.clickApp {
        background-color: @blueHover;
        & label {
          color: @blue;
        }
      }
      .APPName {
        flex: 1;
        padding-left: 10px;
      }
    }
  }

  .menuTable {
    height: 100%;
    overflow: hidden;
  }
}
:deep(.ant-modal) {
  height: 540px !important;
  overflow: hidden;
  .ant-modal-content {
    height: 100%;
    overflow: hidden;
    .ant-modal-body {
      height: calc(100% - 110px);
      overflow-y: auto;
    }
  }
}
.authCtr {
  height: 56px;
  overflow: hidden;
}
:deep(.ant-tabs-line) {
  width: 100%;
}
:deep(.ant-checkbox-group) {
  width: 100%;
  height: calc(100% - 50px);
  overflow: hidden;
  .cardCtr {
    width: 100%;
    height: calc(100% - 50px);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(auto-fill, 22px);
    grid-row-gap: 8px;
    grid-column-gap: 8px;
    text-align: left;
    overflow: hidden;
    .itemBox {
      width: 100%;
      overflow: hidden;
      display: flex;
      cursor: pointer;
      .cardTitle {
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding-left: 4px;
      }
    }
  }
}
:deep(.ant-tabs-tabpane){
  overflow: auto;
}
</style>
