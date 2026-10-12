<template>
  <div class="sub">
    <div class="add-row">
      <!-- <span>消息通知：</span> -->
      <a-button type="primary" @click="addSet" v-if="type !== 'detail'">
        添加
        <PlusOutlined />
      </a-button>
    </div>
    <div class="config-row flex-between" v-for="(item, index) in setList" :key="index">
      <div class="left">
        <div class="config-box">
          <div class="box-header">
            <div class="add-row">
              <span>通知方式：</span>
            </div>
            <div class="config-row flex-between">
              <div class="left">
                <g-select showArrow mode="multiple" :options="options" v-model:value="item.way"
                  :style="{ width: '200px' }" :disabled="type === 'detail'" placeholder="请选择通知方式"></g-select>
              </div>
            </div>
          </div>
          <div class="box-center">
            <div class="add-row">
              <span>通知人员：</span>
            </div>
            <div class="config-row flex-between">
              <div class="left">
                <a-space :size="16">
                  <g-select v-model:value="item.personnelType" showArrow :style="{ width: '200px' }"
                    :options="personnelType" :field="{ value: 'value',label: 'label'}" placeholder="请选择通知职位"
                    :disabled="type === 'detail'"></g-select>
                    <a-tag v-for="item in item[typeParams[item.personnelType]]">{{ item.name }}</a-tag>
                  <a-button type="primary" @click="openPersonnel(item,index)" v-if="type !== 'detail'">添加</a-button>
                </a-space>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right" v-if="type !== 'detail'">
        <a-popconfirm title="删除当前配置?" @confirm="deleteItem(index)">
          <a-button type="link" danger>删除</a-button>
        </a-popconfirm>
      </div>
    </div>
    <personnelModal :url="personnelModal.url" :visible="personnelModal.visible" :title="personnelModal.title"
      :search="personnelModal.search" :columns="personnelModal.columns" :activeId="personnelModal.activeId"
      @close="close"></personnelModal>
  </div>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs, watch } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import personnelModal from "./personnelModal.vue";
export default defineComponent({
  components: {
    PlusOutlined,
    personnelModal
  },
  props: {
    actionConfig: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },

  setup(props) {
    const route = useRoute();
    const { type } = route.query;
    const personnelModal = reactive({
      url: 'deptList',
      visible: false,
      title: '选择部门',
      search: [{
        label: '名称',
        value: 'keyword'
      }],
      columns: [
        {
          title: '部门名称',
          dataIndex: 'name',
          key: 'name',
        }
      ],
      activeId: [],
      index:0
    })
    const typeParams = {
      department:'deptIds',
      position:'postIds',
      role:'roleIds',
      user:'userIds',
    }
    const personnelType = [
      {
        label: '部门',
        value: 'department'
      },
      {
        label: '职位',
        value: 'position'
      },
      {
        label: '角色',
        value: 'role'
      },
      {
        label: '用户',
        value: 'user'
      },
    ]
    const state = reactive({
      setList: [],
      options: [
        { name: "站内信消息", id: "CHANNEL_SITE" },
        { name: "app消息", id: "CHANNEL_APP" },
        // { name: "短信消息", id: "CHANNEL_SMS" },
      ],
    });

    const addSet = () => {
      state.setList.push({
        way: [],
        personnelType: 'department',
        deptIds: [],
        postIds: [],
        roleIds: [],
        userIds: [],
      });
    };

    const deleteItem = (index) => {
      state.setList.splice(index, 1);
    };
    const openPersonnel = (item,index) => {
      personnelModal.index = index
      if (item.personnelType === 'department') {
        personnelModal.url = 'deptList'
        personnelModal.title = '选择部门'
        personnelModal.activeId = item.deptIds.map(e=>e.id)
        personnelModal.search[0].label = '部门名称'
        personnelModal.search[0].value = 'name'
        personnelModal.columns = [
          {
            title: '部门名称',
            dataIndex: 'name',
            key: 'name',
          }
        ]
      }else if (item.personnelType === 'position') {
        personnelModal.url = 'position'
        personnelModal.title = '选择职位'
        personnelModal.activeId = item.postIds.map(e=>e.id)
        personnelModal.search[0].label = '职位名称'
        personnelModal.search[0].value = 'name'
        personnelModal.columns = [
          {
            title: '职位名称',
            dataIndex: 'name',
            key: 'name',
          }
        ]
      }else if (item.personnelType === 'role') {
        personnelModal.url = 'getRoleList'
        personnelModal.title = '选择角色'
        personnelModal.activeId = item.roleIds.map(e=>e.id)
        personnelModal.search[0].label = '角色名称'
        personnelModal.search[0].value = 'keyword'
        personnelModal.columns = [
          {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
          }
        ]
      }else if (item.personnelType === 'user') {
        personnelModal.url = 'tenantUsers'
        personnelModal.title = '选择用户'
        personnelModal.activeId = item.roleIds.map(e=>e.id)
        personnelModal.search[0].label = '用户名称'
        personnelModal.search[0].value = 'keyword'
        personnelModal.columns = [
          {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: '联系电话',
            dataIndex: 'mobile',
            key: 'mobile',
          },
          {
            title: '部门',
            dataIndex: 'depName',
            key: 'depName',
          },
        ]
      }
      personnelModal.visible = true
    }
    const close = (selected, selectedRowKeys) => {
      state.setList[personnelModal.index].deptIds = []
      state.setList[personnelModal.index].postIds = []
      state.setList[personnelModal.index].roleIds = []
      state.setList[personnelModal.index].userIds = []
      if (selected) {
        if (state.setList[personnelModal.index].personnelType === 'department') {
          state.setList[personnelModal.index].deptIds = selected
        }else if (state.setList[personnelModal.index].personnelType === 'position') {
          state.setList[personnelModal.index].postIds = selected
        }else if (state.setList[personnelModal.index].personnelType === 'role') {
          state.setList[personnelModal.index].roleIds = selected
        }else if (state.setList[personnelModal.index].personnelType === 'user') {
          state.setList[personnelModal.index].userIds = selected
        }
      }
      personnelModal.visible = false
    }
    watch(
      () => props.actionConfig,
      (value) => {
        state.setList = value.map(e=>{
          if (e.deptIds.length) {
            e.personnelType = 'department'
          }else if (e.postIds.length) {
            e.personnelType = 'position'
          }else if (e.roleIds.length) {
            e.personnelType = 'role'
          }else if (e.userIds.length) {
            e.personnelType = 'user'
          }
          return e
        })
      },
      { deep: true }
    );
    return {
      type,
      ...toRefs(state),
      deleteItem,
      addSet,
      openPersonnel,
      close,
      personnelType,
      personnelModal,
      typeParams
    };
  },
});
</script>

<style lang="less" scoped>
.sub {
  >.config-row {
    // margin-left: 64px;
  }

  .add-row,
  .config-row {
    margin-bottom: 10px;

    // border-bottom: solid 1px #aaa;
    .left {
      flex: 1;
    }
  }

  .config-box {
    border: 1px solid #aaa;
    padding: 0 16px;

    .box-header {
      padding: 8px 16px;
      border-bottom: 1px solid #aaa;
    }

    .box-center {
      padding: 8px 16px;
    }
  }
}
</style>
