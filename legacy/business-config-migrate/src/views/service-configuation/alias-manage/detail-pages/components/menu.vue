<template>
  <div class="menu-sort" :id="sortId">
    <div class="menu-item" v-for="item in menus" :key="item.code" :data-code="item.code">
      <div class="menu-self" :style="{ paddingLeft: (level+1) * 16 + 'px' }">
        <div class="menu-arrow">
          <template v-if="item.children?.length">
            <CaretRightOutlined
              :style="{ transform: expandCodes.includes(item.code) ? 'rotate(90deg)' : '',transition:'all 0.1s' }"
              @click="handleExpand(item.code)" />
          </template>
        </div>
        <div class="menu-item-title" style="width: calc(25% - 50px);">
          <span>{{ item.name }}</span>
        </div>
        <div class="menu-item-icon" style="width: 25%;">
          <span v-if="props.terminal==='bimops-manage-web'">--</span>
          <img :src="item.alias?.icon||item.icon" alt="" v-else />
        </div>
        <div class="menu-item-title" style="width: 25%;">
          <span>{{ item.alias?.name||'--' }}</span>
        </div>
        <div class="menu-item-title" style="width: 25%;">
          <a-button type="link" @click="handleEdit(item)">编辑</a-button>
          <div class="menu-drag">
            <svg t="1729763738155" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="4317" width="200" height="200">
              <path d="M362.666667 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4318"></path>
              <path d="M661.333333 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4319"></path>
              <path d="M362.666667 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4320"></path>
              <path d="M661.333333 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4321"></path>
              <path d="M362.666667 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4322"></path>
              <path d="M661.333333 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z" fill="#666666" p-id="4323"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="menu-item-child" v-show="expandCodes.includes(item.code)"
        v-if='item.children && item.children.length > 0'>
        <Menu :menuData="item.children" :level="props.level + 1" :terminal='props.terminal' :parentCode="item.code"
          @update:menuData="updateMenuData" />
      </div>
    </div>
  </div>
  <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" centered :confirmLoading='confirmLoading' @ok="onConfirm">
    <a-form :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
      <a-form-item label="菜单初始名称">
        {{ formState.initialName }}
      </a-form-item>
      <a-form-item label="菜单别名" prop="name">
        <a-input v-model:value="formState.name" placeholder="请输入应用别名" :maxLength="10" />
      </a-form-item>
      <a-form-item label="菜单图标" prop="icon" v-if="props.terminal!=='bimops-manage-web'">
        <g-upload :sceneCode="GLOBAL_SCENE_CODE.mData" :file="fileList" :max="1" :size="500" @update:value="uploadIcon" businessKey="mdata" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
import { CaretRightOutlined } from '@ant-design/icons-vue';
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import Menu from './menu.vue'
import Sortable from 'sortablejs'
import { cubeFileService } from '@/api/service'
import { max } from 'lodash';
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
const emits = defineEmits(['update:menuData'])
const props = defineProps({
  // 菜单数据
  menuData: {
    type: Array,
    default: () => [],
  },
  level: {
    type: Number,
    default: 0,
  },
  terminal: {
    type: String,
    default: '',
  },
  parentCode: {
    type: String,
    default: '',
  }
})
const modalVisible = ref(false)
const confirmLoading = ref(false)
const modalTitle = ref('')
const fileList = ref([])
const formState = reactive({
  initialName: '',
  code: '',
  name: '',
  icon: '',
})
const sortId = guid()
const menus = resetMenuSort(props.menuData ?? [])
const expandCodes = ref([])
const handleExpand = (code) => {
  if (expandCodes.value.includes(code)) {
    expandCodes.value = expandCodes.value.filter(e => e !== code)
  } else {
    expandCodes.value.push(code)
  }
}
let sortableInstance = null

onMounted(async () => {
  await nextTick()
  sortableInstance = new Sortable(document.getElementById(sortId), {
    animation: 150,
    fallbackOnBody: true,
    swapThreshold: 0.65,
    handle: ".menu-drag",
    onEnd: function (evt) {
      const { oldIndex, newIndex } = evt;
      move(menus, oldIndex, newIndex)
      emits("update:menuData", menus, props.parentCode)
    },
  });
})

onBeforeUnmount(() => {
  sortableInstance?.destroy()
})

function resetMenuSort(menu) {
  // 先排序
  menu.forEach((item) => {
    item.sort = item.alias?.sort || item.sort
  })
  menu.sort((a, b) => a.sort - b.sort)
  // 再重置sort值
  menu.forEach((item, index) => {
    item.sort = index+1
  })
  if (menu.children && menu.children.length) {
    menu.children = resetMenuSort(menu.children)
  }
  return menu
}

function updateMenuData(menuData, parentCode) {
  const find = menus.find(item => item.code === parentCode)
  if (find) {
    find.children = menuData
  }
}

function getMenuInfo(menuData) {
  const aliasData = []
  if (!menuData) {
    menuData = menus
  }
  menuData.forEach(e => {
    aliasData.push({
      icon: e.alias?.icon ?? '',
      name: e.alias?.name ?? '',
      code: e.code,
      sort: e.sort,
    })
    if (e.children && e.children.length) {
      aliasData.push(...getMenuInfo(e.children))
    }
  })
  return aliasData
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function move(list, oldIndex, newIndex) {
  list.splice(newIndex, 0, list.splice(oldIndex, 1)[0])
  list.forEach((item, index) => {
    item.sort = index
  })
}

function handleEdit(row) {
  confirmLoading.value = false
  formState.initialName = row.name
  formState.code = row.code
  formState.name = row.alias?.name ?? ''
  formState.icon = row.alias?.icon ?? row.icon
  fileList.value = [{
    uid: '',
    name: formState.icon,
    status: 'done',
    url: formState.icon,
  }]
  modalTitle.value = row.alias?.name || row.name
  modalVisible.value = true
}

async function uploadIcon(fileId) {
  const res = await cubeFileService.getFileInfo(fileId)
  if (res.path) {
    formState.icon = res.path
  }
}

function onConfirm() {
  const find = menus.find(e=>e.code===formState.code)
  if(find){
    find.alias.name = formState.name
    find.alias.icon = formState.icon
  }
  modalVisible.value = false
}


defineExpose({
  getMenuInfo
})

</script>
<style lang="less" scoped>
.menu-item {
  width: 100%;
  background-color: white;

  .menu-self {
    position: relative;
    display: flex;
    align-items: center;
    height: 50px;
    box-sizing: border-box;
    padding: 16px;

    &::after {
      position: absolute;
      content: '';
      bottom: 0;
      width: 100%;
      left: 50%;
      transform: translateX(-50%);
      height: 1px;
      background-color: #e5e5e5
    }

    .menu-arrow {
      width: 50px;
      text-align: center
    }

    .menu-drag {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      overflow: hidden;

      svg {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }
  }

  .menu-item-title {
    display: flex;
    align-items: center;

    :deep(.ant-btn-link) {
      padding-left: 0;
    }
  }
  .menu-item-icon{
    img{
      width: 35px;
      height: 35px;
    }
  }

  .menu-item-child {
    box-sizing: border-box;
  }
}
</style>