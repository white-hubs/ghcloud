<template>
  <div class="alarmDetail-plan flex-column">
    <div class="search">
      <a-space :size="16">
        <span style="color: #fff">产品品类：</span>
        <a-cascader v-model:value="productCategoryCode" :options="productCategoryOptions"
          :field-names="{ label: 'categoryName', value: 'categoryCodeConcat', children: 'children' }"
          placeholder="请选择"></a-cascader>
        <div>
          <span style="color: #fff">所属产品：</span>
          <a-select v-model:value="productId" placeholder="请选择" :options="productOptions" showSearch style="width:180px"
            :filterOption='filterOption'>
          </a-select>
        </div>
        <a-button class="searchBtn" @click="handleSubmit">查询</a-button>
        <a-button class="reset" @click="handleReset">重置</a-button>
      </a-space>
    </div>
    <div class="alarmDetail-plan-header">
      <div>设备编号</div>
      <div>设备名称</div>
      <div>所属产品</div>
      <div>产品品类</div>
      <div>设备状态</div>
      <div>直接可视</div>
      <div>操作</div>
    </div>
    <div class="table-body">
      <a-spin :spinning="loading">
        <div v-if="data.length">
          <div class="alarmDetail-plan-item" v-for="item in data" :key="item.id">
            <div>{{item.code ?? '--'}}</div>
            <div>{{item.name ?? '--'}}</div>
            <div>{{item.productInfo?.name ?? '--'}}</div>
            <div>{{item.productInfo?.productCategory?.name ?? '--'}}</div>
            <div>
              <a-tag color="green" v-if="item.status?.onlineState">在线</a-tag>
              <a-tag color="red" v-else>离线</a-tag>
            </div>
            <div>
              <a-tag color="red" v-if="item?.occlusion">否</a-tag>
              <a-tag color="blue" v-else>是</a-tag>
            </div>
            <div style="cursor: pointer;color: #2989FF;" @click="openDevice(item)">详情</div>
          </div>
        </div>
        <div v-else>
          <a-empty class="empty-table" description="暂无数据"></a-empty>
        </div>
      </a-spin>
    </div>
    <div class="model-container"></div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  ref
} from "vue";
import { CubeVisualizationService } from '@ghcloud/cube-visualization-service'
import { CubeAlarmCenterService } from '@ghcloud/cube-alarm-center-service'
import { UeClient } from '@ghcloud/cube-visual-sdk'

