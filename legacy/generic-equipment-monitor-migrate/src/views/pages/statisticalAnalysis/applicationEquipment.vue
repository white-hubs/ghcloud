<template>
  <a-spin :spinning="spinning">
    <g-table ref="tableRef" :title="pageTitle" :beforeGet="passingParam" :api="api" :btns="btns" :search="search"
      :columns="columns" :rowSelection="true" :applicationCode="applicationCode" 
      tableCode="import-device-list" scrollX="0">
      <template #header-btns>
        <a-button type="primary" @click="addDevice">关联设备</a-button>
      </template>
      <template v-slot:table="{ record }">
        <a-popconfirm title="是否确认移除" @confirm.stop="exportAll(record)" @cancel.stop="showVisible = false"
          :visible="showVisible">
          <a-button @click="showVisible = true" :disabled="!record.selectedRowKeys.length" type="primary" danger>
            批量移除
          </a-button>
        </a-popconfirm>
        <a-button type="primary" danger @click="showEmptyModal">清空满足筛选条件的设备</a-button>
      </template>
      <template #beforeBtn="{ record }">
        <a-popconfirm title="是否移除当前选中？" cancelText="取消" okText="确定" @confirm.stop="deleteRecord(record)">
          <a-button class="deleteRow" type="link" danger>移除</a-button>
        </a-popconfirm>
      </template>
    </g-table>
  </a-spin>

  <association-modal v-if="modal.visible" :visible="modal.visible" title="设备" rowKey="id" url="getDevices"
    :activeId="[]" :search="modal.search" :columns="modal.columns" selectionType="checkbox"
    @close="closeModal"></association-modal>

  <a-modal
    v-model:visible="emptyModalVisible"
    title="清空设备"
    centered
    ok-text="确认清空"
    ok-type="danger"
    :confirmLoading="confirmLoading"
    @ok="emptyModakOk"
  >
    <a-alert
      message="请确认"
      :description="`清空数量:${emptyIds.length}，清空操作不可恢复`"
      show-icon
      type="warning" 
    />
    <div style="margin-top: 10px;">请手动输入“<span style="color: tomato;">清空满足筛选条件的设备</span>”，完成验证</div>
    <a-input v-model:value="emptyInput" @paste.native.capture.prevent="()=>{return false}"/>
  </a-modal>
</template>

