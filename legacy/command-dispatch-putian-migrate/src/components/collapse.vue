<template>
  <div class="look" id="lookMore" :class="[!isOpen && 'inset']">
    <div class="info" :class="[ height > 22 && !isOpen && 'single-line' ]" >
      <slot></slot>
    </div>
    <a-button class="btn" type="link" v-if="height > 22" @click="toggle">
     <template #icon>
      <DoubleRightOutlined class="up" v-if="isOpen"/>
      <DoubleRightOutlined class="normal" v-else/>
     </template>
      {{ isOpen ? '收起' : '展开' }}
    </a-button>
  </div>
</template>
 
<script>
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons-vue';
import { defineComponent, reactive, toRefs, nextTick, watch } from 'vue';
export default defineComponent({
  props: {
    value: {
      type: String,
    },
  },
  components: {
    DoubleRightOutlined,
    DoubleLeftOutlined,
  },
  setup(props, { slots }) {
    const state = reactive({
      isOpen: false,
      activeKey: '1',
      height: 0,
    })
    function toggle(val) {
      state.isOpen = !state.isOpen
    }
    watch(() => props.value, () =>{
      nextTick(() => {
        let box = document.getElementById('lookMore')
        let style =  window.getComputedStyle(box,null)
        state.height = Number(style.height.replace('px', ''))
      })

    },{immediate:true, deep: true})
    return { 
      ...toRefs(state),
      toggle,
    }
  },
});
</script>
<style lang="less" scoped>
.look{
  display: flex;
  align-items: baseline;
  position: relative;
  &.inset{
    width: calc(100% - 105px);
  }
  .info{
    display: inline-block;
    width: calc(100% - 70px);
    transition: all 0.3s ease-in-out;
    div{
      display: inline-block;
    }
    &.single-line {
      white-space: nowrap;    
      overflow: hidden;        
      text-overflow: ellipsis; 
    }
  }
  .btn{
    position: absolute;
    right: 0;
    top: -5px;
    .normal{
      transform: rotate(90deg);
      transition: all 0.3s ;
      transform-origin: 50% 50%;
    }
    .up{
      transition: all 0.3s ;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
    
  }

  :deep(.ant-collapse-borderless),
  :deep(.ant-collapse),
  :deep(.ant-collapse-content){
    background-color: transparent;
    border: none;
  }
  :deep(.ant-collapse > .ant-collapse-item),
  :deep(.ant-collapse-borderless > .ant-collapse-item > .ant-collapse-content){
    border: none;
  }
}

</style>