export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  setup(props, { emit }) {
    let modelServerUrl = ''
    const ueClient = ref(null)
    const isDestroyed = ref(false)
    
    const token = JSON.parse(sessionStorage.getItem('GH-Token')).access_token
    const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise')).code
    const authInfo = {
      token,
      tenant,
      terminal: 'command-dispatch-app',
    }
    const cubeVisualizationService = new CubeVisualizationService(authInfo)
    const cubeAlarmCenterService = new CubeAlarmCenterService(authInfo)
    const { proxy } = getCurrentInstance();
    const state = reactive({
      productCategoryCode: null,
      productId: undefined,
      pageNumber: 1,
      pageSize: 100,
      loading: false,
      productCategoryOptions: [],
      productOptions: [],
      data: []
    })
    const filterOption = (input, option) => {
      return (option.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    const handleSubmit = async () => {
      if (state.loading || isDestroyed.value) return
      
      state.loading = true
      try {
        const firstPage = await proxy.$api.getAlarmRecordDeviceList({
          alarmRecordId: props.id,
          pageNumber: state.pageNumber,
          pageSize: state.pageSize,
          productId: state.productId,
          categoryCode: (state.productCategoryCode && state.productCategoryCode.length) ? state.productCategoryCode.at(-1) : undefined,
        })
        
        if (isDestroyed.value) return
        
        const queryTask = []
        if (firstPage.pages > 1) {
          for (let i = 2; i <= firstPage.pages; i++) {
            queryTask.push(proxy.$api.getAlarmRecordDeviceList({
              alarmRecordId: props.id,
              pageNumber: i,
              pageSize: state.pageSize,
              productId: state.productId,
              categoryCode: (state.productCategoryCode && state.productCategoryCode.length) ? state.productCategoryCode.at(-1) : undefined,
            }))
          }
        }
        const allResults = await Promise.all(queryTask)
        
        if (isDestroyed.value) return
        
        const allRecords = allResults.flatMap(res => res.records)
        state.data = [...firstPage.records, ...allRecords]
      } catch (error) {
        if (!isDestroyed.value) {
          proxy.$message.error('查询失败')
        }
      } finally {
        if (!isDestroyed.value) {
          state.loading = false
        }
      }
    }
    const queryModelServer = async () => {
      if (isDestroyed.value) return
      
      try {
        const { alarmTargetCode } = await cubeAlarmCenterService.getAlarmDetails(props.id)
        
        if (isDestroyed.value || !ueClient.value) return
        
        const res = await ueClient.value.sendAsync('occlusionDetection', {
          sourceActorId: alarmTargetCode,
          targetActorIds: state.data.map(item => item.code),
        });
        
        if (isDestroyed.value) return
        
        res.occlusion.forEach((item, i) => {
          if (state.data[i]) {
            state.data[i].occlusion = item
          }
        });
      } catch (error) {
        if (!isDestroyed.value) {
        }
      }
    }
    const handleReset = () => {
      state.productCategoryCode = []
      state.productId = undefined
      state.pageNumber = 1
      handleSubmit()
    }


    const processTreeData = (treeData) => {
      if (!treeData || !treeData.length) {
        return;
      }

      for (const node of treeData) {
        if (node.children && node.children.length > 0) {
          processTreeData(node.children);
        } else {
          node.children = null;
        }
      }
    };
    const openDevice = (item) => {
      emit("toDeviceInfo", {
        alarmTargetKey: item.id,
      });
    }
    onMounted(async () => {
      ueClient.value = UeClient.getInstance()
      handleSubmit()
      
      try {
        // 并行加载基础数据
        const [categoryRes, productRes, projectList] = await Promise.all([
          proxy.$api.getIotProductCategoryTree(),
          proxy.$api.getProductListAll(),
          cubeVisualizationService.getVisualProjectList()
        ])
        
        if (isDestroyed.value) return
        
        // 处理产品分类数据
        processTreeData(categoryRes)
        state.productCategoryOptions = categoryRes
        
        // 处理产品列表数据
        state.productOptions = productRes?.map(item => ({
          value: item.id ?? '',
          label: item.prodName ?? ''
        }))
        
        // 处理UE5相关逻辑
        if (projectList.length > 0) {
          const modalConfigString = await cubeVisualizationService.getModalConfigByProjectId(projectList[0].id)
          const modalConfig = JSON.parse(modalConfigString)
          const modelServer = modalConfig.ue5.modelServer
          
          if (modelServer.length > 0 && !isDestroyed.value) {
            modelServerUrl = modelServer[0].url
            const dom = document.querySelector(`.model-container`)
            ueClient.value.loadUE5(dom, modelServerUrl)
            
            // UE5连接成功后进行遮挡检测
            ueClient.value.onConnected(async () => {
              if (!isDestroyed.value) {
                await queryModelServer()
              }
            })
          }
        }
      } catch (error) {
      }
    })

    // 组件销毁时的清理工作
    onBeforeUnmount(() => {
      isDestroyed.value = true
      // 清理UE5相关资源
      if (ueClient.value) {
        try {
          // 移除事件监听器
          ueClient.value.offConnected()
          // 如果有其他清理方法，也可以在这里调用
          ueClient.value = null
        } catch (error) {
        }
      }
      // 清理状态
      state.loading = false
      state.data = []
    })

    return {
      ...toRefs(state),
      filterOption,
      handleReset,
      openDevice,
      handleSubmit,
      handleReset,
      openDevice
    };
  },
});
</script>


<style lang="less" scoped>
.search {
  margin-bottom: 16px;

  :deep(.ant-input) {
    color: #ffffff;
    background-color: transparent;
    border-color: #2989ff;

    &:hover {
      border-color: #2989ff;
    }
  }

  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  :deep(.ant-cascader-picker) {
    background: transparent;
    border: 1px solid #374870;
    border-color: #374870;
    color: #ffffff;
    height: 30px;

    input {
      border-color: transparent;
      height: 28px
    }
  }

  .searchBtn {
    background: #2989ff;
    color: #ffffff;
    border-color: #2989ff;
  }

  .reset {
    color: #2989ff;
    background: #000000;
    border-color: #2989ff;
  }
}

.alarmDetail-plan {
  padding-top: 10px;
  height: 100%;
  overflow: hidden;

  .alarmDetail-plan-header {
    height: 42px;
    background: #285487;
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    padding-left: 20px;
    color: white;
    display: flex;

    >div {
      flex: 1;
      height: 100%;
      line-height: 42px;
      text-align: left;
    }
  }

  .table-body {
    flex: 1;
    overflow: auto;
  }

  .alarmDetail-plan-item {
    font-size: 14px;
    font-family: PingFang SC-Regular;
    min-height: 42px;
    font-weight: 400;
    color: #e4e4e4;
    align-items: center;
    padding-left: 20px;
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    >div {
      flex: 1;
      text-align: left;

      >span {
        color: rgba(41, 137, 255, 1);
        cursor: pointer;
      }
    }
  }

  .alarmDetail-pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }

  .btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(41, 137, 255, 1);
    border-color: rgba(41, 137, 255, 1);
    color: #ffffff;
    z-index: 10;

    &.ant-btn:hover {
      color: #ffffff;
      border-color: rgba(41, 137, 255, 1);
      background: rgba(41, 137, 255, 1);
    }
  }
}
</style>
<style lang="less">
.alarmDetail-pagination {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: rgba(228, 228, 228, 1) !important;

    a {
      color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: rgba(228, 228, 228, 1) !important;
  }
}

.alarmDetail-plan {
  .ant-radio-group {
    width: 100%;
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #2989ff !important;
  }

  .ant-radio-inner::after {
    background-color: #2989ff;
  }
}

.empty-table {
  margin-top: 20px;
  color: #fff
}

.model-container {
  display: none;
}
</style>