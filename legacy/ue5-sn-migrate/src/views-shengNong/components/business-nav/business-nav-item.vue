<template>
  <div class="nav-item" :style="props.navItem.disabled ? 'cursor: not-allowed;' : ''">
    <div class="flex-column" style="align-items: center;" @click="clickNav(props.navItem, 1)">
      <a :class="[props.navItem.id === props.activedId ? 'actived' : '', props.navItem.name?.length > 4 ? 'ml-custom' : '']">
        {{ props.navItem.name }}
      </a>
      <div class="activeLine" v-show="props.navItem.id === props.activedId">
        <div class="box1">
          <div class="box2">
          </div>
        </div>
        <div class="box3">
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SceneDataType } from '@/api/models/mdata';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  navItem: SceneDataType;
  activedId: string
}>(), {})
const emits = defineEmits(['clickNav'])

const showDropdown = ref(false)

/**
 * 点击菜单事件
 * @param nav 菜单数据
 * @param lv 层级
 */
function clickNav(nav: SceneDataType, lv: number): void {
  emits("clickNav", nav, lv);
}

watch(() => props.activedId, () => {
  showDropdown.value = false
})

</script>
<style lang="less" scoped>
.nav-item {
  // width: calc(100% / 6) !important;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  text-align: center;
  z-index: 100;

  img {
    width: 64px;
    height: 64px;
  }

  a {
    width: 100%;
    font-size: 20px;
    font-family: "YouSheBiaoTiHei";
    font-weight: 400;
    color: rgba(255,255,255,0.4);
    &.actived {
      background: transparent;
      position: relative;
      color: #fff;
      &::before{
        position: absolute;
        top: -100%;
        left: -33px;
        display:inline-block;
        content: '';
        height: 84px;
        z-index: -1;
        width: 140px;
        padding: 20px 0;
        background: url("/resource/v1/ue5-sn-migrate/assets/images/sn/nav-bg.png") no-repeat;
        background-size: 100% 100%;
      }
      &.ml-custom::before{
        margin-left: 10px;
      } 

    }
  }

  .activeLine {
    display: flex;

    .box1 {
      width: 30px;
      height: 5px;
      margin: auto;
      border: 1px solid rgba(255,255,255,0);
      transform: skewX(-30deg);
      /*将盒子相对于X轴选择30度*/
      background-color: #7BADFF;

    }

    .box2 {
      width: 30px;
      height: 5px;
      border: 1px solid rgba(255,255,255,0);
      transform: skewX(30deg);
      background-color: #7BADFF;
      margin-top: -1px;
      margin-left: -10px;
      border-right: none;
    }

    .box3 {
      width: 26px;
      height: 5px;
      margin: auto;
      border: 1px solid black;
      transform: skewX(-30deg);
      /*将盒子相对于X轴选择30度*/
      background-color: transparent;
      border: 1px solid rgba(148,186,249,0.5);
    }

  }
}
</style>
