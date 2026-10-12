<template>
  <div style="margin-top: 15px">

    <div class="table_header">
      <div v-for="item in columns">{{ item.title }}</div>
    </div>
    <div class="table_content">
      <div v-if="dataSource.length === 0" class="no-content">
        <NoData />
      </div>
      <div v-for="item in dataSource">
        <div class="content">
          <div v-for="res in columns">{{ item[res.dataIndex] }}</div>

        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted} from 'vue'
import type { TableColumnType } from 'ant-design-vue';

import NoData from "@/components/businessPanel/public/noData.vue";
interface Props {
  dataSource:any[],
 
  columns:TableColumnType[]
}

const props = withDefaults(defineProps<Props>(),{
  dataSource:()=>[],
  columns:()=>[]

})
</script>
<style scoped lang="less">
.table_header {
  background: rgba(16, 40, 68, 0.8);
  height: 48px;
  display: flex;
  color: #fff;
  line-height: 48px;

  div {
    width: 100%;
    text-align: center;
    padding: 0 15px;
  }
}

.table_content {
  // display: flex;
  color: #fff;

  .no-content {
    display: flex;
    justify-content: center;

    :deep(.content) {
      margin-top: 3%;
    }
  }

  .content {
    display: flex;

    div {
      width: 100%;
      line-height: 48px;
      text-align: center;
      height: 48px;
      border-bottom: 1px solid rgba(105, 116, 140, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>

