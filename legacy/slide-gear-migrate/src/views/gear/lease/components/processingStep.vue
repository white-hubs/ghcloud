<template>
  <div class="processingStep">
    <a-timeline direction="vertical" size="small" :current="list.length">
      <a-timeline-item v-for="item in list" :key="item.id">
        <div class="processTitle">
          <span>{{ item.name }}</span>
        </div>
        <div class="flex">
          <span>处理人：{{ item.nickname }}</span>
          <span>处理时间：{{ item.processTime }}</span>
        </div>
        <div class="flex">
          <span>处理意见：{{ item.remark ? item.remark : "--" }}</span>
        </div>
      </a-timeline-item>
    </a-timeline>
    <a-empty v-if="list.length === 0" />
  </div>
</template>

<script lang='jsx'>
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from "vue";
import { useRoute } from "vue-router";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  props: {
    businessType: {
      type: String,
      default: "stall_lease",
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const state = reactive({
      list: [],
    });
    const getData = () => {
      proxy.$api
        .getflowEvent( {
          businessId: route.query.id,
          businessType: props.businessType,
        })
        .then((res) => {
          state.list = res.records.map((item) => {
            return Object.assign(item, {
              processTime: timeFormat(item.processTime, false),
            });
          });
        });
    };
    onMounted(() => {
      if (route.query.id) {
        getData();
      }
    });
    return {
      ...toRefs(state),
      getData,
    };
  },
});
</script>

<style lang="less">
.processingStep {
  padding: 20px;

  .step-name {
    margin-right: 20px;
  }

  .step-info {
    margin-right: 10px;
  }

  .ant-steps-vertical .ant-steps-item-content {
    text-align: left;
  }
  .processTitle {
    font-size: 14px;
    text-align: left;
  }
  .flex {
    padding: 0 20px;
    justify-content: space-between;

    > span {
      padding: 10px;
      display: inline-block;
      width: 50%;
      text-align: left;
      text-overflow: ellipsis;
      overflow: hidden;
      display: inline-block;
      white-space: nowrap;
    }

    .relative {
      width: 84%;
      height: 150px;
      float: right;
    }
  }
}
</style>
