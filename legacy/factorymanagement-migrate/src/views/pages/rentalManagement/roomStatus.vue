<template>
  <g-layout-no-footer :title="'房间状态'">
    <template #content-left>
      <div class="leftTitle flex-between">
        <gVerticalLine title="楼层区域"></gVerticalLine>
        <a-button type="primary" @click="openModal">新建</a-button>
      </div>
      <div class="ulCtr mt1">
        <ul v-if="visionList.length">
          <li v-for="ele in visionList" :key="ele.id" :class="[
                checkItemId === ele.id ? 'hover' : '',
                'flex-between',
                'p1',
              ]" @click.stop="checkItem(ele)">
            <PopOver :content="ele.monitorName" position="topLeft">
              <div class="liName">{{ ele.monitorName }}</div>
            </PopOver>
            <div class="liBtn">
              <EditOutlined @click.stop="openModal(ele)"></EditOutlined>
              <DeleteOutlined class="ml1" @click.stop="deleteItem(ele)" :style="{ color: 'red' }"></DeleteOutlined>
            </div>
          </li>
        </ul>
        <a-empty v-else></a-empty>
      </div>
    </template>
    <template #content-table>
      <div class="pl2 ifrCtr">
        <iframe name="iframe" width="100%" height="100%" frameborder="0" scrolling="auto" :src="url"></iframe>
      </div>
    </template>
    <a-modal v-model:visible="visible" centered title="新增监控信息" @ok="save" @cancel="cancel">
      <a-form ref="modalForm" :model="model" :rules="modalRules">
        <a-form-item label="监控信息" name="monitorName">
          <a-input v-model:value="model.monitorName" placeholder="请输入监控信息"></a-input>
        </a-form-item>
        <a-form-item label="组态链接" name="monitorUrl">
          <a-input v-model:value="model.monitorUrl" placeholder="请输入组态链接"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </g-layout-no-footer>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
  computed,
} from "vue";

import { useRouter, useRoute } from "vue-router";
import { useStore } from 'vuex'
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import _ from "lodash";

export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const modalForm = ref();
    const store = useStore();
    const state = reactive({
      pathName: "",
      visible: false,
      model: {
        id: "",
        monitorName: "",
        monitorUrl: "",
        description: "",
        categoryCode: "",
      },
      modalRules: {
        monitorName: [{ required: true, message: "请输入监控信息" }],
        monitorUrl: [{ required: true, message: "请输入组态链接" }],
      },
      visionList: [],
      url: null,
      checkItemId: "",
    });

    const title = ref();
    const api = ref();

    const getVisionList = () => {
      proxy.$api.getConfiguration({ categoryCode: state.pathName, applicationCode: "FACTORYMANAGEMENT" }).then(res => {
        state.visionList = res;
      });
    };

    const openModal = record => {
      if (record) {
        state.model = _.cloneDeep(record);
      }
      state.visible = true;
    };

    const goBack = () => {
      history.go(-1);
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        state.model.categoryCode = state.pathName;
        const params={
          applicationCode: __ENV__.applicationCode,
          monitorName: state.model.monitorName,
          monitorUrl: state.model.monitorUrl,
        }
        state.model.id
          ? proxy.$api.editConfiguration(state.model.id,params, "put").then(() => {
            proxy.$message.success("操作成功");
            getVisionList();
            cancel();
          })
          : proxy.$api.addConfiguration(params, "post").then(() => {
            proxy.$message.success("操作成功");
            getVisionList();
            cancel();
          });
      });
    };

    const cancel = async () => {
      state.model.description = "";
      await modalForm.value.resetFields();
      state.visible = false;
    };

    onMounted(async () => {
      state.pathName = route.query.pageName?.replace(":", "");
      getVisionList();
    });

    const deleteItem = record => {
      Modal.confirm({
        title: "是否删除当前数据",
        centered: true,
        icon: () => createVNode(ExclamationCircleOutlined),
        ok: () => {
          proxy.$api.addConfiguration(record.id, "delete").then(() => {
            proxy.$message.success("操作成功");
            getVisionList();
          });
        },
      });
    };

    const checkItem = record => {
      state.checkItemId = record.id;
      state.url = record.monitorUrl;
    };

    return {
      api,
      title,
      modalForm,
      ...toRefs(state),
      deleteItem,
      openModal,
      checkItem,
      goBack,
      cancel,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

:deep(.content-left) {
  width: 200px;

  .ulCtr {
    width: 100%;
    height: calc(100% - 40px);
    overflow-y: auto;
  }
}

.ifrCtr {
  width: 100%;
  height: 100%;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    width: 100%;
    cursor: pointer;

    .liName {
      flex: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .liBtn {
      text-align: right;
      width: 45px;
    }
  }
}

.hover {
  background-color: #000;
  color: #fff;
}
</style>
