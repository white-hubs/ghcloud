<template>
  <div class="datactr">
    <div class="infoTitle verticalLine">租户租用信息</div>
    <div class="dataTitle">
      <div class="topData">
        <div class="name">租用概览</div>
        <div class="dataDetails">
          <div>
            <span class="itemName">租户名称：</span>
            <span class="itemContent">{{ data?.name ? data?.name : '--' }}</span>
          </div>
        </div>
      </div>
      <div class="bottomData">
        <div class="grid">
          <div class="bottomLine">
            <div class="name">租用详情</div>
          </div>
          <a-checkbox-group class="appCtr" v-model:value="appChecked">
                  <!-- <a-row v-for="item in allAppGroup" style="margin-bottom: 10px;">
                    <a-col :span="3">{{ item[0].applicationGroupName || '无分组名称' }}</a-col>
                    <a-col :span="21" style="text-align: left">
                      <div class="checkboxCtr" v-for="child in item" :key="item.id" style="display: inline-block;width: 180px;">
                        <a-checkbox :value="child.id" @change="changeApp"></a-checkbox>
                        <span class="pl1">{{ child.name }}</span>
                        <a-button type="link" @click="openFuncSettingModal(child)" class="func-setting">能力配置</a-button>
                      </div>
                    </a-col>
                  </a-row> -->
              <div class="checkboxCtr" v-for="item in allList" :key="item.id">
                <a-checkbox :value="item.id" @change="changeApp"></a-checkbox>
                <span class="pl1">{{ item.name }}</span>
                <a-button type="link" @click="openFuncSettingModal(item)" class="func-setting">能力配置</a-button>
              </div>
            </a-checkbox-group>
        </div>
      </div>
    </div>
    <div class="btnctr">
      <a-space :size="16"></a-space>
      <a-button @click="cancel">返回</a-button>
    </div>
    <a-modal title="能力配置" :visible="funcSettingVisible" centered :footer="null" @cancel="closeFuncSettingModal"
      width="1000px">
      <a-spin :spinning="funcSettingLoading">
        <a-checkbox v-for="item in funcOptions" :key="item.code" :checked="item.value"
          @change="(e) => funcChange(item, e.target.checked)">
          {{ item.name }}
        </a-checkbox>
        <a-empty v-if="funcOptions.length === 0"></a-empty>
      </a-spin>
    </a-modal>
  </div>
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  toRefs,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const { proxy, ctx } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      data: null,
    });

    const status = reactive({
      spinning: false,
    });

    const state = reactive({
      currentApp:{},
      appChecked: [],
      allList: [],
      allAppGroup: [],
      funcSettingVisible: false,
      checkedList: [],
      funcOptions: [
        { label: '打卡', value: "1" },
        { label: '打卡2', value: "2" },
      ],
      funcSettingLoading: false
    });

    // 有code
    const code = route.query.tenantCode;

    // 当前企业信息产品租用信息
    const getData = async (data) => {
      status.spinning = true;
      await proxy.$api.tenantCodeProduct("get", data).then((res) => {
        // formState.data = res;
        state.productChecked = res.map((item) => item.id);
        status.spinning = false;
      });
    };

    const getTenantDetail = async (params) => {
      const data = await proxy.$api.tenantCode("get", params);
      formState.data = data;
    };

    const groupBy = (array, key) => {
      return array.reduce((result, currentItem) => {
        // 使用 key 函数提取分组键
        const groupKey = typeof key === 'function' ? key(currentItem) : currentItem[key];

        // 初始化分组数组（如果尚未创建）
        if (!result[groupKey]) {
          result[groupKey] = [];
        }

        // 将当前项添加到分组数组
        result[groupKey].push(currentItem);

        return result;
      }, {});
    };
    // 获取所有应用
    const getAppList = async () => {
      const params = {
        pageSize: 1000,
        pageNum: 1,
      };
      const data = await proxy.$api.appList("get", params);
      if (data && data.records) {
        state.allList = await data.records;
      } else {
        state.allList = await data;
      }
      state.allAppGroup = groupBy(state.allList, 'applicationGroupName')
    };

    // 获取当前应用下已选的app
    const getcheckedApp = async (code) => {
      const data = await proxy.$api.getPenantProductApp("get", {
        code: code,
      });
      if (data && data.records) {
        state.appChecked = data.records.map((item) => item.id);
      } else {
        state.appChecked = data.map((item) => item.id);
      }
    };

    const changeApp = async (e) => {
      await proxy.$api.tenantProductApp(e.target.checked ? "post" : "delete", {
        code: code,
        applicationId: e.target.value,
      });
      proxy.$message.success("操作成功");
      getcheckedApp(code);
    };

    const cancel = () => {
      formState.data = null;
      router.back(-1);
    };

    onMounted(() => {
      if (code) {
        getData({ code: code });
        getTenantDetail({ code: code });
        getAppList();
        getcheckedApp(code);
      }
    });

    const openFuncSettingModal = async (application) => {
      state.funcSettingVisible = true
      try {
        state.funcSettingLoading = true
        const tenantCode = formState.data.code
        const res = await proxy.$api.getDataDictionaryByItemPage('APP_BUSINESS_CONFIG', tenantCode)
        state.currentApp=res.records.find(e=>e.code===application.code+'_ABILITY')
        state.funcOptions = Object.keys(JSON.parse(state.currentApp.variable)).map(key=>{
          return {
            code: key,
            name: JSON.parse(state.currentApp.variable)[key].name,
            value: JSON.parse(state.currentApp.variable)[key].value,
          }
        })
      } catch (error) {

      } finally {
        state.funcSettingLoading = false
      }
    }
    const closeFuncSettingModal = () => {
      state.funcSettingVisible = false
      state.checkedList = []
      state.funcOptions = []
    }
    const funcChange = async (item, checked) => {
      try {
        state.funcSettingLoading = true
        state.funcOptions.find(e => e.code === item.code).value = checked
       const variable=state.funcOptions.reduce((acc, cur) => {
          acc[cur.code] = {
            name: cur.name,
            value: cur.value
          };
          return acc;
        }, {});
        await proxy.$api.updateDataDictionary({
          ...state.currentApp,
          variable: JSON.stringify(variable)
        }, formState.data.code)
        proxy.$message.success('操作成功')
      } catch (error) {
        state.funcOptions.find(e => e.code === item.code).value = !checked
      } finally {
        state.funcSettingLoading = false
      }
    }

    return {
      ...toRefs(state),
      ...toRefs(status),
      ...toRefs(formState),
      changeApp,
      cancel,
      openFuncSettingModal,
      closeFuncSettingModal,
      funcChange,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/dataDetails/index.less");

.dataDetails {
  height: 90px;
  padding: 10px 0 0 0;
}

.dataTitle {
  height: calc(100% - 122px);
  overflow: hidden;

  .name {
    height: 32px;
    line-height: 32px;
    padding: 0 0 0 16px;
  }

  .topData {
    height: 120px;
  }

  .bottomData {
    height: calc(100% - 120px);
    overflow: hidden;
  }
}

.grid {
  width: 100%;
  height: calc(100% - 32px);
  display: grid;
  // grid-template-columns: 1fr 1fr 2fr;
  grid-template-columns: 1fr;

  >div {
    height: 100%;
    overflow: hidden;
  }

  :deep(.ant-checkbox-group) {
    width: 100%;
    height: calc(100% - 20px);
    padding-top: 10px;
    overflow-y: auto;
  }

  .appCtr {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(auto-fill, 32px);
    overflow-y: auto;
  }

  .bottomLine {
    height: 32px;
    line-height: 32px;
    padding: 0;
  }

  .productList {
    width: 100%;
    height: 100%;
  }

  .checkboxCtr {
    height: 32px;
    line-height: 32px;
    padding-left: 15px;
    cursor: pointer;

    .func-setting {
      float: right;
      display: none;
    }

    &:hover {
      background-color: @infoHover;
      color: @blue;

      .func-setting {
        display: inline;
      }
    }

    &.active {
      background-color: @blueHover;
      color: @blue;

      button {
        display: inline;
      }
    }
  }

  ul {
    min-width: 250px;
    height: 100%;
    list-style: none;
    padding: 8px 0 0 0;
    margin: 0;
    overflow-y: auto;

    li {
      width: 100%;
      height: 32px;
      cursor: pointer;
      line-height: 32px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      padding: 0 16px;

      &:hover {
        background-color: @infoHover;
        color: @blue;
      }

      &.active {
        background-color: @bluedeep;
        color: @white;
      }
    }
  }
}
</style>
