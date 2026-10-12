<template>
  <g-layout-no-footer :title="pageTitle">
    <template #content-left>
      <div class="list-content-container flex-column">
        <div class="container-header flex-between">
          <g-vertical-line title="监测"></g-vertical-line>
          <a-button type="primary" @click="addData">新增</a-button>
        </div>
        <div class="container-content">
          <ul>
            <li
              class="flex-between"
              :class="{ 'primary-color': currentItem?.id == item.id }"
              v-for="item in configurationList"
              :key="item.id"
              @click.prevent="changeList(item)"
            >
              <div
                :title="item.monitorName"
                class="name"
                style="
                  width: 200px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                "
              >
                {{ item.monitorName }}
              </div>
              <span>
                <FormOutlined @click.stop="editData(item)" />
                <a-popconfirm
                  title="是否确认删除该控制"
                  @confirm.stop="deleteData(item)"
                >
                  <DeleteOutlined style="color: #ff4d4f; margin-left: 10px" />
                </a-popconfirm>
              </span>
            </li>
            <a-empty v-if="!configurationList.length" />
          </ul>
        </div>
      </div>
    </template>
    <template #content-table>
      <div class="right-container">
        <iframe
          width="100%"
          height="100%"
          :src="iframeUrl"
          frameborder="0"
          v-if="iframeUrl !== null"
        ></iframe>
        <div v-else class="empty">
          <img :src="img.errorPng" alt="" />
          <div>当前二维组态链接错误请检查</div>
        </div>
      </div>
    </template>
    <a-modal
      v-model:visible="visible"
      :title="modalTitle"
      @ok="handleOk"
      @cancel="close"
    >
      <a-form ref="formRef" :model="form" :rules="rules">
        <a-form-item label="监测名称" name="monitorName">
          <a-input
            v-model:value="form.monitorName"
            placeholder="请输入监测信息名称"
          ></a-input>
        </a-form-item>
        <a-form-item label="组态连接" name="monitorUrl">
          <a-input
            v-model:value="form.monitorUrl"
            placeholder="请输入二维组态链接地址"
          ></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </g-layout-no-footer>
  <a-modal
    v-model:visible="visibleModle"
    title="设备详情"
    width="70%"
    @ok="visibleModle = false"
  >
    <a-row>
      <a-col :span="4">
        <div>
          <a-image
            v-if="info.images.length > 0"
            :width="200"
            :height="80"
            :src="info.images[0].path"
          ></a-image>
          <a-image
            v-else
            :width="200"
            :height="80"
            :src="img.devicePng"
          ></a-image>
        </div>
      </a-col>

      <a-col :span="20">
        <deviceBasicData
          v-if="visibleModle"
          show
          ref="deviceBasicData"
          :deviceId="DeviceInfo"
          @detail="detail"
        ></deviceBasicData>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script lang="jsx">
