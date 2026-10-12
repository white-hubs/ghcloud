<template>
  <g-layout title="应用配置">
    <template #content-table>
      <div class="contentCtr">
        <div class="productInfo">
          <div class="title">产品信息</div>
          <div class="infoCtr">
            <span>产品名称: {{ product.name }}</span>
            <span>所属产品线: {{ product.productLineName }}</span>
            <span>产品编号: {{ product.code }}</span>
            <span>备注信息: {{ product.remark }}</span>
          </div>
        </div>
        <div class="title">
          <span style="margin-right: 20px;">应用列表</span>
          <!-- <a-checkbox @change="handleCheckAll">全选</a-checkbox> -->
        </div>
        <a-checkbox-group v-model:value="checked">
          <a-row v-for="item in allAppGroup" style="margin-bottom: 10px;">
            <a-col :span="3">{{ item[0].applicationGroupName || '无分组名称' }}</a-col>
            <a-col :span="21" style="text-align: left">
              <div v-for="child in item" :key="item.id" style="display: inline-block;width: 180px;">
                <a-checkbox :value="child.id" @change="change" :disabled="!useAdmin">
                  {{ child.name }}
                </a-checkbox>
              </div>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="cancel">返回</a-button>
    </template>
  </g-layout>
</template>
<script lang='jsx'>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const id = route.query.id;
    const product = JSON.parse(route.query.product);
    const state = reactive({
      appList: null,
      allAppList: null,
      allAppGroup: [],
      checked: [],
    });

    const handleCheckAll = (e) => {
      if (e.target.checked) {
        state.checked = state.allAppList.map((item) => item.id);
      } else {
        state.checked = [];
      }
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

    const getAllApp = async (params) => {
      const data = await proxy.$api.appList("get", {
        pageSize: 1000,
        pageNum: 1,
      });
      if (data && data.records) {
        state.allAppList = data.records;
      } else {
        state.allAppList = data;
      }
      state.allAppGroup = groupBy(state.allAppList, 'applicationGroupName')
    };

    const getCheckedData = async (params) => {
      const data = await proxy.$api.productApp("get", params);
      if (data && data.records) {
        state.appList = data.records;
      } else {
        state.appList = data;
      }
    };

    const change = async (e) => {
      // 选中
      if (e.target.checked) {
        await proxy.$api.productSetApp("post", {
          id: id,
          applicationId: e.target.value,
        });
        proxy.$message.success("操作成功");
      }
      // 取消选中
      else {
        await proxy.$api.productSetApp("delete", {
          id: id,
          applicationId: e.target.value,
        });
        proxy.$message.success("操作成功");
      }
    };

    const cancel = () => {
      router.back(-1);
    };

    onMounted(async () => {
      if (id) {
        await getCheckedData(id);
      }
      await getAllApp();
      state.checked = state.appList.map((item) => item.id);
    });
    return {
      ...toRefs(state),
      product,
      change,
      cancel,
      useAdmin: window.config.useAdmin,
      handleCheckAll
    };
  },
});
</script>
<style lang="less" scoped>
.contentCtr {
  width: 100%;
  height: 100%;

  .title {
    height: 32px;
    line-height: 32px;
    text-align: left;
    font-family: @fontMedium;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .infoCtr {
    width: 100%;
    padding: 10px;
    display: grid;

    @media (max-width: 1366px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1366px) and (max-width: 1600px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 1600px) {
      grid-template-columns: repeat(4, 1fr);
    }

    grid-row-gap: 16px;
    text-align: left;
  }

  .productInfo {
    width: 100%;
    height: 110px;
  }

  :deep(.ant-checkbox-group) {
    width: 100%;

    .checkboxCtr {
      width: 100%;
      padding: 10px;
      display: grid;

      @media (max-width: 1366px) {
        grid-template-columns: repeat(4, 1fr);
      }

      @media (min-width: 1366px) and (max-width: 1600px) {
        grid-template-columns: repeat(6, 1fr);
      }

      @media (min-width: 1600px) {
        grid-template-columns: repeat(6, 1fr);
      }

      grid-template-rows: repeat(auto-fill, 32px);
      text-align: left;
    }
  }
}
</style>
