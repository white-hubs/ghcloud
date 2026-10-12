<template lang="pug">
a-table(
  :dataSource="dataSource" 
  :columns="columns"
  :rowKey="'id'"
  :pagination="page ? pagination : false")
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
} from "vue";
import { timeFormat } from "@/utils/common";
import { useRouter, useRoute } from "vue-router";
export default defineComponent({
  props: {
    url: String,
    ResKey: String,
    columns: {
      type: Array,
      default: () => [],
    },
    page: { type: Boolean, default: true },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const id = route.query.id;
    const state = reactive({
      dataSource: null,
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        pageSizeOptions: ["10", "20", "50"],
      },
    });

    const getData = async () => {
      const data = await proxy.$api[props.url](id, "get");
      if (data && data.records) {
        state.dataSource = data.records;
        state.pagination.total = data.total;
      } else {
        if (props.ResKey) {
          state.dataSource = data[props.ResKey];
        } else {
          state.dataSource = data;
        }
      }
    };

    onMounted(() => {
      getData();
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>
