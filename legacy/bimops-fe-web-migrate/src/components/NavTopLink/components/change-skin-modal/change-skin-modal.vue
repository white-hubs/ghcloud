<template>
  <img class="icon" :src="IconSkin" @click="settingVisible = true">
  <a-modal v-model:visible="settingVisible" title="样式选择" width="500px" :footer="null" centered>
    <a-form>
      <a-form-item label="主题颜色">
        <div class="color-list">
          <div class="item" v-for="item in SKIN_LIST" :key="item.name" @click="changeTheme(item)"
            :style="{backgroundColor:item.color.primaryColor}"
            :class="{'active':cubeSiteSetting.skinColor.name === item.name}">
            <span>{{ item.name }}</span>
            <div class="active-select">
              <CheckOutlined />
            </div>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="系统布局">
        <div class="layout-list">
          <div class="item" v-for="item in layoutList" :key="item.value"
            :class="{'active':cubeSiteSetting.layout.value === item.value}"
            @click="changeLayout({ value: item.value ,name: item.name , menuFold:item.menuFold})">
            <component :is="item.svg" class="svg-icon"></component>
            <span>{{ item.name }}</span>
            <div class="active-select">
              <CheckOutlined style="color: white;" />
            </div>
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import Layout_1 from './components/layout-1.vue'
import Layout_2 from './components/layout-2.vue'
import { useSiteSetting } from '../../../../hooks/use-site-setting';
import { themeManager, antd3LegacyThemeManager } from '@ghcloud/cube-theme'
import { CheckOutlined } from '@ant-design/icons-vue';
const IconSkin = '/resource/v1/bimops-fe-web-migrate/icons/image/icon-skin.png'

const { 
  LAYOUT_LIST,
  SKIN_LIST,
  changeTheme,
  changeLayout,
  cubeSiteSetting 
} = useSiteSetting()

const layoutList = [
  {
    ...LAYOUT_LIST[0],
    svg: h(Layout_1)
  },
  {
    ...LAYOUT_LIST[1],
    svg: h(Layout_2)
  },
]
const settingVisible = ref(false)

onMounted(()=>{
  themeManager.mount()
  antd3LegacyThemeManager.mount()
})
</script>
<style lang="less" scoped>
.icon{
  width: 22px;
  height: 22px;
  cursor: pointer;
  filter:brightness(100)
}
.color-list {
  display: flex;
  align-items: center;

  .item {
    width: 66px;
    height: 30px;
    border-radius: 4px;
    margin-right: 14px;
    text-align: center;
    line-height: 30px;
    font-size: 13px;
    color: #fff;
    position: relative;
    margin-bottom: 20px;
    cursor: pointer;
    &.active {
      .active-select {
        display: flex;
      }
    }

    .active-select {
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.60);
      border-radius: 100px 0px 4px 0px;
      display: none;
      position: absolute;
      right: 0;
      bottom: 0;
      align-items: center;
      justify-content: center;

      .anticon {
        margin-left: 2px;
        margin-top: 2px
      }
    }
  }
}
.layout-list{
  display: flex;
  align-items: center;
  .item{
    width: 80px;
    height: 66px;
    background: #f0f2f7;
    border-radius: 4px;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    margin-right: 14px;
    box-sizing: border-box;
    padding: 5px;
    font-size: 10px;
    color: #8a95a4;
    position: relative;
    cursor: pointer;
    span{
      transform: translateY(3px);
    }
    :deep(.svg-icon){
      width: 100%;
    }

    &.active {
      .active-select {
        display: flex;
      }
    }

    .active-select {
      width: 20px;
      height: 20px;
      background: var(--cube-theme-var--primary-color-outline);
      border-radius: 100px 0px 4px 0px;
      display: none;
      position: absolute;
      right: 0;
      bottom: 21px;
      align-items: center;
      justify-content: center;
      .anticon {
        margin-left: 2px;
        margin-top: 2px;
      }
    }
  }
}
</style>