<template>
  <div class="task-bar-tools" :class="{'hide': !taskList.length}">
    <div class="list" id="task-list-dom">
      <a-popover placement="right" overlayClassName='task-bar-popover' destroyTooltipOnHide v-for="(item, index) in taskList" :key="item.uuid+''+index" @click="handleOpen(item)">
        <template #content>
          <div class="task-dom-container" v-html="getPopDom(item)"></div>
        </template>
        <div class="item">
          <div class="task-dom-container" v-html="item.dom.outerHTML"></div>
          <div class="item-close" @click.stop="handleClose(item)">
            <CloseOutlined />
          </div>
        </div>
      </a-popover>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref,computed, nextTick } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";

const { proxy } = getCurrentInstance();
const taskList = ref([]);

const handleOpen = (item) => {
  proxy.$emitter.emit(`custom-modal-${item.uuid}`, 'open')
}
const handleClose = (item) => {
  const findIndex = taskList.value.findIndex(e => e.uuid === item.uuid)
  if (findIndex !== -1) {
    proxy.$emitter.emit(`custom-modal-${item.uuid}`, 'close')
    taskList.value.splice(findIndex, 1)
  }
}

const listenModalUnMounted = (uuid) => {
  proxy.$emitter.on(`custom-modal-UnMounted-${uuid}`, () => {
    handleClose({ uuid })
    proxy.$emitter.off(`custom-modal-UnMounted-${uuid}`)
  })
}
const getPopDom = computed(()=>{
  return function(item){
    const dom = item.dom.cloneNode(true)
    dom.style.transform = `scale(${300 / item.modalRect.width})`
    return dom.outerHTML
  }
})

onMounted(() => {
  // 最小化事件
  proxy.$emitter.on("handleMinimize", ({ dom, modalRect, uuid }) => {
    dom.classList.add('task-bar-minimize-modal')
    dom.style.transform = `scale(${54 / modalRect.width}) translate(-50%,-50%)`
    const findTask = taskList.value.find(item => item.uuid === uuid)
    if (findTask) {
      findTask.dom = dom
    } else {
      taskList.value.unshift({
        dom,
        uuid,
        modalRect
      })
    }
    nextTick(() => {
      const findIndex = taskList.value.findIndex(item => item.uuid === uuid)
      if (findIndex !== -1) {
        const taskDom = document.getElementById('task-list-dom').children[findIndex]
        proxy.$emitter.emit(`custom-modal-${uuid}`, taskDom.getBoundingClientRect())
      }
    })
    listenModalUnMounted(uuid)
  });
})

</script>

<style lang="less" scoped>
.task-bar-tools {
  position: fixed;
  left: 380px;
  bottom: 180px;
  background: linear-gradient(180deg, #144398, #13326a);
  border-radius: 10px;
  backdrop-filter: blur(2.94px);
  transition: all 0.3s ease;
  opacity: 1;

  &.hide {
    pointer-events: none;
    opacity: 0;
  }

  .list {
    margin-top: 20px;
    height: 210px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: visible;
    width: 82px;

    .item {
      padding: 10px 16px 0;
      cursor: pointer;
      position: relative;

      img {
        width: 54px;
        height: 36px;
        border-radius: 4px;
      }

      .item-close {
        position: absolute;
        right: 6px;
        top: 2px;
        border: 1px solid #388ef3;
        border-radius: 4px;
        padding: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 0px 4px 0px rgba(56, 142, 243, 0.45);
        color: #fff;
        font-size: 8px;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;

        &:hover {
          background-color: red;
          border-color: red;
        }
      }
    }

  }

}
</style>
<style lang="less">
.task-bar-popover{
  .ant-popover-arrow{
    border-bottom-color: #0e172f !important;
    border-left-color: #0e172f !important;
  }
  .ant-popover-inner-content{
    background-color:#0e172f;
  }
  .task-dom-container{
    width: 300px;
    height: 200px;
    position: relative;
    border-radius: 0;
    .modal-container{
      left: 0px !important;
      top: 0px !important;
      position: absolute;
    }
  }
}
.task-dom-container {
  width: 54px;
  height: 36px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s ease;

  &::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    z-index: 999;
    top: 0;
    left: 0;
  }

  &:hover {
    transform: scale(1.1);
  }

  .task-bar-minimize-modal {
    position: relative !important;
    left: 50% !important;
    top: 50% !important;
    transform-origin: left top !important
  }
}
</style>