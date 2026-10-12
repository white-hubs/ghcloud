<template lang="pug">
a-row(:gutter="[16, { xs: 8, sm: 16, md: 24, lg: 32 }]")
  a-col(:span="8" v-for="item in productsList" :key="item.id" )
    a-card(:title="item.name" type="inner" hoverable :loading="loading"  @click="handleClickCard(item)")
      //- template(class="ant-card-actions" #actions)
      a-card-meta(:description="item.productLine?.name")
      div.roleLise
        a-tag(v-for="ele,index in item" :key="index") {{item.id}}
</template>
<script lang="jsx">
import {
  // computed,
  defineComponent,
  reactive,
  onMounted,
  toRefs,
  getCurrentInstance,
  // watch,
} from "vue";
import axios from "@/utils/axios";
import { useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const state = reactive({
      productsList: [],
      loading: false,
    });
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    onMounted(() => {
      getProductsList();
    });

    const getProductsList = async () => {
      state.loading = true;
      const data = await proxy.$api.tenantCodeProduct("get", {
        pageSize: 20,
        pageNumber: 1,
      });
      if (data.records && data.records instanceof Array) {
        state.productsList = data.records;
        state.loading = false;
      }
    };

    const handleClickCard = (item) => {
      router.push({
        path: "/authority",
        query: { id: item.id, name: item.name },
      });
    };

    return {
      ...toRefs(state),
      handleClickCard,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.ant-card) {
  width: 300px;
}
:deep(.ant-row) {
  row-gap: 15px;
}
.roleLise {
  padding-top: 24px;
}
</style>