<script lang="jsx">
import { applicationCodeGroud } from "@/utils/enumerate.js";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeMount,
  reactive,
  ref,
  toRefs,
} from "vue";
import associationModal from "./components/association-modal.vue";
import { useStore } from "vuex";
import { message } from "ant-design-vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: {
    associationModal,
  },
  setup() {
    let showVisible = ref(false);
    const { proxy } = getCurrentInstance();
    const tableRef = ref(null);
    const store = useStore();
    const applicationCode = ref(null);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      spinning: false,
      title: "",
      api: {
        list: "getSecurityDevicePage",
        deleteSingle: "deleteSecurityDevice",
      },
      btns: [],
      search: [],
      columns: [
        {
          dataIndex: "code",
          title: "设备编码",

        },
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "deviceProdCategoryName",
          title: "产品品类",
        },
        {
          dataIndex: "deviceProdName",
          title: "产品名称",
        },
        {
          dataIndex: "brandName",
          title: "设备品牌",
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
      modal: {
        visible: false,
        search: [],
        columns: [
          {
            dataIndex: "codea",
            title: "编码",
          },
          {
            dataIndex: "name",
            title: "设备名称",
          },
          {
            dataIndex: "genreName",
            title: "产品分类",
            customRender: ({ record }) => {
              return record.productInfo.productCategory.name;
            },
          },
          {
            dataIndex: "modelName",
            title: "设备型号",
            customRender: ({ record }) => {
              return record.productInfo.modelName;
            },
          },
          {
            dataIndex: "brandName",
            title: "设备品牌",
            customRender: ({ record }) => {
              return record.productInfo.brandName;
            },
          },
          {
            dataIndex: "areaName",
            title: "所属区域",
          },
        ],
      },
    });
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
      state.title = applicationCodeGroud[applicationCode.value];
      state.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },
        {
          label: "",
          value: "keyword",
          placeholder: "请输入设备名称",
        },
      ];
      state.modal.search = [
        {
          component: "span",
          value: "applicationCode",
          defaultValue: applicationCode.value,
        },


      ];
    });
    const passingParam = (value) => {
      return {
        ...value,
        applicationCode: applicationCode.value,
      };
    };
    const addDevice = () => {
      state.modal.visible = true;
    };
    const closeModal = async (data, selectObj, open) => {
      state.modal.visible = false;
      state.spinning = true
      try {
        if (open) {
          state.modal.visible = false;
          state.spinning = false
          return;
        }
        if (selectObj.selectAll) {
          const obj = {
            keyword: selectObj.keyword,
            categoryCode: selectObj.categoryCode.join('-'),
            anyMatchedAreaId: selectObj.anyMatchedAreaId.join('-'),
            anyMatchedDepartmentId: selectObj.anyMatchedDepartmentId.join('-'),
            applicationCode: selectObj.applicationCode,
            productId: selectObj.productId,
            tagCodes: selectObj.tagCodes
          }
          try {
            await proxy.$api.addBatchSecurityDevice(obj);
            state.spinning = false
            proxy.$message.success("关联成功");
          } catch (error) {
            state.spinning = false
            proxy.$message.warning("关联失败")
          }
          tableRef.value.getData();
          return;
        }
        if (data.length === 0) {
          state.modal.visible = false;
          return;
        }
        try {
          await proxy.$api.addBatchSecurityDevice({ applicationCode: selectObj.applicationCode, matchedDeviceIds: data.map(e => e.id) });
          state.spinning = false
          proxy.$message.success("关联成功");
        } catch (error) {
          state.spinning = false
          proxy.$message.warning("关联失败")
        }
        state.modal.visible = false;
        tableRef.value.getData();
      } catch (error) {
      } finally {
        state.spinning = false
      }
    };
    const deleteRecord = (record) => {
      proxy.$api.deleteSecurityDevice(record.id).then((res) => {
        proxy.$message.success("操作成功");
        tableRef.value.getData();
      });
    };
    const exportAll = async (data) => {
      await proxy.$api
        .deleteSecurityDeviceBatch({ ids: data.selectedRowKeys.join(",") })
        .then((res) => {
          proxy.$message.success("操作成功");
          showVisible.value = false;
          tableRef.value.getData();
        });
    };

    const emptyModalVisible = ref(false);
    const emptyIds = ref([])
    const confirmLoading = ref(false)
    const emptyInput = ref('')
    const emptyModakOk = async ()=>{
      if('清空满足筛选条件的设备' !== emptyInput.value.trim()){
        message.warning('验证未通过')
        return
      }
      try {
        confirmLoading.value = true
        await proxy.$api.clearSecurityDevice({
          keyword:tableRef.value.form.keyword,
          applicationCode: applicationCode.value
        })
        message.success('操作成功')
        tableRef.value.getData();
      } catch (error) {
        message.error('清空设备失败')
      } finally{
        confirmLoading.value = false
        emptyModalVisible.value = false
      }
    }
    const showEmptyModal = async () => {
      if(tableRef.value.dataSource.length===0){
        message.warning('至少清空一项设备')
        return
      }
      message.loading('请求中...')
      const res = await proxy.$api.getSecurityDevicePage({
        applicationCode: applicationCode.value,
        keyword:tableRef.value.form.keyword,
        pageNumber: 1,
        pageSize: 1000
      })
      const pages = res.pages
      const task = []
      const ids = res.records.map(e=>e.deviceId)
      if (pages > 1) {
        for (let page = 2; page <= pages; page++) {
          task.push(
            new Promise((resolve, reject) => {
              proxy.$api.getSecurityDevicePage({
                applicationCode: applicationCode.value,
                pageNumber: page,
                pageSize: 1000
              }).then(res => {
                ids.push(...res.records.map(e => e.deviceId))
                resolve()
              }).catch(err => {
                reject(err)
              })
            })
          )
        }
        await Promise.all(task)
      }
      message.destroy()
      emptyIds.value = ids
      emptyModalVisible.value = true
      confirmLoading.value = false
      emptyInput.value = ''
    }
    return {
      ...toRefs(state),
      tableRef,
      showVisible,
      exportAll,
      addDevice,
      closeModal,
      deleteRecord,
      passingParam,
      showEmptyModal,
      emptyIds,
      emptyModalVisible,
      emptyInput,
      emptyModakOk
    };
  },
});
</script>

<style></style>
