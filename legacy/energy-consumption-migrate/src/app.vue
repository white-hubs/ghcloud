<template>
  <ConfigProvider prefix-cls="energy" :locale="zhCN">
    <CLayout />
  </ConfigProvider>
</template>
<script setup lang="ts">
import CLayout from '@/views/layout/index.vue'
import { ConfigProvider } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
</script>
<style>
*,:before,:after {
  --un-rotate: 0;
  --un-rotate-x: 0;
  --un-rotate-y: 0;
  --un-rotate-z: 0;
  --un-scale-x: 1;
  --un-scale-y: 1;
  --un-scale-z: 1;
  --un-skew-x: 0;
  --un-skew-y: 0;
  --un-translate-x: 0;
  --un-translate-y: 0;
  --un-translate-z: 0;
  --un-scroll-snap-strictness: proximity;
  --un-border-spacing-x: 0;
  --un-border-spacing-y: 0;
  --un-ring-offset-shadow: 0 0 rgb(0 0 0 / 0);
  --un-ring-shadow: 0 0 rgb(0 0 0 / 0);
  --un-shadow: 0 0 rgb(0 0 0 / 0);
  --un-ring-offset-width: 0px;
  --un-ring-offset-color: #fff;
  --un-ring-width: 0px;
  --un-ring-color: rgb(147 197 253 / .5);
}

::backdrop {
  --un-rotate: 0;
  --un-rotate-x: 0;
  --un-rotate-y: 0;
  --un-rotate-z: 0;
  --un-scale-x: 1;
  --un-scale-y: 1;
  --un-scale-z: 1;
  --un-skew-x: 0;
  --un-skew-y: 0;
  --un-translate-x: 0;
  --un-translate-y: 0;
  --un-translate-z: 0;
  --un-scroll-snap-strictness: proximity;
  --un-border-spacing-x: 0;
  --un-border-spacing-y: 0;
  --un-ring-offset-shadow: 0 0 rgb(0 0 0 / 0);
  --un-ring-shadow: 0 0 rgb(0 0 0 / 0);
  --un-shadow: 0 0 rgb(0 0 0 / 0);
  --un-ring-offset-width: 0px;
  --un-ring-offset-color: #fff;
  --un-ring-width: 0px;
  --un-ring-color: rgb(147 197 253 / .5);
}

.visible {
  visibility: visible
}

.absolute {
  position: absolute
}

.fixed {
  position: fixed
}

.relative {
  position: relative
}

.grid {
  display: grid
}

.my-10px {
  margin-top: 10px;
  margin-bottom: 10px
}

.ml-10px {
  margin-left: 10px
}

.ml-15px {
  margin-left: 15px
}

.ml-20px {
  margin-left: 20px
}

.ml-3px {
  margin-left: 3px
}

.ml-5px\! {
  margin-left: 5px!important
}

.ml-6px {
  margin-left: 6px
}

.ml-90px {
  margin-left: 90px
}

.mr-10px {
  margin-right: 10px
}

.mr-15px {
  margin-right: 15px
}

.mr-15px\! {
  margin-right: 15px!important
}

.mr-5px {
  margin-right: 5px
}

.mr-6px {
  margin-right: 6px
}

.mt-10px {
  margin-top: 10px
}

.mt-15px,[mt-15px=""] {
  margin-top: 15px
}

.mt-30px {
  margin-top: 30px
}

.mt-5px {
  margin-top: 5px
}

.mt2 {
  margin-top: .5rem
}

.box-border {
  box-sizing: border-box
}

.inline {
  display: inline
}

.block {
  display: block
}

.inline-block {
  display: inline-block
}

.hidden {
  display: none
}

.\!w-180px {
  width: 180px!important
}

.\!w-240px {
  width: 240px!important
}

.\!w-280px {
  width: 280px!important
}

.h-100\% {
  height: 100%
}

.h-180px {
  height: 180px
}

.h-204px {
  height: 204px
}

.h-20px {
  height: 20px
}

.h-230px {
  height: 230px
}

.h-240px {
  height: 240px
}
.min-h-270{
  min-height: 270px;
}

.h-250px {
  height: 250px
}

.h-300px {
  height: 300px
}

.h-392px {
  height: 392px
}

.h-400px {
  height: 400px
}

.h-450px {
  height: 450px
}

.h-460px {
  height: 460px
}

.h-49\% {
  height: 49%
}

.h-50px {
  height: 50px
}

.h-600px {
  height: 600px
}

.h-650px {
  height: 650px
}

.h-70px {
  height: 70px
}

.h-7px {
  height: 7px
}

.h-84px {
  height: 84px
}

.h3 {
  height: .75rem
}

.w-100\% {
  width: 100%
}

.w-100px {
  width: 100px
}

.w-13\% {
  width: 13%
}

.w-15\% {
  width: 15%
}

.w-150px {
  width: 150px
}

.w-167px {
  width: 167px
}

.w-20px {
  width: 20px
}

.w-278px {
  width: 278px
}

.w-30\% {
  width: 30%
}