import { applicationCodeGroud } from "@/utils/enumerate.js";
import { DeleteOutlined, FormOutlined } from "@ant-design/icons-vue";
import { cloneDeep } from "lodash";
import deviceBasicData from "../components/deviceBasicData.vue";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRefs,
} from "vue";
import { useStore } from "vuex";
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const errorPng = `${GEM}/error.png`
const devicePng = `${GEM}/device.png`
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { FormOutlined, DeleteOutlined, deviceBasicData },
  setup() {
    const { proxy } = getCurrentInstance();
    const formRef = ref(null);
    const store = useStore();
    const applicationCode = ref(null);
    const messageData = ref(null);
    const DeviceInfo = ref({});
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      title: "",
      visibleModle: false,
      iframeUrl: "",
      configurationList: [],
      currentItem: null,
      modalTitle: "",
      visible: false,
      form: {
        id: "",
        applicationCode: "",
        monitorName: "",
        monitorUrl: "",
      },
      rules: {
        monitorName: [
          {
            required: true,
            transform: value => (value ? value.replaceAll(" ", "") : ""),
            message: "请输入监测名称",
            trigger: "blur",
          },
          {
            required: true,
            max: 50,
            transform: value => (value ? value.replaceAll(" ", "") : ""),
            message: "最多输入50个字符",
            trigger: "blur",
          },
        ],
        monitorUrl: [
          {
            required: true,
            transform: value => (value ? value.replaceAll(" ", "") : ""),
            message: "请输入链接地址",
            trigger: "blur",
          },
          {
            required: true,
            max: 100,
            transform: value => (value ? value.replaceAll(" ", "") : ""),
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ],
      },
    });
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
      state.form.applicationCode = applicationCode.value;
      state.title = applicationCodeGroud[applicationCode.value];
    });
    const info = ref({ images: [] });
    const detail = data => {
      info.value = data;
    };
    window.addEventListener("message", data => {
      if (data.data.deviced) {
        // messageData.value = data.data;
        DeviceInfo.value = data.data.deviced;
        state.visibleModle = true;
        // proxy.$api
        //   .getDeviceInfo({ deviceId: data.data.deviced })
        //   .then(res => {
        //   });
      }
    });
    onMounted(() => {
      getConfiguration();
    });
    const getDeviceId = () => {};
    const getConfiguration = () => {
      proxy.$api
        .getConfiguration({ applicationCode: applicationCode.value })
        .then(res => {
          state.configurationList = res;
        });
    };
    const changeList = item => {
      if (state.currentItem && item.id === state.currentItem.id) {
        return;
      } else {
        state.currentItem = cloneDeep(item);
        if (state.currentItem.monitorUrl.includes("http")) {
          state.iframeUrl = state.currentItem.monitorUrl;
        } else {
          state.iframeUrl = null;
        }
      }
    };
    const addData = () => {
      state.visible = true;
      state.modalTitle = "新增监测信息";
    };
    const editData = item => {
      state.form = cloneDeep(item);
      state.modalTitle = "编辑监测信息";
      state.visible = true;
    };

    const deleteData = item => {
      proxy.$api.deleteConfiguration(item.id).then(res => {
        if (state.currentItem.id == item.id) {
          state.currentItem = null;
          state.iframeUrl = "";
        }
        proxy.$message.success("删除成功!");
        getConfiguration();
      });
    };
    const handleOk = () => {
      formRef.value.validate().then(() => {
        if (!state.form.id) {
          proxy.$api.addConfiguration(state.form).then(res => {
            proxy.$message.success("新增成功");
            getConfiguration();
            close();
          });
        } else {
          proxy.$api.editConfiguration(state.form).then(res => {
            proxy.$message.success("编辑成功");
            getConfiguration();
            close();
          });
        }
      });
    };
    const close = () => {
      state.form = {
        id: "",
        applicationCode: applicationCode.value,
        monitorName: "",
        monitorUrl: "",
      };
      state.visible = false;
      formRef.value.resetFields();
    };
    return {
      info,
      detail,
      DeviceInfo,
      messageData,
      ...toRefs(state),
      formRef,
      handleOk,
      close,
      addData,
      editData,
      deleteData,
      changeList,
      img: {
        errorPng,
        devicePng,
      },
    };
  },
});
</script>

<style lang="less" scoped>
.list-content-container {
  width: 320px;
  height: 100%;
  overflow: hidden;
  margin-right: 16px;
  .container-header {
    padding: 0 10px;
    height: 50px;
    border-bottom: 1px solid #f3f3f3;
  }
  .container-content {
    flex: 1;
    overflow: auto;
    border-right: solid 1px #f3f3f3;
  }

  ul {
    list-style-type: none;
    padding: 8px 0;
    li {
      padding: 0 16px;
      height: 36px;
      cursor: pointer;
      &:hover {
        background: #f0f2f5;
      }
    }
  }
}
.right-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    font-size: 20px;
  }
}
</style>
