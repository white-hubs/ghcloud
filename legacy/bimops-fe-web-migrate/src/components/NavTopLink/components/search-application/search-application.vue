<template>
  <img class="icon" :src="IconSearch" @click="showSearchModal">
  <a-modal v-model:visible="showSearch" title="Basic Modal" :footer="null" class="cube-application-search-modal">
    <a-input v-model:value="searchValue" size="large" placeholder="搜索" ref="searchInputRef" @change="fetchData">
      <template #prefix>
        <search-outlined style="font-size: 20px;" v-if="!state.fetching"/>
        <loading-outlined style="font-size: 20px;" v-else/>
      </template>
    </a-input>
    <div class="search-res">
      <a-empty v-if="!state.value.length"></a-empty>
      <div class="search-res-items" v-else>
        <div class="item" v-for="item in state.value" :key="item.id" @click="handleSelect(item)">
          <a-image
            :preview="false"
            :src="item?.icon"
            :fallback="fallback"
          />
          <span>{{ item.name }}</span>
          <div class="arrow">
            <swap-right-outlined />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';
import { SearchOutlined,LoadingOutlined,SwapRightOutlined } from '@ant-design/icons-vue';
const IconSearch = '/resource/v1/bimops-fe-web-migrate/icons/image/icon-search.png'
import lodash from "lodash"
import { useChildApplication } from '@/hooks/use-child-application';
import type { ApplicationPageVO } from '@ghcloud/cube-ouaa-service';
import { fallback } from '@/config.js'
import { pinyin } from 'pinyin-pro'

const childApplication = useChildApplication()
const showSearch = ref(false)
const searchValue = ref('')
const searchInputRef = ref()
const state = reactive<{
  value: ApplicationPageVO[];
  fetching: boolean;
}>({
  value: [],
  fetching: false,
});

type AppIndexItem = {
  id: string | number;
  name: string;
  icon?: string;
  raw: ApplicationPageVO;
  pinyinFull: string;
  pinyinInitial: string;
}
const appIndex = ref<AppIndexItem[]>([])

/** 规范化关键词 */
function normalizeKeyword(keyword: string): string {
  return (keyword || '').trim().toLowerCase()
}

/** 生成拼音索引 */
function toPinyinIndex(name: string): { pinyinFull: string; pinyinInitial: string } {
  const arr = pinyin(name, { toneType: 'none', type: 'array' }) as string[]
  const full = arr.join(' ').toLowerCase()
  const initial = arr.map(s => s?.[0] || '').join('').toLowerCase()
  return { pinyinFull: full, pinyinInitial: initial }
}

/** 子序列模糊匹配 */
function fuzzyMatch(target: string, query: string): boolean {
  const t = (target || '').toLowerCase()
  const q = (query || '').toLowerCase()
  if (!q) return false
  let i = 0
  for (const c of q) {
    i = t.indexOf(c, i)
    if (i === -1) return false
    i++
  }
  return true
}

/** 构建应用检索索引 */
function buildSearchIndex(): AppIndexItem[] {
  const list = getAllApplication()
  return list.map(app => {
    const name = app.name || ''
    const { pinyinFull, pinyinInitial } = toPinyinIndex(name)
    return {
      id: (app as any).id,
      name,
      icon: (app as any).icon,
      raw: app,
      pinyinFull,
      pinyinInitial
    }
  })
}

/** 执行检索（中文/拼音/首字母/模糊） */
function doSearch(keyword: string) {
  const k = normalizeKeyword(keyword)
  if (!k) {
    state.value = appIndex.value.map(e => e.raw)
    return
  }
  const res: ApplicationPageVO[] = []
  for (const item of appIndex.value) {
    const nameHit = item.name.includes(keyword)
    const pinyinFullHit = item.pinyinFull.includes(k)
    const pinyinInitialHit = item.pinyinInitial.includes(k)
    const fuzzyHit = fuzzyMatch(item.name, k) || fuzzyMatch(item.pinyinFull, k)
    if (nameHit || pinyinFullHit || pinyinInitialHit || fuzzyHit) {
      res.push(item.raw)
    }
  }
  state.value = res
}
let lastFetchId = 0;
const fetchData = lodash.debounce(() => {
  lastFetchId += 1;
  const fetchId = lastFetchId;
  state.fetching = true;
  state.value = [];
  if (fetchId !== lastFetchId) {
    return;
  }
  setTimeout(() => {
    doSearch(searchValue.value || '')
    state.fetching = false;
  }, 100);
}, 300);

function getAllApplication() {
  return childApplication.applicationGroup.map(group=>{
    return group.applicationPageVOS
  }).flat()
}

/** 展示搜索弹窗并初始化索引 */
function showSearchModal() {
  searchValue.value = ''
  appIndex.value = buildSearchIndex()
  state.value = appIndex.value.map(e => e.raw)
  showSearch.value = true
  nextTick(() => {
    // @ts-ignore
    searchInputRef.value && searchInputRef.value.focus()
  })
}

async function handleSelect(app:ApplicationPageVO){
  childApplication.toChildApplication(app)
  showSearch.value = false
}
</script>
<style lang="less" scoped>
.icon {
  width: 18px;
  height: 18px;
  margin-right: 20px;
  cursor: pointer;
  filter: brightness(100)
}
</style>
<style lang="less">
.cube-application-search-modal {

  .ant-modal-header,
  .ant-modal-close {
    display: none;
  }

  .ant-modal-body {
    padding: 12px;
    background-color: #fafafa;
  }

  .search-res{
    width: 100%;
    max-height: 488px;
    min-height: 94px;
    overflow-y: auto;
    margin-top: 12px;
    &::-webkit-scrollbar {
      width: 3px !important;
    }
  }
  .search-res-items{
    .item{
      margin-bottom: 5px;
      box-sizing: border-box;
      padding: 0 10px;
      display: flex;
      align-items: center;
      height: 56px;
      background-color: #fff;
      position: relative;
      cursor: pointer;
      &:hover{
        background-color: var(--cube-theme-var--primary-color-hover);
        color: #fff;
        .arrow{
          display: block;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }
      .ant-image{
        height: 70%;
        margin-right: 20px;
        .ant-image-img{
          height: 100%;
        }
      }
      .arrow{
        display: none;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 20px
      }
    }
  }
}
</style>