<template>
  <div class="nav-box">
    <div class="nav-item" :style="props.navItem.disabled ? 'cursor: not-allowed;' : ''" @mouseenter="onMouseenter"
      @mouseleave="onMouseleave" :class="[props.navItem.id === props.activedId ? 'actived' : '']"
      @click="clickNav(props.navItem, 1)">
      <img :class="[props.navItem.id === props.activedId ? 'activation-img' : '']" :src="props.navItem.fileVO ? props.navItem.fileVO.path : defaultImg" alt="" />
      <span class="item-name">{{ props.navItem.name }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SceneDataType } from '@/api/models/mdata';
const defaultImg = '/resource/v1/ue5-migrate/assets/images/nav/default-img.png'
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  navItem: SceneDataType;
  activedId: string
}>(), {})
const emits = defineEmits(['clickNav', 'hoverNav', 'mouseleaveNav'])


/**
 * 点击菜单事件
 * @param nav 菜单数据
 * @param lv 层级
 */
function clickNav(nav: SceneDataType, lv: number): void {
  emits("clickNav", nav, lv);
}

const onMouseenter = () => {
  emits("hoverNav", props.navItem);
}

const onMouseleave = () => {
  setTimeout(() => {
    emits("mouseleaveNav", props.navItem);
  }, 0);
}

</script>
<style lang="less" scoped>
.nav-box{
  width: 120px;
  height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .nav-item {
    // width: calc(100% / 6) !important;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    text-align: center;
    z-index: 100;
    width: 120px;
    height: 30px;
    background-image: url('/resource/v1/ue5-migrate/assets/images/nav/nav-police-item.png');
    background-size: 100%100%;
    position: relative;
    transition: all 0.3s ease-in;
  
  
    img {
      width: 16px;
      height: 18px;
      position: absolute;
      transform: translateY(-50%);
      top: 45%;
      left: 10px;
    }
  
    .item-name {
      width: calc(100% - 44px);
      font-size: 18px;
      font-family: "YouSheBiaoTiHei";
      font-weight: 400;
      line-height: 30px;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-image: -webkit-linear-gradient(bottom, #E7F2FF, #AFCEF4);
      position: absolute;
      left: 33px;
      background-color: red;
      top: 0;
    }
    .activation-img{
      // position: absolute;
      top: 20%;
      width: 20px;
      height: 35px;
    }
    &.actived {
      background-image: url('/resource/v1/ue5-migrate/assets/images/nav/nav-item-police-actived.png');
  
      .item-name {
        color: #fff;
        background-image: -webkit-linear-gradient(bottom, #fff, #fff);
      }
  
      img {
        filter: brightness(0) invert(1)
      }
    }
  }
}

</style>
<style lang="less">
.business-nav-dropdown {
  min-width: unset !important;

  ul {
    background: linear-gradient(180deg, rgba(9, 21, 35, 0.3) 0%, rgba(9, 21, 35, 0.6) 100%);
    border-radius: 8px;
  }

  .ant-dropdown-menu-title-content {
    display: flex;
    align-items: center;

    span {
      font-size: 14px;
      font-weight: 500;
      text-shadow: 0px 0px 3px #3D92FA;
      color: #D9E7FF;
    }

    img {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
  }

  .ant-dropdown-menu-item:hover,
  .ant-dropdown-menu-submenu-title:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
</style>