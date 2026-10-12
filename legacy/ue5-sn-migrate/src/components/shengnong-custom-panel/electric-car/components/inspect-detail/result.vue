<template>
  <div class="record">
    <div style="margin-top: 15px; width: 96%; margin-left: 2%;">
      <a-spin :spinning="loadingDataSource">
        <div class="table_content">
          <div v-if="standardList.length === 0" class="no-content">
            <NoData />
          </div>
          <div v-else>
            <div class="inspectResult">
              <div v-for="item in standardList" :key="item.id" class="mb-10">
                <div class="title mb-10">{{ item?.standardName || '--' }}</div>
                <div>
                  <div class="mb-10" v-for="(ele, index) in item?.itemVOS" :key="ele.id">
                    <div class="flex-start mb-5">
                      <div class="sortNum">{{ index + 1 }}、</div>
                      <span>{{ ele?.itemName || '--' }} ：</span>
                      <span :class="[!ele?.errorValueFlag ? 'NORMAL' : 'ABNORMAL']">
                        {{ ele?.itemResultName || '--' }}
                      </span>
                    </div>
                    <div class="flex-start mb-5">
                      <div class="sortNum"></div>
                      <span>
                        描述信息：{{ ele?.errorDesc ||"--" }}
                      </span>
                    </div>
                    <div class="flex" v-if="ele?.fileVOS?.length > 0">
                      <div class="sortNum"></div>
                        <div class="flex-start" v-for="file in ele?.fileVOS" :key="file.id">
                          <a-image v-if="!typeList.includes(file.type)" :src="httpImgUrl(file.path)"  style='width:60px; margin: 10px;' ></a-image>
                          <div v-else @click="preview(file)" style='margin-right: 10px;text-align: center;color: #e2e2e2;'>
                            <a-image height="30px" :preview="false" :src="getSnImage('jl.png')" ></a-image>
                            <div class='file-name'>{{ file.name }}</div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import { getSnImage } from "@/utils/getImage";
import { kkFilePreview } from '@ghcloud/cube-utils'
import { isHttpUrl, fallback } from "@/utils/common";

interface Props {
  dataSource: any;
}
const props = withDefaults(defineProps<Props>(), {
  dataSource: null
});
const loadingDataSource = ref(false);
const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt']
const imgs = ref()
const files = ref()
const standardList = computed(() => {
  return props.dataSource?.standardVOS || []
})
const httpImgUrl = (path) => {
  let url = ''
  const baseUrl = sessionStorage.getItem("market-baseUrl");
  if(!isHttpUrl(path)){
    url = baseUrl + path
  }else{
    url = path
  }
  return url
}
const preview = (item): void => {
  if (typeList.includes(item.type ?? '')) {
    const path = httpImgUrl(item.path)
    kkFilePreview({
      ...item,
      path: path
    })
  }
}
const handleImageError = (event) => {
  const img = event.target;
  img.src = fallback;
};
</script>

<style lang="less" scoped>
:deep(.ant-btn-sm) {
  border: 1px solid #1285ff;
  background-color: rgba(4, 17, 32, 0.95);
  color: #1285ff;
}

:deep(.ant-btn-primary) {
  background-color: #1285ff;
  color: #fff;
}

:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

.alarm-time-picker {
  width: 250px;
}

.alarm-level-select,
.handle-status-select {
  width: 150px;
}

:deep(.ant-pagination-item-ellipsis) {
  color: #fff !important;
}

:deep(.ant-pagination-item) {
  background: rgba(255, 255, 255, 0.1);

  a {
    color: #fff;
  }
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;

  a {
    color: #fff;
  }
}

:deep(.ant-modal-content) {background-color: rgba(4, 17, 32, 0.92) !important;
}

.NORMAL {
  color: #1EC138 !important;
}

.ABNORMAL {
  color: #FF3D3D !important;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
}
</style>
<style lang="less">
.modal-table-alarm {
  .modal-width {
    width: 1250px !important;
  }
}
</style>

<style lang="less" scoped>
.alarm-level-select,
.handle-status-select {
  width: 150px;
}
:deep(.ant-pagination-total-text) {
  color: #fff;
}
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 1);
}

:deep(.ant-pagination-item-ellipsis) {
color: #fff !important;
}

:deep(.ant-pagination-item) {
background: rgba(255, 255, 255, 0.1);

a {
  color: #fff;
}
}

:deep(.ant-pagination-item-active) {
background: #1890ff;

a {
  color: #fff;
}
}

:deep(.ant-modal-content) {background-color: rgba(4, 17, 32, 0.92) !important;
}
:deep(.ant-form-item-label > label){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-selection-item){

color: rgba(255, 255, 255, 1);
}
:deep(.ant-select-item),:deep(.ant-empty-small){
background: rgba(255, 255, 255, 0.1) !important;
color: #fff !important;
}
:deep(.ant-select-item-empty){
  background: rgba(255, 255, 255, 0.1) !important;
}
:deep(.ant-empty-small), :deep(.ant-picker-input > input){
  color: #fff !important;
}

.inspectResult {
  color: #e2e2e2;
  font-size: 14px;
  .title {
    font-weight: 500;
    font-weight: bold;
  }
}
.mb-10{
  margin-bottom: 10px;
}
.mb-5{
  margin-bottom: 5px;
}
.sortNum {
  width: 30px;
  height: 22px;
}
</style>