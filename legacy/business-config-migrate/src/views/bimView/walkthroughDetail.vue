<template>
  <g-layout :title="modelName + levelName + '漫游场景详情'">
    <template #content-table>
      <div class="walkthrough-detail">
        <div class="detail-tag">
          <template v-for="tag in roamingConfig" :key="tag.id">
            <a-tooltip v-if="tag.name.length > 20" :title="tag.name">
              <a-tag @click="clickTag(tag)" @close="handleClose(tag)" :closable="true">
                {{ `${tag.name.slice(0, 20)}...` }}
              </a-tag>
            </a-tooltip>
            <a-tag @click="clickTag(tag)" v-else @close="handleClose(tag)" :closable="true">
              {{ tag.name }}
            </a-tag>
          </template>
          <a-input
            v-if="inputVisible"
            ref="inputRef"
            type="text"
            size="small"
            :style="{ width: '78px' }"
            v-model:value="inputValue"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
          />
          <a-tag v-else @click="showInput" style="background: #fff; border-style: dashed">
            <plus-outlined />
            点击添加新视角
          </a-tag>
          <a-space v-if="roamingConfig.length >= 3">
            <a-button size="small" @click="clickPreview" type="primary">漫游</a-button>
            <!-- <a-button size="small" @click="clickStop">停止</a-button> -->
          </a-space>
        </div>
        <div class="detail-bim">
          <BimModel :bimPath="bimPath" :levelName="levelName" ref="bimModel" :isPersonAdded="true"></BimModel>
        </div>
      </div>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" @click="saveRecord">保存</a-button>
    </template>
  </g-layout>
</template>

<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { guid } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/utils/common";
import { defineComponent, reactive, toRefs, onMounted, getCurrentInstance, ref, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

import BimModel from "./BimModel.vue";

export default defineComponent({
  components: { gLayout, BimModel },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const inputRef = ref();
    const bimModel = ref();
    const state = reactive({
      roamingConfig: [],
      inputVisible: false,
      inputValue: "",
      bimPath: null,
      levelName: null,
      modelName: null,
      preview: false,
      play: false,
      form: {},
    });
    //获取数据
    const getData = () => {
      proxy.$api.getAreaRoamingConfigDetail(route.query.id).then((res) => {
        if (res.roamingConfig) {
          state.roamingConfig = JSON.parse(res.roamingConfig);
        }
        state.form = res;
        areaBindModelDetail(res);
      });
    };
    //根据区域获取bim
    const areaBindModelDetail = (data) => {
      proxy.$api.getAreaRoamingConfig({ areaId: data.areaId }).then((res) => {});
      proxy.$api.areaBindModelDetail(data.areaId).then((res) => {
        if (res && res.loadPath) {
          state.bimPath = "/bimresource/" + res.loadPath;
          state.levelName = res.bimLevelName;
          state.modelName = res.name;
        }
      });
    };
    const handleClose = (removedTag) => {
      const roamingConfig = state.roamingConfig.filter((tag) => tag.id !== removedTag.id);
      state.roamingConfig = roamingConfig;
    };

    const showInput = () => {
      state.inputVisible = true;
      nextTick(() => {
        inputRef.value.focus();
      });
    };

    const handleInputConfirm = () => {
      const inputValue = state.inputValue;
      let roamingConfig = state.roamingConfig;
      let camera = bimModel.value.getCamera();
      if (inputValue) {
        roamingConfig = [
          ...roamingConfig,
          {
            name: inputValue,
            id: guid(),
            position: camera.position,
            target: camera.target,
            coordinateSystem: "world",
          },
        ];
      }

      Object.assign(state, {
        roamingConfig,
        inputVisible: false,
        inputValue: "",
      });
    };
    const clickTag = (tag) => {
      //   if(bimModel.value.viewer3D){
      //     bimModel.value.viewer3D.setView(tag)
      //   }
    };
    //点击漫游
    const clickPreview = () => {
      state.preview = true;
      state.play = true;
      bimModel.value.setKeyFrames(state.roamingConfig);
    };
    //点击停止
    const clickStop = () => {
      if (bimModel.value.walkthrough) {
        if (state.play) {
          bimModel.value.walkthrough.pause();
        } else {
          bimModel.value.walkthrough.play();
        }
        state.play = !state.play;
      }
    };
    //返回
    const goBack = () => {
      history.go(-1);
    };
    //保存
    const saveRecord = () => {
      state.form.roamingConfig = JSON.stringify(state.roamingConfig);
      proxy.$api.putAreaRoamingConfig({ ...state.form }).then((res) => {
        proxy.$message.success("操作成功");
        goBack();
      });
    };
    onMounted(() => {
      getData();
    });
    return {
      ...toRefs(state),
      inputRef,
      bimModel,
      clickTag,
      handleClose,
      showInput,
      handleInputConfirm,
      clickPreview,
      clickStop,
      goBack,
      saveRecord,
    };
  },
});
</script>

<style lang="less" scoped>
.walkthrough-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .detail-bim {
    flex: 1;
  }
}
</style>