.w-300px {
  width: 300px
}

.w-315px {
  width: 315px
}

.w-35\% {
  width: 35%
}

.w-40\% {
  width: 40%
}
.w-49\% {
  width: 49%
}

.w-50\% {
  width: 50%
}

.w-500px {
  width: 500px
}

.w-60\% {
  width: 60%
}

.w-60px {
  width: 60px
}

.w-65\% {
  width: 65%
}

.w-70\% {
  width: 70%
}

.w-83\% {
  width: 83%
}

.w-87\% {
  width: 87%
}

.flex {
  display: flex
}

.flex-row {
  flex-direction: row
}
.flex-1{
  flex: 1;
}

.flex-wrap {
  flex-wrap: wrap
}

.transform {
  transform: translate(var(--un-translate-x)) translateY(var(--un-translate-y)) translateZ(var(--un-translate-z)) rotate(var(--un-rotate)) rotateX(var(--un-rotate-x)) rotateY(var(--un-rotate-y)) rotate(var(--un-rotate-z)) skew(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z))
}

.cursor-pointer {
  cursor: pointer
}

.resize {
  resize: both
}

.items-center {
  align-items: center
}

.justify-end {
  justify-content: flex-end
}

.justify-between {
  justify-content: space-between
}

.justify-around {
  justify-content: space-around
}

.justify-evenly {
  justify-content: space-evenly
}

.overflow-auto {
  overflow: auto
}

.overflow-hidden {
  overflow: hidden
}

.overflow-x-auto {
  overflow-x: auto
}

.overflow-x-hidden {
  overflow-x: hidden
}

.overflow-y-auto {
  overflow-y: auto
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.break-keep {
  word-break: keep-all
}

.border {
  border-width: 1px
}

.rd-10px {
  border-radius: 10px
}

.rd-50\% {
  border-radius: 50%
}

.bg-\#1890ff {
  --un-bg-opacity: 1;
  background-color: rgb(24 144 255 / var(--un-bg-opacity))
}

.bg-\#F6F6F8 {
  --un-bg-opacity: 1;
  background-color: rgb(246 246 248 / var(--un-bg-opacity))
}

.bg-\#fafafa {
  --un-bg-opacity: 1;
  background-color: rgb(250 250 250 / var(--un-bg-opacity))
}

.bg-\#fff {
  --un-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--un-bg-opacity))
}

.p-10px {
  padding: 10px
}

.p-15px {
  padding: 15px
}

.p-5px {
  padding: 5px
}

.px,[px=""] {
  padding-left: 1rem;
  padding-right: 1rem
}

.px-15px {
  padding-left: 15px;
  padding-right: 15px
}

.pb1 {
  padding-bottom: .25rem
}

.pl-10px {
  padding-left: 10px
}
.pt-10px {
  padding-top: 10px
}

.pie {
  padding-inline-end:1rem}

.text-center {
  text-align: center
}

[align~=baseline] {
  vertical-align: baseline
}

.text-12px {
  font-size: 12px
}

.text-14px {
  font-size: 14px
}

.text-15px\! {
  font-size: 15px!important
}

.text-16px {
  font-size: 16px
}

.text-18px {
  font-size: 18px
}

.text-32px {
  font-size: 32px
}

.color-\#646566 {
  --un-text-opacity: 1;
  color: rgb(100 101 102 / var(--un-text-opacity))
}

.color-\#758196 {
  --un-text-opacity: 1;
  color: rgb(117 129 150 / var(--un-text-opacity))
}

.color-\#909cb0 {
  --un-text-opacity: 1;
  color: rgb(144 156 176 / var(--un-text-opacity))
}

.color-\#979899 {
  --un-text-opacity: 1;
  color: rgb(151 152 153 / var(--un-text-opacity))
}

.color-\#999999 {
  --un-text-opacity: 1;
  color: rgb(153 153 153 / var(--un-text-opacity))
}

.color-\#9BA2AB {
  --un-text-opacity: 1;
  color: rgb(155 162 171 / var(--un-text-opacity))
}

.color-\#F53F3F {
  --un-text-opacity: 1;
  color: rgb(245 63 63 / var(--un-text-opacity))
}

.color-\#fff {
  --un-text-opacity: 1;
  color: rgb(255 255 255 / var(--un-text-opacity))
}

.color-red {
  --un-text-opacity: 1;
  color: rgb(248 113 113 / var(--un-text-opacity))
}

.font-400 {
  font-weight: 400
}

.font-600,.font-semibold {
  font-weight: 600
}

.font-700 {
  font-weight: 700
}

.font-900 {
  font-weight: 900
}

.tab {
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4
}

.outline {
  outline-style: solid
}

.blur {
  --un-blur: blur(8px);
  filter: var(--un-blur) var(--un-brightness) var(--un-contrast) var(--un-drop-shadow) var(--un-grayscale) var(--un-hue-rotate) var(--un-invert) var(--un-saturate) var(--un-sepia)
}

.transition {
  transition-property: color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  transition-duration: .15s
}

</style>