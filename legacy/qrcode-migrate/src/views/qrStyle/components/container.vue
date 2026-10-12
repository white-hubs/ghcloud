<template>
  <div class="wrapper flex-column" style="width: 100%;height: 100%;">
    <div class="header">
      <a-space :span="16">
        <a-button @click="addText">文本</a-button>
        <a-button @click="addQr">二维码</a-button>
        <a-button @click="addImg">图片</a-button>
      </a-space>
    </div>
    <div class="subgroup">
      <div class="design-box" id="designBox">
        <div class="container" :style="styleName">
          <DraggableContainer>
              <Vue3DraggableResizable
                :initW="item.component.width"
                :initH="item.component.height"
                v-model:x="item.component.left"
                v-model:y="item.component.top"
                v-model:w="item.component.width"
                v-model:h="item.component.height"
                v-model:active="item.active"
                :draggable="true"
                :resizable="true"
                @activated="()=>handleFocus(item)"
                v-for="item in contain.configObj.layers" :key="item.index"
              >
                <div class="action-bar" v-if="item.active">
                  <a-button @click="handleDel" type="danger" size="small">删除</a-button>
                </div>
                <component :is="'avue-echart-'+item.component.name" :textItem="item"></component>
              </Vue3DraggableResizable>
          </DraggableContainer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, provide, inject, reactive, toRefs, ref, getCurrentInstance, onMounted, nextTick } from "vue";
import { textConfig, imgConfig, qrConfig, uuid } from "./options/config"
import { cloneDeep } from 'lodash-es';
import { CloseOutlined } from '@ant-design/icons-vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import { DraggableContainer } from 'vue3-draggable-resizable'
import avueEchartText from "./layer/text.vue"
import avueEchartImg from "./layer/img.vue"
import avueEchartQr from "./layer/qr.vue"

export default defineComponent({
  components: { CloseOutlined, Vue3DraggableResizable,DraggableContainer,avueEchartText,avueEchartImg,avueEchartQr },
  setup() {
    const { proxy } = getCurrentInstance();
    const contain = inject("contain");
    let activeFlag = inject("activeFlag");
    const changeActive = inject("changeActive");
    const clickArea = inject("clickArea");
    let dragRefData = {};
    const state = reactive({
      contentMenu: false,
      contentMenuX: 0,
      contentMenuY: 0
    })
    const styleName = computed(() => {
      return {
        'background-color': contain.configObj.backgroundColor || 'transparent',
        'height': contain.configObj.height + 'px',
        'width': contain.configObj.width + 'px',
        'background-image': `url(${contain.configObj.backgroundImage})`,
        'background-size': '100% 100%'
      }
    })

    const addText = () => {
      contain.configObj.layers.push({ ...cloneDeep(textConfig), index: uuid(), id: uuid() });
    }
    const addQr = () => {
      contain.configObj.layers.push({ ...cloneDeep(qrConfig), index: uuid(), id: uuid() });
    }
    const addImg = () => {
      contain.configObj.layers.push({ ...cloneDeep(imgConfig), index: uuid(), id: uuid() });
    }
    //获取焦点
    const handleFocus = (item) => {
      const { index } = item
      setTimeout(() => {
        changeActive([index])
      }, 0);
    }

    const handleDel = () => {
      const index = contain.configObj.layers.findIndex(item => item.index === activeFlag.value[0])
      contain.configObj.layers.splice(index, 1);
      changeActive([])
    }
    return {
      ...toRefs(state),
      contain,
      handleFocus,
      styleName,
      addText,
      addQr,
      addImg,
      activeFlag,
      handleDel,
    }
  }
})
</script>

<style lang="less" scoped>
.header {
  height: 48px;
  line-height: 48px;
  border-bottom: 1px solid #F3F3F3;

}

:deep(.avue-draggable) {
  box-sizing: content-box;
}

.wrapper {
  overflow: hidden;

  .content-menu {
    position: absolute;
    padding: 16px;
    width: 200px;
    background: #27343e;
    font-size: 14px;
    color: #bcc9d4;
    text-align: left;
    z-index: 10000;

    .contentmenu__item {
      width: 100%;
      line-height: 38px;
      cursor: pointer;
    }
  }
}

.subgroup {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: center;

  .design-box {
    position: relative;
    padding: 32px;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .container {
    position: relative;
    overflow: hidden;
    box-shadow: 0px 0px 10px -1px rgba(0, 0, 0, 0.176);
  }
}

.action-bar{
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
</style>